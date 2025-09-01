# Dynamic Client Registration for SMART on FHIR

This document describes the implementation of OAuth2 Dynamic Client Registration Protocol for SMART on FHIR apps, as implemented in the Smart Forms application.

## Overview

The Smart Forms application now supports dynamic client registration, allowing it to automatically register with FHIR servers that support the OAuth2 Dynamic Client Registration Protocol. This eliminates the need for manual client registration and provides better compatibility with various SMART App Hosts.

## Features

- **Automatic Client Registration**: Automatically registers with FHIR servers that support dynamic registration
- **Backward Compatibility**: Falls back to fixed client IDs for servers that don't support dynamic registration
- **Configurable Issuers**: Easy configuration of issuer-specific settings in a local configuration file
- **Fallback Support**: Graceful fallback to default client ID if dynamic registration fails
- **Metadata Discovery**: Automatic discovery of registration endpoints from server metadata

## Configuration

### Environment Variables

Add these environment variables to your `.env` file:

```bash
# Enable/disable dynamic client registration (default: true)
VITE_ENABLE_DYNAMIC_CLIENT_REGISTRATION=true

# Enable fallback to default client ID if dynamic registration fails (default: true)
VITE_DYNAMIC_REGISTRATION_FALLBACK_ENABLED=true

# Additional redirect URIs for client registration (comma-separated)
VITE_ADDITIONAL_REDIRECT_URIS=https://example.com/callback,https://staging.example.com/callback
```

### Issuer Configuration

Configure issuer-specific settings in `src/config/issuerConfig.ts`:

```typescript
export const issuerConfigs: IssuerConfig[] = [
  // Server that supports dynamic registration
  {
    issuer: 'https://launch.smarthealthit.org/v/r4/fhir',
    supportsDynamicRegistration: true,
    registrationEndpoint: 'https://launch.smarthealthit.org/v/r4/fhir/register',
    useFixedClientId: false
  },
  
  // Server that uses fixed client ID
  {
    issuer: 'https://your-ehr.com/fhir',
    supportsDynamicRegistration: false,
    useFixedClientId: true,
    fixedClientId: 'your-pre-registered-client-id'
  }
];
```

## How It Works

### 1. Launch Process

When a SMART app launch is initiated:

1. The app receives `iss` (issuer) and `launch` parameters
2. It checks the local issuer configuration
3. If dynamic registration is supported, it attempts to register
4. If successful, it uses the dynamically assigned client ID
5. If not supported or registration fails, it falls back to the configured behavior

### 2. Client Registration Flow

For servers supporting dynamic registration:

1. **Discovery**: Check server metadata at `/.well-known/smart-configuration`
2. **Registration**: POST to the registration endpoint with client metadata
3. **Response**: Receive assigned `client_id` and optional `client_secret`
4. **Authorization**: Proceed with OAuth2 authorization using the new client ID

### 3. Fallback Behavior

If dynamic registration is not supported or fails:

1. Use fixed client ID if configured for the issuer
2. Fall back to the default `LAUNCH_CLIENT_ID` environment variable
3. Log warnings for debugging purposes

## Client Metadata

The application registers with the following metadata:

```json
{
  "application_type": "web",
  "redirect_uris": [
    "https://your-app.com/launch",
    "https://your-app.com/callback",
    "https://your-app.com/"
  ],
  "scope": "fhirUser online_access openid profile patient/*.read launch",
  "grant_types": ["authorization_code"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "none"
}
```

## Redirect URIs

The application automatically generates redirect URIs based on:

- Current origin (e.g., `https://your-app.com`)
- Common SMART app endpoints (`/launch`, `/callback`, `/`)
- Additional URIs from `VITE_ADDITIONAL_REDIRECT_URIS` environment variable

## Error Handling

The application handles various error scenarios:

- **Network Errors**: Connection failures during registration
- **Server Errors**: HTTP error responses from registration endpoints
- **Validation Errors**: Missing required fields in registration responses
- **Fallback Errors**: Graceful degradation when registration fails

## Debugging

Enable debug logging to see detailed information about the registration process:

```typescript
// Check browser console for:
// - Issuer configuration lookup results
// - Dynamic registration support checks
// - Registration request/response details
// - Fallback behavior information
```

## Security Considerations

- **No Client Secrets**: The app registers as a public client (`token_endpoint_auth_method: "none"`)
- **HTTPS Required**: All communication with registration endpoints must use HTTPS
- **Scope Validation**: Ensure requested scopes match your application's needs
- **Redirect URI Validation**: Only use trusted redirect URIs

## Testing

### Test with SMART Health IT

Use the SMART Health IT launcher for testing dynamic registration:

```
https://launch.smarthealthit.org/launch?iss=https://launch.smarthealthit.org/v/r4/fhir&launch=test
```

### Test with Fixed Client ID

Configure a test issuer with fixed client ID to test fallback behavior.

## Troubleshooting

### Common Issues

1. **Registration Fails**: Check server logs and ensure registration endpoint is accessible
2. **Scope Mismatch**: Verify requested scopes are supported by the server
3. **Redirect URI Issues**: Ensure redirect URIs match server expectations
4. **Network Errors**: Check firewall and network configuration

### Debug Steps

1. Check browser console for error messages
2. Verify issuer configuration in `issuerConfig.ts`
3. Test server metadata endpoint manually
4. Check environment variable configuration

## Future Enhancements

- **Client Secret Management**: Support for confidential clients
- **Token Storage**: Secure storage of client credentials
- **Auto-refresh**: Automatic client registration renewal
- **Metrics**: Registration success/failure tracking

## References

- [OAuth 2.0 Dynamic Client Registration Protocol](https://tools.ietf.org/html/rfc7591)
- [SMART on FHIR App Launch](http://hl7.org/fhir/smart-app-launch/)
- [SMART App Launch Implementation Guide](http://hl7.org/fhir/smart-app-launch/STU2/app-launch.html)


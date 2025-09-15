# Configuration File Mount

Smart Forms supports configuration file mounting for default values, allowing you to set configuration values via a mounted JSON file instead of environment variables.

## Configuration Priority

The application uses the following priority order for configuration values:

1. **Environment Variables** (highest priority - for runtime overrides)
2. **Mounted Config File** (medium priority - for deployment-specific configs)
3. **Default Values** (lowest priority - fallback values)

## Configuration File Format

Create a `config.json` file with the following structure:

```json
{
  "client_id": "smart-forms-client-id",
  "forms_server_url": "https://smartforms.csiro.au/api/fhir",
  "terminology_server_url": "https://tx.ontoserver.csiro.au/fhir",
  "launch_scope": "fhirUser online_access openid profile patient/Condition.rs patient/Observation.rs launch patient/Encounter.rs patient/QuestionnaireResponse.cruds patient/Patient.rs",
  "in_app_populate": true,
  "show_debug_mode": false
}
```

## Usage Examples

### Development (Current Method)

```bash
# Uses environment variables from .env
VITE_LAUNCH_CLIENT_ID=my-dev-client
VITE_FORMS_SERVER_URL=https://my-dev-server.com/fhir
```

### Production with Config File

```bash
# Mount config file
docker run -v ./config:/app/config smart-forms-app
```

### Production with Environment Override

```bash
# Config file provides defaults, env vars override specific values
docker run -v ./config:/app/config -e VITE_LAUNCH_CLIENT_ID=prod-client smart-forms-app
```

### Docker Compose

```yaml
services:
  smart-forms-app:
    image: aehrc/smart-forms-app:1.0
    volumes:
      - ./config:/app/config:ro
    environment:
      # These will override config file values
      VITE_LAUNCH_CLIENT_ID: ${VITE_LAUNCH_CLIENT_ID}
```

## Configuration Values

| Config Key               | Environment Variable    | Default Value                          | Description                        |
| ------------------------ | ----------------------- | -------------------------------------- | ---------------------------------- |
| `client_id`              | `VITE_LAUNCH_CLIENT_ID` | `smart-forms-client-id`                | SMART on FHIR client ID            |
| `forms_server_url`       | `VITE_FORMS_SERVER_URL` | `https://smartforms.csiro.au/api/fhir` | FHIR server URL for questionnaires |
| `terminology_server_url` | `VITE_ONTOSERVER_URL`   | `https://tx.ontoserver.csiro.au/fhir`  | Terminology server URL             |
| `launch_scope`           | `VITE_LAUNCH_SCOPE`     | `fhirUser online_access...`            | SMART on FHIR launch scopes        |
| `in_app_populate`        | `VITE_IN_APP_POPULATE`  | `true`                                 | Enable in-app population           |
| `show_debug_mode`        | `VITE_SHOW_DEBUG_MODE`  | `false`                                | Show debug mode                    |

## Setup Instructions

1. **Create config directory:**

   ```bash
   mkdir -p config
   ```

2. **Copy example config:**

   ```bash
   cp config/config.json.example config/config.json
   ```

3. **Edit config file:**

   ```bash
   nano config/config.json
   ```

4. **Run with Docker Compose:**
   ```bash
   docker-compose up
   ```

## Backward Compatibility

- Existing deployments using environment variables will continue to work unchanged
- Environment variables take precedence over config file values
- If no config file is mounted, the application falls back to environment variables and defaults

## Troubleshooting

- Check that the config file is properly mounted at `/app/config/config.json` in the container
- Verify JSON syntax is valid
- Check container logs for configuration loading messages
- Use environment variables to override specific values if needed


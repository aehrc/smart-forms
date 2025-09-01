/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LAUNCH_SCOPE } from '../../../globals.ts';

export interface ClientRegistrationRequest {
  /** The application type (web, native, etc.) */
  application_type: 'web';
  /** The redirect URIs for the application */
  redirect_uris: string[];
  /** The scopes the application requests */
  scope: string;
  /** The grant types the application supports */
  grant_types: string[];
  /** The response types the application supports */
  response_types: string[];
  /** The token endpoint authentication method */
  token_endpoint_auth_method: 'none';
  /** Additional client metadata */
  [key: string]: any;
}

export interface ClientRegistrationResponse {
  /** The client ID assigned by the authorization server */
  client_id: string;
  /** The client secret (if applicable) */
  client_secret?: string;
  /** The client ID issued timestamp */
  client_id_issued_at?: number;
  /** The client secret expiration timestamp */
  client_secret_expires_at?: number;
  /** Additional server response data */
  [key: string]: any;
}

export interface ClientRegistrationError {
  /** The error code */
  error: string;
  /** The error description */
  error_description?: string;
  /** Additional error information */
  [key: string]: any;
}

/**
 * Default client registration request for SMART on FHIR apps
 */
export const defaultClientRegistrationRequest: Omit<ClientRegistrationRequest, 'redirect_uris'> = {
  application_type: 'web',
  scope: LAUNCH_SCOPE,
  grant_types: ['authorization_code'],
  response_types: ['code'],
  token_endpoint_auth_method: 'none'
};

/**
 * Perform dynamic client registration with an authorization server
 * @param registrationEndpoint The registration endpoint URL
 * @param redirectUris The redirect URIs for the application
 * @param additionalMetadata Additional metadata to include in the registration
 * @returns Promise resolving to the client registration response
 */
export async function registerClient(
  registrationEndpoint: string,
  redirectUris: string[],
  additionalMetadata: Record<string, any> = {}
): Promise<ClientRegistrationResponse> {
  const requestBody: ClientRegistrationRequest = {
    ...defaultClientRegistrationRequest,
    redirect_uris: redirectUris,
    ...additionalMetadata
  };

  try {
    const response = await fetch(registrationEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData: ClientRegistrationError = await response.json();
      throw new Error(`Client registration failed: ${errorData.error} - ${errorData.error_description || 'Unknown error'}`);
    }

    const responseData: ClientRegistrationResponse = await response.json();
    
    // Validate required fields
    if (!responseData.client_id) {
      throw new Error('Client registration response missing required client_id field');
    }

    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Client registration failed: ${error}`);
  }
}

/**
 * Get the current application's redirect URIs
 * This should be updated based on your application's deployment configuration
 * @returns Array of redirect URIs
 */
export function getCurrentRedirectUris(): string[] {
  const currentOrigin = window.location.origin;
  
  // Add common redirect URIs for SMART apps
  const redirectUris = [
    `${currentOrigin}/launch`, // Main launch endpoint
    `${currentOrigin}/callback`, // OAuth callback endpoint
    `${currentOrigin}/`, // Root endpoint with trailing slash
    `${currentOrigin}` // Root endpoint without trailing slash (for Aidbox compatibility)
  ];

  // Add any additional redirect URIs from environment variables
  const additionalUris = import.meta.env.VITE_ADDITIONAL_REDIRECT_URIS;
  if (additionalUris) {
    redirectUris.push(...additionalUris.split(',').map(uri => uri.trim()));
  }

  return redirectUris;
}

/**
 * Check if dynamic client registration is supported by checking the issuer's metadata
 * @param issuerUrl The issuer URL to check
 * @returns Promise resolving to true if dynamic registration is supported
 */
export async function checkDynamicRegistrationSupport(issuerUrl: string): Promise<boolean> {
  try {
    // Try to fetch the issuer's metadata
    const metadataUrl = `${issuerUrl}/.well-known/smart-configuration`;
    const response = await fetch(metadataUrl);
    
    if (!response.ok) {
      return false;
    }

    const metadata = await response.json();
    return !!metadata.registration_endpoint;
  } catch (error) {
    // If we can't fetch metadata, assume dynamic registration is not supported
    console.warn(`Could not fetch metadata from ${issuerUrl}:`, error);
    return false;
  }
}

/**
 * Get the registration endpoint from issuer metadata
 * @param issuerUrl The issuer URL to get metadata from
 * @returns Promise resolving to the registration endpoint or undefined
 */
export async function getRegistrationEndpointFromMetadata(issuerUrl: string): Promise<string | undefined> {
  try {
    const metadataUrl = `${issuerUrl}/.well-known/smart-configuration`;
    const response = await fetch(metadataUrl);
    
    if (!response.ok) {
      return undefined;
    }

    const metadata = await response.json();
    return metadata.registration_endpoint;
  } catch (error) {
    console.warn(`Could not fetch metadata from ${issuerUrl}:`, error);
    return undefined;
  }
}


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

export interface IssuerConfig {
  /** The issuer URL (iss parameter from SMART launch) */
  issuer: string;
  /** Whether this issuer supports dynamic client registration */
  supportsDynamicRegistration: boolean;
  /** The dynamic client registration endpoint (if supported) */
  registrationEndpoint?: string;
  /** Whether to use a fixed client ID for this issuer */
  useFixedClientId?: boolean;
  /** The fixed client ID to use (if useFixedClientId is true) */
  fixedClientId?: string;
  /** Custom redirect URI for this issuer (overrides default) */
  redirectUri?: string;
  /** Additional metadata for this issuer */
  metadata?: Record<string, any>;
}

/**
 * Configuration for different FHIR issuers
 * This file stores issuer-specific configuration for SMART App Launch
 * including whether they support dynamic client registration
 */
export const issuerConfigs: IssuerConfig[] = [
  // Example: SMART Health IT (supports dynamic registration)
  {
    issuer: 'https://launch.smarthealthit.org/v/r4/fhir',
    supportsDynamicRegistration: true,
    registrationEndpoint: 'https://launch.smarthealthit.org/v/r4/fhir/register',
    useFixedClientId: false
  },
  // Example: CSIRO Proxy (uses fixed client ID)
  {
    issuer: 'https://proxy.smartforms.io/v/r4/fhir',
    supportsDynamicRegistration: false,
    useFixedClientId: true,
    fixedClientId: 'smart-forms-client-id'
  },
  // Example: Generic EHR that supports dynamic registration
  {
    issuer: 'https://example-ehr.com/fhir',
    supportsDynamicRegistration: true,
    registrationEndpoint: 'https://example-ehr.com/fhir/register',
    useFixedClientId: false
  },
  {
    issuer: 'https://smartonfhir.aidbox.beda.software/fhir',
    supportsDynamicRegistration: false,  // ❌ Confirmed: no dynamic registration
    useFixedClientId: true,             // ✅ Use the client ID your supervisor created
    fixedClientId: '6cc9bccb-3ae2-40d7-9660-22c99534520b',  // Supervisor's test client
    redirectUri: 'http://localhost:5173'  // Match Aidbox client config (no trailing slash)
  }
];

/**
 * Find issuer configuration by issuer URL
 * @param issuerUrl The issuer URL to look up
 * @returns The issuer configuration or undefined if not found
 */
export function findIssuerConfig(issuerUrl: string): IssuerConfig | undefined {
  return issuerConfigs.find(config => config.issuer === issuerUrl);
}

/**
 * Check if an issuer supports dynamic client registration
 * @param issuerUrl The issuer URL to check
 * @returns True if the issuer supports dynamic registration
 */
export function supportsDynamicRegistration(issuerUrl: string): boolean {
  const config = findIssuerConfig(issuerUrl);
  return config?.supportsDynamicRegistration ?? false;
}

/**
 * Get the registration endpoint for an issuer
 * @param issuerUrl The issuer URL to get the endpoint for
 * @returns The registration endpoint or undefined if not supported
 */
export function getRegistrationEndpoint(issuerUrl: string): string | undefined {
  const config = findIssuerConfig(issuerUrl);
  return config?.registrationEndpoint;
}

/**
 * Check if an issuer should use a fixed client ID
 * @param issuerUrl The issuer URL to check
 * @returns True if the issuer should use a fixed client ID
 */
export function shouldUseFixedClientId(issuerUrl: string): boolean {
  const config = findIssuerConfig(issuerUrl);
  return config?.useFixedClientId ?? false;
}

/**
 * Get the fixed client ID for an issuer
 * @param issuerUrl The issuer URL to get the client ID for
 * @returns The fixed client ID or undefined if not configured
 */
export function getFixedClientId(issuerUrl: string): string | undefined {
  const config = findIssuerConfig(issuerUrl);
  return config?.fixedClientId;
}

/**
 * Get the custom redirect URI for an issuer
 * @param issuerUrl The issuer URL to get the redirect URI for
 * @returns The custom redirect URI or undefined if not configured
 */
export function getCustomRedirectUri(issuerUrl: string): string | undefined {
  const config = findIssuerConfig(issuerUrl);
  return config?.redirectUri;
}

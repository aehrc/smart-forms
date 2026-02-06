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

export interface ConfigFile {
  // FHIR Terminology Server for ValueSet expansion and terminology validation
  terminologyServerUrl: string;

  // Questionnaire-hosting FHIR server
  formsServerUrl: string;

  /* It will be necessary to tweak these variables if you are connecting the app to your own SMART on FHIR enabled CMS/EHR */
  // Default/fallback SMART App Launch client ID, preferably client IDs should be assigned by the server and stored in a separate JSON file to be fetched at runtime (because there is no persistence on this app)
  defaultClientId: string;

  // SMART App Launch scopes, space-separated
  launchScopes: string;

  // URL link to a JS object of a key-value map of issuers to registered client IDs <issuer, client_id>. See https://hl7.org/fhir/smart-app-launch/app-launch.html#step-1-register on SMART registration recommended practices.
  // If this URL doesn't exist, the app will fallback to using `defaultClientId`.
  // Example URL: https://smartforms.csiro.au/smart-config/config.json
  // Example JSON response (`RegisteredClientIdsConfig`):
  // {
  //  "https://proxy.smartforms.io/v/r4/fhir": "a57d90e3-5f69-4b92-aa2e-2992180863c1",
  //  "https://example.com/fhir": "6cc9bccb-3ae2-40d7-9660-22c99534520b"
  // }
  registeredClientIdsUrl: string | null;

  // Controls whether developer-focused messages are shown.
  // Set to false for clinical/production deployments to hide technical messages.
  // Defaults to true if not specified (shows messages for backward compatibility).
  showDeveloperMessages?: boolean;
}

export interface AppConfig extends ConfigFile {
  // A key-value map of issuers to registered client IDs <issuer, client_id>. Retrieved by fetching `registeredClientIdsConfigUrl` if it exists and is valid, otherwise null.
  registeredClientIds: Record<string, string> | null;
}

export const FALLBACK_CONFIG: AppConfig = {
  // From ConfigFile
  terminologyServerUrl: 'https://r4.ontoserver.csiro.au/fhir',
  formsServerUrl: 'https://smartforms.csiro.au/api/fhir',
  defaultClientId: 'a57d90e3-5f69-4b92-aa2e-2992180863c1',
  launchScopes:
    'launch openid fhirUser online_access patient/AllergyIntolerance.cs patient/Condition.cs patient/Encounter.r patient/Immunization.cs patient/Medication.r patient/MedicationStatement.cs patient/Observation.cs patient/Patient.r patient/QuestionnaireResponse.crus user/Practitioner.r launch/questionnaire?role=http://ns.electronichealth.net.au/smart/role/new',
  registeredClientIdsUrl: null,
  showDeveloperMessages: true,
  registeredClientIds: null
};

export function responseIsAppConfig(response: any): response is AppConfig {
  return (
    response &&
    typeof response === 'object' &&
    // Check required properties
    isValidUrl(response.terminologyServerUrl) &&
    isValidUrl(response.formsServerUrl) &&
    typeof response.defaultClientId === 'string' &&
    response.defaultClientId !== '' &&
    typeof response.launchScopes === 'string' &&
    response.launchScopes !== '' &&
    // Check nullable properties
    (response.registeredClientIdsUrl === null || isValidUrl(response.registeredClientIdsUrl)) &&
    (response.registeredClientIds === null ||
      isValidRegisteredClientIds(response.registeredClientIds))
  );
}

export function isValidUrl(value: any): value is string {
  // Check if string starts with http:// or https://
  if (!(typeof value === 'string' && /^https?:\/\/.+/.test(value.trim()))) {
    return false;
  }

  // Check to ensure string can be parsed to URL
  try {
    new URL(value);
  } catch {
    return false;
  }

  return true;
}

// Type predicate: checks if value is Record<string, string>
export function isValidRegisteredClientIds(value: unknown): value is Record<string, string> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return Object.entries(value).every(
    ([key, val]) => typeof key === 'string' && typeof val === 'string'
  );
}

export async function loadConfigFile(): Promise<ConfigFile> {
  const response = await fetch('/config.json');

  if (!response.ok) {
    throw new Error('Failed to load config.json. It might be missing or malformed.');
  }

  return response.json();
}

export async function loadRegisteredClientIds(
  registeredClientIdsUrl: string
): Promise<Record<string, string>> {
  const response = await fetch(registeredClientIdsUrl, {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load JSON response from ${registeredClientIdsUrl}. It might be missing or malformed.`
    );
  }

  return response.json();
}

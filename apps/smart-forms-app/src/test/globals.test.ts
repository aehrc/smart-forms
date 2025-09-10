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

import {
  TERMINOLOGY_SERVER_URL,
  FORMS_SERVER_URL,
  LAUNCH_SCOPE,
  LAUNCH_CLIENT_ID,
  IN_APP_POPULATE
} from '../globals';

describe('globals', () => {
  describe('environment variables with defaults', () => {
    it('should export TERMINOLOGY_SERVER_URL with valid URL', () => {
      expect(typeof TERMINOLOGY_SERVER_URL).toBe('string');
      expect(TERMINOLOGY_SERVER_URL).toMatch(/^https?:\/\//);
      expect(TERMINOLOGY_SERVER_URL.length).toBeGreaterThan(0);
    });

    it('should export FORMS_SERVER_URL with valid URL', () => {
      expect(typeof FORMS_SERVER_URL).toBe('string');
      expect(FORMS_SERVER_URL).toMatch(/^https?:\/\//);
      expect(FORMS_SERVER_URL.length).toBeGreaterThan(0);
    });

    it('should export LAUNCH_SCOPE with comprehensive scope', () => {
      expect(typeof LAUNCH_SCOPE).toBe('string');
      expect(LAUNCH_SCOPE).toContain('fhirUser');
      expect(LAUNCH_SCOPE).toContain('openid');
      expect(LAUNCH_SCOPE).toContain('launch');
      expect(LAUNCH_SCOPE.length).toBeGreaterThan(0);
    });

    it('should export LAUNCH_CLIENT_ID as string', () => {
      expect(typeof LAUNCH_CLIENT_ID).toBe('string');
      expect(LAUNCH_CLIENT_ID.length).toBeGreaterThan(0);
    });

    it('should export IN_APP_POPULATE as boolean', () => {
      expect(typeof IN_APP_POPULATE).toBe('boolean');
    });
  });

  describe('URL validation', () => {
    it('should have valid FHIR endpoint URLs', () => {
      expect(TERMINOLOGY_SERVER_URL).toMatch(/\/fhir$/);
      expect(FORMS_SERVER_URL).toMatch(/\/fhir$/);
    });

    it('should use HTTPS URLs for security', () => {
      expect(TERMINOLOGY_SERVER_URL).toMatch(/^https:/);
      expect(FORMS_SERVER_URL).toMatch(/^https:/);
    });
  });

  describe('SMART on FHIR scope validation', () => {
    it('should include required SMART on FHIR scopes', () => {
      const requiredScopes = ['fhirUser', 'openid', 'launch'];
      requiredScopes.forEach((scope) => {
        expect(LAUNCH_SCOPE).toContain(scope);
      });
    });

    it('should include patient resource permissions', () => {
      expect(LAUNCH_SCOPE).toContain('patient/');
    });

    it('should include QuestionnaireResponse permissions', () => {
      expect(LAUNCH_SCOPE).toContain('QuestionnaireResponse');
    });
  });

  describe('type safety', () => {
    it('should export all values with correct types', () => {
      expect(typeof TERMINOLOGY_SERVER_URL).toBe('string');
      expect(typeof FORMS_SERVER_URL).toBe('string');
      expect(typeof LAUNCH_SCOPE).toBe('string');
      expect(typeof LAUNCH_CLIENT_ID).toBe('string');
      expect(typeof IN_APP_POPULATE).toBe('boolean');
    });

    it('should have all string values non-empty', () => {
      const stringValues = [
        TERMINOLOGY_SERVER_URL,
        FORMS_SERVER_URL,
        LAUNCH_SCOPE,
        LAUNCH_CLIENT_ID
      ];
      stringValues.forEach((value) => {
        expect(value.length).toBeGreaterThan(0);
        expect(value.trim()).toBe(value);
      });
    });
  });

  describe('export validation', () => {
    it('should export all expected constants', () => {
      expect(TERMINOLOGY_SERVER_URL).toBeDefined();
      expect(FORMS_SERVER_URL).toBeDefined();
      expect(LAUNCH_SCOPE).toBeDefined();
      expect(LAUNCH_CLIENT_ID).toBeDefined();
      expect(IN_APP_POPULATE).toBeDefined();
    });

    it('should have consistent URL patterns', () => {
      expect(TERMINOLOGY_SERVER_URL).toContain('://');
      expect(FORMS_SERVER_URL).toContain('://');
    });

    it('should have meaningful scope string', () => {
      expect(LAUNCH_SCOPE).toContain('online_access');
      expect(LAUNCH_SCOPE.split(' ').length).toBeGreaterThan(2);
    });
  });
});

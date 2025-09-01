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
  findIssuerConfig,
  supportsDynamicRegistration,
  getRegistrationEndpoint,
  shouldUseFixedClientId,
  getFixedClientId,
  issuerConfigs
} from '../issuerConfig';

describe('issuerConfig', () => {
  const testIssuer = 'https://launch.smarthealthit.org/v/r4/fhir';
  const testFixedIssuer = 'https://proxy.smartforms.io/v/r4/fhir';
  const nonExistentIssuer = 'https://nonexistent.com/fhir';

  describe('findIssuerConfig', () => {
    it('should find an existing issuer configuration', () => {
      const config = findIssuerConfig(testIssuer);
      expect(config).toBeDefined();
      expect(config?.issuer).toBe(testIssuer);
    });

    it('should return undefined for non-existent issuer', () => {
      const config = findIssuerConfig(nonExistentIssuer);
      expect(config).toBeUndefined();
    });
  });

  describe('supportsDynamicRegistration', () => {
    it('should return true for issuers that support dynamic registration', () => {
      const supports = supportsDynamicRegistration(testIssuer);
      expect(supports).toBe(true);
    });

    it('should return false for issuers that do not support dynamic registration', () => {
      const supports = supportsDynamicRegistration(testFixedIssuer);
      expect(supports).toBe(false);
    });

    it('should return false for non-existent issuers', () => {
      const supports = supportsDynamicRegistration(nonExistentIssuer);
      expect(supports).toBe(false);
    });
  });

  describe('getRegistrationEndpoint', () => {
    it('should return registration endpoint for issuers that support dynamic registration', () => {
      const endpoint = getRegistrationEndpoint(testIssuer);
      expect(endpoint).toBe('https://launch.smarthealthit.org/v/r4/fhir/register');
    });

    it('should return undefined for issuers that do not support dynamic registration', () => {
      const endpoint = getRegistrationEndpoint(testFixedIssuer);
      expect(endpoint).toBeUndefined();
    });

    it('should return undefined for non-existent issuers', () => {
      const endpoint = getRegistrationEndpoint(nonExistentIssuer);
      expect(endpoint).toBeUndefined();
    });
  });

  describe('shouldUseFixedClientId', () => {
    it('should return false for issuers that support dynamic registration', () => {
      const shouldUse = shouldUseFixedClientId(testIssuer);
      expect(shouldUse).toBe(false);
    });

    it('should return true for issuers that use fixed client ID', () => {
      const shouldUse = shouldUseFixedClientId(testFixedIssuer);
      expect(shouldUse).toBe(true);
    });

    it('should return false for non-existent issuers', () => {
      const shouldUse = shouldUseFixedClientId(nonExistentIssuer);
      expect(shouldUse).toBe(false);
    });
  });

  describe('getFixedClientId', () => {
    it('should return undefined for issuers that support dynamic registration', () => {
      const clientId = getFixedClientId(testIssuer);
      expect(clientId).toBeUndefined();
    });

    it('should return fixed client ID for issuers that use fixed client ID', () => {
      const clientId = getFixedClientId(testFixedIssuer);
      expect(clientId).toBe('smart-forms-client-id');
    });

    it('should return undefined for non-existent issuers', () => {
      const clientId = getFixedClientId(nonExistentIssuer);
      expect(clientId).toBeUndefined();
    });
  });

  describe('issuerConfigs array', () => {
    it('should contain valid issuer configurations', () => {
      expect(issuerConfigs).toBeInstanceOf(Array);
      expect(issuerConfigs.length).toBeGreaterThan(0);
    });

    it('should have required properties for each issuer', () => {
      issuerConfigs.forEach(config => {
        expect(config).toHaveProperty('issuer');
        expect(config).toHaveProperty('supportsDynamicRegistration');
        expect(typeof config.issuer).toBe('string');
        expect(typeof config.supportsDynamicRegistration).toBe('boolean');
      });
    });

    it('should have valid URLs for issuer endpoints', () => {
      issuerConfigs.forEach(config => {
        if (config.registrationEndpoint) {
          expect(config.registrationEndpoint).toMatch(/^https?:\/\/.+/);
        }
      });
    });
  });
});


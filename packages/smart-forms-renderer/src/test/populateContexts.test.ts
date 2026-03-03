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

import { describe, expect, test } from '@jest/globals';
import { isLaunchContext } from '../utils/populateContexts';
import type { Extension } from 'fhir/r4';

describe('populateContexts utils', () => {
  const LAUNCH_CONTEXT_URL =
    'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext';

  describe('isLaunchContext', () => {
    describe('valid launch contexts', () => {
      it('should return true with valueId name', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            { url: 'name', valueId: 'patient-context' },
            { url: 'type', valueCode: 'Patient' }
          ]
        };
        expect(isLaunchContext(extension)).toBe(true);
      });

      it('should return true with valueCoding name', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            { url: 'name', valueCoding: { code: 'patient' } },
            { url: 'type', valueCode: 'Patient' }
          ]
        };
        expect(isLaunchContext(extension)).toBe(true);
      });

      it('should return true for any non-empty valueCoding code', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            { url: 'name', valueCoding: { code: 'custom-context' } },
            { url: 'type', valueCode: 'PractitionerRole' }
          ]
        };
        expect(isLaunchContext(extension)).toBe(true);
      });

      it('should return true with optional description extension', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            { url: 'name', valueId: 'patient-context' },
            { url: 'type', valueCode: 'Patient' },
            { url: 'description', valueString: 'The patient' }
          ]
        };
        expect(isLaunchContext(extension)).toBe(true);
      });
    });

    describe('invalid launch contexts - wrong URL', () => {
      it('should return false for wrong URL', () => {
        const extension: Extension = {
          url: 'http://example.com/wrong-url',
          extension: [
            { url: 'name', valueId: 'patient-context' },
            { url: 'type', valueCode: 'Patient' }
          ]
        };
        expect(isLaunchContext(extension)).toBe(false);
      });
    });

    describe('invalid launch contexts - missing or invalid name', () => {
      it('should return false when name extension is missing', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [{ url: 'type', valueCode: 'Patient' }]
        };
        expect(isLaunchContext(extension)).toBe(false);
      });

      it('should return false when name extension has wrong URL', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            { url: 'wrong-name', valueId: 'patient-context' },
            { url: 'type', valueCode: 'Patient' }
          ]
        };
        expect(isLaunchContext(extension)).toBe(false);
      });

      it('should return false when name has neither valueId nor valueCoding', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            { url: 'name' },
            { url: 'type', valueCode: 'Patient' }
          ]
        };
        expect(isLaunchContext(extension)).toBe(false);
      });

      it('should return false when valueCoding has no code', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            { url: 'name', valueCoding: { display: 'Patient' } },
            { url: 'type', valueCode: 'Patient' }
          ]
        };
        expect(isLaunchContext(extension)).toBe(false);
      });

      it('should return false when valueId is null', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            { url: 'name', valueId: null as any },
            { url: 'type', valueCode: 'Patient' }
          ]
        };
        expect(isLaunchContext(extension)).toBe(false);
      });
    });

    describe('invalid launch contexts - missing or invalid type', () => {
      it('should return false when type extension is missing', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [{ url: 'name', valueId: 'patient-context' }]
        };
        expect(isLaunchContext(extension)).toBe(false);
      });

      it('should return false when type extension has wrong URL', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            { url: 'name', valueId: 'patient-context' },
            { url: 'wrong-type', valueCode: 'Patient' }
          ]
        };
        expect(isLaunchContext(extension)).toBe(false);
      });

      it('should return false when type has no valueCode', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            { url: 'name', valueId: 'patient-context' },
            { url: 'type' }
          ]
        };
        expect(isLaunchContext(extension)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should return false when extension has no sub-extensions', () => {
        const extension: Extension = { url: LAUNCH_CONTEXT_URL };
        expect(isLaunchContext(extension)).toBe(false);
      });

      it('should return false when extension array is empty', () => {
        const extension: Extension = { url: LAUNCH_CONTEXT_URL, extension: [] };
        expect(isLaunchContext(extension)).toBe(false);
      });

      it('should return true when valueId is present even if valueCoding code is empty', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            { url: 'name', valueId: 'patient-context', valueCoding: {} },
            { url: 'type', valueCode: 'Patient' }
          ]
        };
        expect(isLaunchContext(extension)).toBe(true);
      });
    });
  });
});

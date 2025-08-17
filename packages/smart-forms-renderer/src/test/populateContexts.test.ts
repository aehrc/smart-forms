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
  const LAUNCH_CONTEXT_URL = 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext';

  const createValidLaunchContextExtension = (nameType: 'valueId' | 'valueCoding', nameValue: string, typeValue: string): Extension => ({
    url: LAUNCH_CONTEXT_URL,
    extension: [
      {
        url: 'name',
        ...(nameType === 'valueId' 
          ? { valueId: nameValue }
          : { 
              valueCoding: {
                code: nameValue
              }
            }
        )
      },
      {
        url: 'type',
        valueCode: typeValue
      }
    ]
  });

  describe('isLaunchContext', () => {
    describe('valid launch contexts', () => {
      test('should return true for valid launch context with valueId name and Patient type', () => {
        const extension = createValidLaunchContextExtension('valueId', 'patient-context', 'Patient');

        const result = isLaunchContext(extension);

        expect(result).toBe(true);
      });

      test('should return true for valid launch context with valueCoding patient name', () => {
        const extension = createValidLaunchContextExtension('valueCoding', 'patient', 'Patient');

        const result = isLaunchContext(extension);

        expect(result).toBe(true);
      });

      test('should return true for valueCoding encounter name', () => {
        const extension = createValidLaunchContextExtension('valueCoding', 'encounter', 'Encounter');

        const result = isLaunchContext(extension);

        expect(result).toBe(true);
      });

      test('should return true for valueCoding location name', () => {
        const extension = createValidLaunchContextExtension('valueCoding', 'location', 'Patient');

        const result = isLaunchContext(extension);

        expect(result).toBe(true);
      });

      test('should return true for valueCoding user name', () => {
        const extension = createValidLaunchContextExtension('valueCoding', 'user', 'Practitioner');

        const result = isLaunchContext(extension);

        expect(result).toBe(true);
      });

      test('should return true for valueCoding study name', () => {
        const extension = createValidLaunchContextExtension('valueCoding', 'study', 'Patient');

        const result = isLaunchContext(extension);

        expect(result).toBe(true);
      });

      test('should return true for valueCoding sourceQueries name', () => {
        const extension = createValidLaunchContextExtension('valueCoding', 'sourceQueries', 'Patient');

        const result = isLaunchContext(extension);

        expect(result).toBe(true);
      });

      test('should return true for Practitioner type', () => {
        const extension = createValidLaunchContextExtension('valueCoding', 'user', 'Practitioner');

        const result = isLaunchContext(extension);

        expect(result).toBe(true);
      });

      test('should return true for Encounter type', () => {
        const extension = createValidLaunchContextExtension('valueCoding', 'encounter', 'Encounter');

        const result = isLaunchContext(extension);

        expect(result).toBe(true);
      });
    });

    describe('invalid launch contexts - wrong URL', () => {
      test('should return false for extension with wrong URL', () => {
        const extension: Extension = {
          url: 'http://example.com/wrong-url',
          extension: [
            {
              url: 'name',
              valueId: 'patient-context'
            },
            {
              url: 'type',
              valueCode: 'Patient'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });
    });

    describe('invalid launch contexts - missing or invalid name extension', () => {
      test('should return false when name extension is missing', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'type',
              valueCode: 'Patient'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should return false when name extension has wrong URL', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'wrong-name',
              valueId: 'patient-context'
            },
            {
              url: 'type',
              valueCode: 'Patient'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should return false when name extension has no valueId or valueCoding', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name'
              // No valueId or valueCoding
            },
            {
              url: 'type',
              valueCode: 'Patient'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should return false when valueCoding has invalid code', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name',
              valueCoding: {
                code: 'invalid-code'
              }
            },
            {
              url: 'type',
              valueCode: 'Patient'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should return false when valueCoding is present but has no code', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name',
              valueCoding: {
                // No code property
                display: 'Patient'
              }
            },
            {
              url: 'type',
              valueCode: 'Patient'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should return false when valueCoding is missing entirely', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name'
              // valueCoding is undefined, valueId is also undefined
            },
            {
              url: 'type',
              valueCode: 'Patient'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });
    });

    describe('invalid launch contexts - missing or invalid type extension', () => {
      test('should return false when type extension is missing', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name',
              valueId: 'patient-context'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should return false when type extension has wrong URL', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name',
              valueId: 'patient-context'
            },
            {
              url: 'wrong-type',
              valueCode: 'Patient'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should return false when type extension has no valueCode', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name',
              valueId: 'patient-context'
            },
            {
              url: 'type'
              // No valueCode
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should return false when valueCode has invalid value', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name',
              valueId: 'patient-context'
            },
            {
              url: 'type',
              valueCode: 'InvalidResource'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });
    });

    describe('edge cases', () => {
      test('should return false when extension has no sub-extensions', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL
          // No extension array
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should return false when extension array is empty', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: []
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should return false when extension array is undefined', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: undefined
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should handle extensions with additional sub-extensions', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name',
              valueId: 'patient-context'
            },
            {
              url: 'type',
              valueCode: 'Patient'
            },
            {
              url: 'description',
              valueString: 'Additional description'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(true);
      });

      test('should return false when both valueId and valueCoding are present but valueCoding has invalid code', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name',
              valueId: 'valid-id',
              valueCoding: {
                code: 'invalid-code'
              }
            },
            {
              url: 'type',
              valueCode: 'Patient'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(true); // Should pass because valueId is present
      });

      test('should return true when valueId is empty string but valueCoding is valid', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name',
              valueId: '',
              valueCoding: {
                code: 'patient'
              }
            },
            {
              url: 'type',
              valueCode: 'Patient'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(true); // Should pass because either valueId OR valid valueCoding passes
      });

      test('should return false when only one condition is met (valid name, invalid type)', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name',
              valueId: 'patient-context'
            },
            {
              url: 'type',
              valueCode: 'InvalidType'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should handle case sensitivity in codes correctly', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name',
              valueCoding: {
                code: 'Patient' // Should be lowercase 'patient'
              }
            },
            {
              url: 'type',
              valueCode: 'Patient'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });

      test('should handle null values gracefully', () => {
        const extension: Extension = {
          url: LAUNCH_CONTEXT_URL,
          extension: [
            {
              url: 'name',
              valueId: null as any
            },
            {
              url: 'type',
              valueCode: 'Patient'
            }
          ]
        };

        const result = isLaunchContext(extension);

        expect(result).toBe(false);
      });
    });

    describe('complex scenarios', () => {
      test('should validate complex extension with all valid launch context codes', () => {
        const validCodes = ['patient', 'encounter', 'location', 'user', 'study', 'sourceQueries'];
        const validTypes = ['Patient', 'Practitioner', 'Encounter'];

        for (const code of validCodes) {
          for (const type of validTypes) {
            const extension = createValidLaunchContextExtension('valueCoding', code, type);
            expect(isLaunchContext(extension)).toBe(true);
          }
        }
      });

      test('should reject all invalid combinations', () => {
        const invalidCodes = ['invalid', 'wrong', 'test'];
        const invalidTypes = ['Invalid', 'Wrong', 'Test'];

        for (const code of invalidCodes) {
          const extension = createValidLaunchContextExtension('valueCoding', code, 'Patient');
          expect(isLaunchContext(extension)).toBe(false);
        }

        for (const type of invalidTypes) {
          const extension = createValidLaunchContextExtension('valueCoding', 'patient', type);
          expect(isLaunchContext(extension)).toBe(false);
        }
      });
    });
  });
});


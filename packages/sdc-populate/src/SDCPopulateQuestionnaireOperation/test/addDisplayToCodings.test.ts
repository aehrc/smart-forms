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

import { getCodeSystemLookupPromise } from '../api/lookupCodeSystem';
import { resolveLookupPromises } from '../utils/resolveLookupPromises';
import { addDisplayToInitialExpressionsCodings } from '../utils/addDisplayToCodings';
import type { InitialExpression } from '../interfaces/expressions.interface';

// Mock getCodeSystemLookupPromise function
jest.mock('../api/lookupCodeSystem');

// Mock resolveLookupPromises function
jest.mock('../utils/resolveLookupPromises');

describe('addDisplayToInitialExpressionsCodings', () => {
  it('should populate display if missing using lookup', async () => {
    const coding = { system: 'test', code: '123' };
    const initialExpressions: Record<string, InitialExpression> = {
      myKey: {
        value: [coding],
        expression: 'some expression'
      }
    };

    (getCodeSystemLookupPromise as jest.Mock).mockImplementation((coding, map) => {
      map['system=test&code=123'] = {
        oldCoding: coding,
        promise: Promise.resolve({})
      };
    });

    (resolveLookupPromises as jest.Mock).mockResolvedValue({
      'system=test&code=123': {
        newCoding: { ...coding, display: 'Looked Up Display' }
      }
    });

    const result = await addDisplayToInitialExpressionsCodings(initialExpressions);

    expect(result.myKey.value[0].display).toBe('Looked Up Display');
  });

  it('should skip codings that already have display', async () => {
    const initialExpressions: Record<string, InitialExpression> = {
      existing: {
        value: [{ system: 'x', code: 'y', display: 'Already There' }],
        expression: 'some expression'
      }
    };

    const result = await addDisplayToInitialExpressionsCodings(initialExpressions);

    expect(result.existing.value[0].display).toBe('Already There');
    expect(getCodeSystemLookupPromise).not.toHaveBeenCalled();
  });

  it('should handle multiple codings and only lookup ones without display', async () => {
    const initialExpressions = {
      one: {
        value: [
          { system: 'a', code: '1', display: 'Exists' },
          { system: 'a', code: '2' }
        ],
        expression: 'some expression'
      }
    };

    (getCodeSystemLookupPromise as jest.Mock).mockImplementation((coding, map) => {
      map['system=a&code=2'] = {
        oldCoding: coding,
        promise: Promise.resolve({})
      };
    });

    (resolveLookupPromises as jest.Mock).mockResolvedValue({
      'system=a&code=2': {
        newCoding: { system: 'a', code: '2', display: 'Fetched' }
      }
    });

    const result = await addDisplayToInitialExpressionsCodings(initialExpressions);

    expect(result.one.value[0].display).toBe('Exists');
    expect(result.one.value[1].display).toBe('Fetched');
  });
});

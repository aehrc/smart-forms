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
import { addDisplayToQuestionnaireResponseCodings } from '../utils/addDisplayToCodings';
import type { QuestionnaireResponseItem } from 'fhir/r4';

// Mock getCodeSystemLookupPromise function
jest.mock('../api/lookupCodeSystem');

// Mock resolveLookupPromises function
jest.mock('../utils/resolveLookupPromises');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('addDisplayToQuestionnaireResponseCodings', () => {
  it('should populate display if missing using lookup', async () => {
    const qrItems: QuestionnaireResponseItem[] = [
      {
        linkId: 'myItem',
        answer: [{ valueCoding: { system: 'test', code: '123' } }]
      }
    ];

    (getCodeSystemLookupPromise as jest.Mock).mockImplementation((coding, map) => {
      map['system=test&code=123'] = {
        oldCoding: coding,
        promise: Promise.resolve({})
      };
    });

    (resolveLookupPromises as jest.Mock).mockResolvedValue({
      'system=test&code=123': {
        newCoding: { system: 'test', code: '123', display: 'Looked Up Display' }
      }
    });

    await addDisplayToQuestionnaireResponseCodings(qrItems);

    expect(qrItems[0].answer?.[0].valueCoding?.display).toBe('Looked Up Display');
  });

  it('should skip codings that already have display', async () => {
    const qrItems: QuestionnaireResponseItem[] = [
      {
        linkId: 'existingItem',
        answer: [{ valueCoding: { system: 'x', code: 'y', display: 'Already There' } }]
      }
    ];

    await addDisplayToQuestionnaireResponseCodings(qrItems);

    expect(qrItems[0].answer?.[0].valueCoding?.display).toBe('Already There');
    expect(getCodeSystemLookupPromise).not.toHaveBeenCalled();
  });

  it('should handle multiple codings and only lookup ones without display', async () => {
    const qrItems: QuestionnaireResponseItem[] = [
      {
        linkId: 'item1',
        answer: [{ valueCoding: { system: 'a', code: '1', display: 'Exists' } }]
      },
      {
        linkId: 'item2',
        answer: [{ valueCoding: { system: 'a', code: '2' } }]
      }
    ];

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

    await addDisplayToQuestionnaireResponseCodings(qrItems);

    expect(qrItems[0].answer?.[0].valueCoding?.display).toBe('Exists');
    expect(qrItems[1].answer?.[0].valueCoding?.display).toBe('Fetched');
  });

  it('should populate display for codings nested in repeat group items', async () => {
    const qrItems: QuestionnaireResponseItem[] = [
      {
        linkId: 'group',
        item: [
          {
            linkId: 'child',
            answer: [{ valueCoding: { system: 'test', code: '456' } }]
          }
        ]
      }
    ];

    (getCodeSystemLookupPromise as jest.Mock).mockImplementation((coding, map) => {
      map['system=test&code=456'] = {
        oldCoding: coding,
        promise: Promise.resolve({})
      };
    });

    (resolveLookupPromises as jest.Mock).mockResolvedValue({
      'system=test&code=456': {
        newCoding: { system: 'test', code: '456', display: 'Nested Display' }
      }
    });

    await addDisplayToQuestionnaireResponseCodings(qrItems);

    expect(qrItems[0].item?.[0].answer?.[0].valueCoding?.display).toBe('Nested Display');
  });
});

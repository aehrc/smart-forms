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

import type { OperationOutcome, Questionnaire } from 'fhir/r4';
import {
  extractWarningMessages,
  formatPopulateIssuesForUser,
  getWarningFieldNames
} from '../utils/prepopulateIssues';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeOutcome(
  code: string,
  detailsText?: string,
  expression?: string[]
): OperationOutcome {
  return {
    resourceType: 'OperationOutcome',
    issue: [
      {
        severity: 'warning',
        code,
        ...(detailsText && { details: { text: detailsText } }),
        ...(expression && { expression })
      }
    ]
  };
}

function makeHttpOutcome(status: number): OperationOutcome {
  return makeOutcome('invalid', `HTTP error when performing /fhir/Patient. Status: ${status}`);
}

// ---------------------------------------------------------------------------
// formatPopulateIssuesForUser
// ---------------------------------------------------------------------------

describe('formatPopulateIssuesForUser', () => {
  describe('HTTP status code detection', () => {
    it('returns rate-limit message for HTTP 429', () => {
      const msg = formatPopulateIssuesForUser(makeHttpOutcome(429));
      expect(msg).toContain('busy');
      expect(msg).toContain('try pre-filling again');
    });

    it('returns permission-denied message for HTTP 403', () => {
      const msg = formatPopulateIssuesForUser(makeHttpOutcome(403));
      expect(msg).toContain('denied');
      expect(msg).toContain('administrator');
    });

    it('returns not-found message for HTTP 404', () => {
      const msg = formatPopulateIssuesForUser(makeHttpOutcome(404));
      expect(msg).toContain('not found on the server');
    });

    it('returns server-error message for HTTP 500', () => {
      const msg = formatPopulateIssuesForUser(makeHttpOutcome(500));
      expect(msg).toContain('server returned an error');
      expect(msg).toContain('try again shortly');
    });

    it('returns server-error message for HTTP 503', () => {
      const msg = formatPopulateIssuesForUser(makeHttpOutcome(503));
      expect(msg).toContain('server returned an error');
    });
  });

  describe('network error detection', () => {
    it('returns network-error message when details.text contains "Failed to fetch"', () => {
      const msg = formatPopulateIssuesForUser(makeOutcome('invalid', 'Failed to fetch'));
      expect(msg).toContain('could not reach the health record server');
    });

    it('returns network-error message when details.text contains "NetworkError"', () => {
      const msg = formatPopulateIssuesForUser(makeOutcome('invalid', 'NetworkError: connection refused'));
      expect(msg).toContain('could not reach the health record server');
    });
  });

  describe('not-found and invalid issue combinations', () => {
    it('returns cascade message when both not-found and invalid issues are present', () => {
      const outcome: OperationOutcome = {
        resourceType: 'OperationOutcome',
        issue: [
          { severity: 'warning', code: 'not-found' },
          { severity: 'warning', code: 'invalid', expression: ['link-1'] }
        ]
      };
      const msg = formatPopulateIssuesForUser(outcome, 1);
      expect(msg).toContain("no matching records");
      expect(msg).toContain('1 field affected');
    });

    it('returns not-found-only message when only not-found issues are present', () => {
      const outcome: OperationOutcome = {
        resourceType: 'OperationOutcome',
        issue: [{ severity: 'warning', code: 'not-found' }]
      };
      const msg = formatPopulateIssuesForUser(outcome);
      expect(msg).toContain("no matching records");
      expect(msg).toContain('permission');
    });
  });

  describe('missing launch context detection', () => {
    it('returns missing-context message when details.text contains "undefined environment variable"', () => {
      const msg = formatPopulateIssuesForUser(
        makeOutcome('invalid', 'Error: Attempting to access an undefined environment variable: patient')
      );
      expect(msg).toContain('required patient context');
      expect(msg).toContain('not available in this session');
    });
  });

  describe('default (standalone expression failure)', () => {
    it('returns generic expression-failure message as fallback', () => {
      const msg = formatPopulateIssuesForUser(makeOutcome('invalid', 'Some fhirpath error'));
      expect(msg).toContain("pre-fill calculations could not be completed");
    });
  });

  describe('field count and debug suffix', () => {
    it('appends field count to message when affectedFieldCount is provided', () => {
      const msg = formatPopulateIssuesForUser(makeOutcome('not-found'), 3);
      expect(msg).toContain('3 fields affected');
    });

    it('uses singular "field" when affectedFieldCount is 1', () => {
      const msg = formatPopulateIssuesForUser(makeOutcome('not-found'), 1);
      expect(msg).toContain('1 field affected');
      expect(msg).toContain('fill it in manually');
    });

    it('appends debug field names when provided', () => {
      const msg = formatPopulateIssuesForUser(makeOutcome('not-found'), 2, ['Height', 'Weight']);
      expect(msg).toContain('[Debug — affected fields: Height, Weight]');
    });

    it('omits field count when affectedFieldCount is 0', () => {
      const msg = formatPopulateIssuesForUser(makeOutcome('not-found'), 0);
      expect(msg).not.toContain('field affected');
    });

    it('omits debug part when debugFieldNames is empty', () => {
      const msg = formatPopulateIssuesForUser(makeOutcome('not-found'), 1, []);
      expect(msg).not.toContain('[Debug');
    });
  });

  describe('empty outcome', () => {
    it('returns fallback message for empty issue list', () => {
      const msg = formatPopulateIssuesForUser({ resourceType: 'OperationOutcome', issue: [] });
      expect(msg).toContain('Pre-fill incomplete');
    });
  });
});

// ---------------------------------------------------------------------------
// extractWarningMessages
// ---------------------------------------------------------------------------

describe('extractWarningMessages', () => {
  it('maps linkIds from invalid issues to the not-found cascade message when not-found is present', () => {
    const outcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [
        { severity: 'warning', code: 'not-found' },
        { severity: 'warning', code: 'invalid', expression: ['link-1', 'link-2'] }
      ]
    };
    const map = extractWarningMessages(outcome);
    expect(map.get('link-1')).toContain("no matching records");
    expect(map.get('link-2')).toContain("no matching records");
  });

  it('maps linkId to missing-context message when details.text has "undefined environment variable"', () => {
    const outcome: OperationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'warning',
          code: 'invalid',
          details: { text: 'Error: Attempting to access an undefined environment variable: patient' },
          expression: ['link-3']
        }
      ]
    };
    const map = extractWarningMessages(outcome);
    expect(map.get('link-3')).toContain('required patient context');
  });

  it('maps linkId to generic calculation message for standalone expression failure', () => {
    const outcome = makeOutcome('invalid', 'Some fhirpath error', ['link-4']);
    const map = extractWarningMessages(outcome);
    expect(map.get('link-4')).toContain("calculation could not be completed");
  });

  it('ignores invalid issues without an expression array', () => {
    const outcome = makeOutcome('invalid', 'Some error');
    const map = extractWarningMessages(outcome);
    expect(map.size).toBe(0);
  });

  it('ignores non-invalid issues', () => {
    const outcome = makeOutcome('not-found');
    const map = extractWarningMessages(outcome);
    expect(map.size).toBe(0);
  });

  it('returns empty map for empty issue list', () => {
    const map = extractWarningMessages({ resourceType: 'OperationOutcome', issue: [] });
    expect(map.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getWarningFieldNames
// ---------------------------------------------------------------------------

describe('getWarningFieldNames', () => {
  const questionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    status: 'draft',
    item: [
      {
        linkId: 'top-level-item',
        text: 'Top level field',
        type: 'string'
      },
      {
        linkId: 'group-1',
        text: 'Measurements',
        type: 'group',
        item: [
          { linkId: 'child-1', text: 'Body height', type: 'decimal' },
          { linkId: 'child-2', text: 'Body weight', type: 'decimal' },
          {
            linkId: 'sub-group',
            text: 'Blood pressure',
            type: 'group',
            item: [{ linkId: 'grandchild-1', text: 'Systolic', type: 'decimal' }]
          }
        ]
      },
      {
        linkId: 'item-no-text',
        type: 'string'
      }
    ]
  };

  it('returns item text for a top-level item with no parent group', () => {
    const names = getWarningFieldNames(questionnaire, new Set(['top-level-item']));
    expect(names).toEqual(['Top level field']);
  });

  it('prefixes item text with immediate parent group name', () => {
    const names = getWarningFieldNames(questionnaire, new Set(['child-1', 'child-2']));
    expect(names).toContain('Measurements › Body height');
    expect(names).toContain('Measurements › Body weight');
  });

  it('uses immediate parent group name (not full path) for nested items', () => {
    const names = getWarningFieldNames(questionnaire, new Set(['grandchild-1']));
    expect(names).toEqual(['Blood pressure › Systolic']);
  });

  it('falls back to linkId when item has no text', () => {
    const names = getWarningFieldNames(questionnaire, new Set(['item-no-text']));
    expect(names).toEqual(['item-no-text']);
  });

  it('returns empty array when no linkIds match', () => {
    const names = getWarningFieldNames(questionnaire, new Set(['nonexistent']));
    expect(names).toEqual([]);
  });

  it('returns empty array for empty linkIds set', () => {
    const names = getWarningFieldNames(questionnaire, new Set());
    expect(names).toEqual([]);
  });
});

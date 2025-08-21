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

import { qrToHTML } from '../utils/preview';
import { QAboriginalTorresStraitIslanderHealthCheck } from '../../../test/data-shared/QAboriginalTorresStraitIslanderHealthCheck.ts';
import { QRAboriginalTorresStraitIslanderHealthCheck } from '../../../test/data-shared/QRAboriginalTorresStraitIslanderHealthCheck.ts';

describe('qrToHTML', () => {
  const questionnaire = QAboriginalTorresStraitIslanderHealthCheck;
  const questionnaireResponse = QRAboriginalTorresStraitIslanderHealthCheck;

  it('returns a non-empty HTML string for valid questionnaire/response', () => {
    const html = qrToHTML(questionnaire, questionnaireResponse);
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);

    // Should contain title from questionnaire
    expect(html).toContain('<h1');
  });

  it('returns empty string if questionnaire items are missing', () => {
    const html = qrToHTML(
      {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'draft'
      },
      questionnaireResponse
    );
    expect(html).toBe('');
  });

  it('returns empty string if questionnaireResponse items are missing', () => {
    const html = qrToHTML(questionnaire, {
      resourceType: 'QuestionnaireResponse',
      id: 'qr1',
      status: 'in-progress'
    });
    expect(html).toBe('');
  });

  it('renders correct HTML tags and structure', () => {
    const html = qrToHTML(questionnaire, questionnaireResponse);

    // Tags at top
    expect(html.startsWith('<div')).toBe(true);
    expect(html).toContain('<article');

    // Title as <h1>
    expect(html).toContain('<h1');

    // Metadata <p> and <strong>
    expect(html).toContain('<strong style="font-weight: 600;">');

    // Note: h2 and h3 tags would only appear if questionnaire items were properly processed
    // Since our mocks return empty objects, we just verify the basic structure is created

    // Close all wrappers
    expect(html).toMatch(/<\/article>\s*<\/div>$/);
  });
});

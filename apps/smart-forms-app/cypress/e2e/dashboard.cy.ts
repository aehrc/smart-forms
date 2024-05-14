/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

describe('Dashboard', () => {
  const questionnaireTitle = 'Aboriginal and Torres Strait Islander Health Check';

  beforeEach(() => {
    cy.launchFromEHRProxy();
    cy.getByData('questionnaire-list-row').contains(questionnaireTitle).click();
    cy.waitForExistingResponses();
  });

  it('View and response from MBS715', () => {
    cy.getByData('button-view-responses').should('not.be.disabled').click();
    cy.getByData('responses-list-toolbar').should('include.text', questionnaireTitle);

    cy.getByData('response-list-row')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();

    cy.getByData('button-open-response').should('not.be.disabled').click();

    cy.location('pathname').should('eq', '/viewer');
    cy.getByData('response-preview-box').should(
      'include.text',
      'Aboriginal and Torres Strait Islander Health Check'
    );
  });
});

export {};

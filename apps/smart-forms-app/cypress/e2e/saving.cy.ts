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

describe('Saving', () => {
  beforeEach(() => {
    cy.launchFromEHRProxyQuesContext();

    cy.waitForPopulation();
  });

  it('Saving a response as draft then final', () => {
    // Fill in one of the radio buttons
    cy.goToTab('Consent');
    cy.getByData('q-item-boolean-box').eq(0).find('input').eq(0).click();

    // Save as draft
    cy.clickOnRendererOperation('Save Progress');

    cy.intercept({
      method: 'POST',
      url: 'https://proxy.smartforms.io/v/r4/fhir/QuestionnaireResponse'
    }).as('savingResponseAsDraft');

    cy.wait(1500);
    cy.clickOnRendererOperation('View Existing Responses');

    // Select response
    cy.getByData('response-list-row').contains('in-progress').click();

    cy.getByData('button-open-response').should('not.be.disabled').click();

    cy.location('pathname').should('eq', '/viewer');
    cy.getByData('response-preview-box').should(
      'include.text',
      'Aboriginal and Torres Strait Islander Health Check'
    );

    // Re-open the response
    cy.clickOnRendererOperation('Edit Response');
    cy.location('pathname').should('eq', '/renderer');

    // Save as final
    cy.clickOnRendererOperation('Save as Final');
    cy.getByData('save-as-final-button').click();

    cy.intercept({
      method: 'PUT',
      url: 'https://proxy.smartforms.io/v/r4/fhir/QuestionnaireResponse/*'
    }).as('savingResponseAsFinal');

    cy.location('pathname').should('eq', '/dashboard/existing');
  });
});

export {};

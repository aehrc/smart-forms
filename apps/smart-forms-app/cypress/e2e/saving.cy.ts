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

describe('save response', () => {
  const formsServerUrl = 'https://api.smartforms.io/fhir';

  const launchUrlWithoutQuestionnaire =
    'http://localhost:5173/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  beforeEach(() => {
    cy.intercept(`${formsServerUrl}/Questionnaire?_count=100&_sort=-date&`).as(
      'fetchQuestionnaire'
    );
    cy.intercept(
      `${formsServerUrl}/Questionnaire?_count=100&_sort=-date&title:contains=Aboriginal%20and%20Torres%20Strait%20Islander%20Health%20Check`
    ).as('fetchQuestionnaireByTitle');

    cy.visit(launchUrlWithoutQuestionnaire);
    cy.wait('@fetchQuestionnaire').its('response.statusCode').should('eq', 200);

    cy.getByData('search-field-questionnaires')
      .find('input')
      .type('Aboriginal and Torres Strait Islander Health Check');

    cy.wait('@fetchQuestionnaireByTitle').its('response.statusCode').should('eq', 200);

    cy.getByData('questionnaire-list-row')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.getByData('button-create-response').click();
    cy.waitForPopulation();
  });

  context('saving a response as draft', () => {
    it('saving a response as draft', () => {
      cy.intercept({
        method: 'POST',
        url: 'https://launch.smarthealthit.org/v/r4/fhir/QuestionnaireResponse'
      }).as('savingResponse');

      cy.goToPatientDetailsTab();
      cy.getByData('q-item-integer-box').eq(0).find('input').clear().wait(50);
      cy.initAgeValue(60);

      cy.clickOnRendererOperation('Save Progress');

      cy.wait('@savingResponse');
    });

    it('saving a response as final', () => {
      cy.intercept({
        method: 'POST',
        url: 'https://launch.smarthealthit.org/v/r4/fhir/QuestionnaireResponse'
      }).as('savingResponse');

      cy.goToPatientDetailsTab();
      cy.getByData('q-item-integer-box').eq(0).find('input').clear().wait(50);
      cy.initAgeValue(60);

      cy.getByData('list-button-renderer-operation');
      cy.contains('Save as Final').click();
      cy.get('.MuiButtonBase-root').contains('Save as final').click();

      cy.wait('@savingResponse');
      cy.location('pathname').should('eq', '/dashboard/responses');
    });
  });
});

export {};

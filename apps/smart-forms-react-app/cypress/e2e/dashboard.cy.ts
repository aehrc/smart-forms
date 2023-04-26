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

describe('navigate questionnaires page', () => {
  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';
  const formsServerUrl = process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';
  const questionnaireTitle = 'Aboriginal and Torres Strait Islander Health Check';

  beforeEach(() => {
    cy.launchFromSMARTHealthIT();
  });

  it('selecting a questionnaire and creating a new response', () => {
    cy.intercept(`${formsServerUrl}/Questionnaire?_count=100&_sort=-date&`).as(
      'fetchQuestionnaire'
    );
    cy.intercept(
      `${formsServerUrl}/Questionnaire?_count=100&_sort=-date&title:contains=Aboriginal%20and%20Torres%20Strait%20Islander%20Health%20Check`
    ).as('fetchQuestionnaireByTitle');
    cy.intercept(`${clientUrl}/QuestionnaireResponse`).as('saveAsDraft');

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

    cy.getByData('q-item-choice-radio-answer-value-set-box')
      .should('include.text', 'Eligible for health check')
      .eq(0)
      .find('input')
      .eq(0)
      .check()
      .should('be.checked')
      .waitForFormUpdate();

    cy.clickOnRendererOperation('Save as Draft');
    cy.wait('@saveAsDraft').its('response.statusCode').should('eq', 201);
    cy.clickOnNavPage('Back to Home');
  });

  it('View responses from a specified questionnaire', () => {
    cy.getByData('questionnaire-list-row').contains(questionnaireTitle).click();

    cy.waitForExistingResponses();
    cy.getByData('button-view-responses').should('not.be.disabled').click();
    cy.getByData('responses-list-toolbar').should('include.text', questionnaireTitle);
  });

  it('Go back button displays and works as intended', () => {
    cy.getByData('questionnaire-list-row').contains(questionnaireTitle).click();

    cy.waitForExistingResponses();
    cy.getByData('button-view-responses').should('not.be.disabled').click();
    cy.getByData('button-responses-go-back').should('be.visible').click();

    cy.getByData('button-view-responses').should('not.be.disabled').click();
    cy.getByData('button-remove-questionnaire-filter').should('be.visible').click();

    cy.getByData('button-responses-go-back').should('not.exist');
  });
});

describe('navigate responses page', () => {
  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';
  const formsServerUrl = process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';

  beforeEach(() => {
    cy.launchFromSMARTHealthIT();
  });

  it('selecting and opening a response', () => {
    cy.intercept(
      `${clientUrl}/QuestionnaireResponse?_count=50&_sort=-authored&patient=d64b37f5-d3b5-4c25-abe8-23ebe8f5a04e&`
    ).as('fetchResponse');
    cy.intercept(
      `${clientUrl}/QuestionnaireResponse?_count=50&_sort=-authored&patient=d64b37f5-d3b5-4c25-abe8-23ebe8f5a04e&questionnaire.title:contains=Aboriginal%20and%20Torres%20Strait%20Islander%20Health%20Check`
    ).as('fetchResponseByTitle');

    cy.intercept(`${formsServerUrl}/Questionnaire/AboriginalTorresStraitIslanderHealthCheck`).as(
      'enableOpenResponseButton'
    );
    cy.intercept(
      `${clientUrl}/Questionnaire/AboriginalTorresStraitIslanderHealthCheck-SMARTcopy`
    ).as('openingResponseClient');

    cy.goToResponsesPage();
    cy.wait('@fetchResponse').its('response.statusCode').should('eq', 200);

    cy.getByData('search-field-responses')
      .find('input')
      .type('Aboriginal and Torres Strait Islander Health Check');

    cy.wait('@fetchResponseByTitle').its('response.statusCode').should('eq', 200);

    cy.getByData('response-list-row')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.wait('@enableOpenResponseButton').its('response.statusCode').should('eq', 200);
    cy.getByData('button-open-response').should('not.be.disabled').click();
    cy.wait('@openingResponseClient', { timeout: 15000 })
      .its('response.statusCode')
      .should('eq', 200);

    cy.location('pathname').should('eq', '/viewer');
    cy.getByData('response-preview-box').should(
      'include.text',
      'Aboriginal and Torres Strait Islander Health Check'
    );
  });
});

export {};

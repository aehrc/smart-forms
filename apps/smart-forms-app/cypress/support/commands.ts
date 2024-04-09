/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

// @ts-nocheck

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('getByData', (selector, ...args) => {
  return cy.get(`[data-test*=${selector}]`, ...args);
});

Cypress.Commands.add('previewForm', () => {
  cy.getByData('renderer-operation-item');
  cy.contains('Preview').click();
  cy.location('pathname').should('eq', '/renderer/preview');
});

Cypress.Commands.add('clickOnNavPage', (operationName: string) => {
  cy.getByData('renderer-operation-item');
  cy.contains(operationName).click();
});

Cypress.Commands.add('clickOnRendererOperation', (operationName: string) => {
  cy.getByData('renderer-operation-item');
  cy.contains(operationName).click();
});

Cypress.Commands.add('clickOnViewerOperation', (operationName: string) => {
  cy.getByData('renderer-operation-item');
  cy.contains(operationName).click();
});

Cypress.Commands.add('editForm', () => {
  cy.getByData('renderer-operation-item');
  cy.contains('Editor').click();
  cy.location('pathname').should('eq', '/renderer');
});

Cypress.Commands.add('goToPatientDetailsTab', () => {
  cy.getByData('renderer-tab-list').find('.MuiButtonBase-root').contains('Patient Details').click();
});

Cypress.Commands.add('goToTab', (tabName: string) => {
  cy.getByData('renderer-tab-list').find('.MuiButtonBase-root').contains(tabName).click();
});

Cypress.Commands.add('initAgeValue', (age: number) => {
  cy.getByData('q-item-integer-box')
    .should('include.text', 'Age')
    .find('input')
    .clear()
    .type(age.toString())
    .waitForFormUpdate();
});

Cypress.Commands.add('checkResponseTextAndAnswer', (text: string, answer: string) => {
  cy.getByData('response-item-text').contains(text);
  cy.getByData('response-item-answer').contains(new RegExp(answer, 'i'));
});

Cypress.Commands.add('waitForFormUpdate', () => {
  cy.getByData('updating-indicator').should('exist');
});

Cypress.Commands.add('waitForPopulation', () => {
  const populateRegex = new RegExp(
    /^https:\/\/launch\.smarthealthit\.org\/v\/r4\/fhir\/(Observation|Condition)\?.+$/
  );

  cy.intercept(populateRegex).as('populating');

  cy.wait('@populating', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
});

Cypress.Commands.add('launchFromSMARTHealthIT', () => {
  const launchUrl =
    'http://localhost:5173/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  cy.visit(launchUrl);
});

Cypress.Commands.add('goToResponsesPage', () => {
  cy.getByData('renderer-operation-item');
  cy.contains('Responses').click();
});

Cypress.Commands.add('waitForExistingResponses', () => {
  const fetchQuestionnaireRegex = new RegExp(
    /^https:\/\/launch\.smarthealthit\.org\/v\/r4\/fhir\/QuestionnaireResponse\?questionnaire=.+$/i
  );
  cy.intercept(fetchQuestionnaireRegex).as('loadExistingResponses');

  cy.wait('@loadExistingResponses', { timeout: 30000 })
    .its('response.statusCode')
    .should('eq', 200);
});

Cypress.Commands.add('createDraftResponse', () => {
  const formsServerUrl = 'https://smartforms.csiro.au/api/fhir';
  const launchUrlWithoutQuestionnaire =
    'http://localhost:5173/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  cy.intercept(`${formsServerUrl}/Questionnaire?_count=100&_sort=-date&`).as('fetchQuestionnaire');
  cy.intercept(
    `${formsServerUrl}/Questionnaire?_count=100&_sort=-date&title:contains=Aboriginal%20and%20Torres%20Strait%20Islander%20Health%20Check`
  ).as('fetchQuestionnaireByTitle');
  cy.intercept({
    method: 'POST',
    url: 'https://launch.smarthealthit.org/v/r4/fhir/QuestionnaireResponse'
  }).as('savingResponse');

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

  cy.goToPatientDetailsTab();
  cy.getByData('q-item-integer-box').eq(0).find('input').clear().wait(50);
  cy.initAgeValue(60);

  cy.clickOnRendererOperation('Save Progress');
  cy.wait('@savingResponse');
});

export {};

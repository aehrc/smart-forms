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
  cy.getByData('list-button-renderer-operation');
  cy.contains('Preview').click();
  cy.location('pathname').should('eq', '/renderer/preview');
});

Cypress.Commands.add('clickOnNavPage', (operationName: string) => {
  cy.getByData('list-button-renderer-nav-page');
  cy.contains(operationName).click();
});

Cypress.Commands.add('clickOnRendererOperation', (operationName: string) => {
  cy.getByData('list-button-renderer-operation');
  cy.contains(operationName).click();
});

Cypress.Commands.add('clickOnViewerOperation', (operationName: string) => {
  cy.getByData('list-button-viewer-operation');
  cy.contains(operationName).click();
});

Cypress.Commands.add('editForm', () => {
  cy.getByData('list-button-renderer-operation');
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
  cy.getByData('response-item-answer').contains(answer);
});

Cypress.Commands.add('waitForFormUpdate', () => {
  cy.getByData('list-button-renderer-operation')
    .contains('Save as Draft')
    .parent()
    .should('not.have.class', 'Mui-disabled');
});

Cypress.Commands.add('waitForPopulation', () => {
  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';

  cy.intercept({
    method: 'POST',
    url: clientUrl
  }).as('populating');

  cy.wait('@populating').its('response.statusCode').should('eq', 200);
  cy.getByData('form-heading').should('be.visible');
});

Cypress.Commands.add('launchFromSMARTHealthIT', () => {
  const launchUrl =
    'http://localhost:3000/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  cy.visit(launchUrl);
});

Cypress.Commands.add('goToResponsesPage', () => {
  cy.getByData('list-button-dashboard-nav-page');
  cy.contains('Responses').click();
});

Cypress.Commands.add('waitForExistingResponses', () => {
  const fetchQuestionnaireRegex = new RegExp(
    /^https:\/\/launch\.smarthealthit\.org\/v\/r4\/fhir\/QuestionnaireResponse\?questionnaire=.+$/i
  );
  cy.intercept(fetchQuestionnaireRegex).as('loadExistingResponses');

  cy.getByData('list-button-dashboard-operation');
  cy.wait('@loadExistingResponses').its('response.statusCode').should('eq', 200);
});

export {};

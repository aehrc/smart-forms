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
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('getByData', (selector, ...args) => {
  return cy.get(`[data-test*=${selector}]`, ...args);
});

Cypress.Commands.add('previewForm', () => {
  cy.getByData('button-expand-nav').click();
  cy.getByData('list-button-renderer-operation');
  cy.contains('Preview').click();
  cy.location('pathname').should('eq', '/renderer/preview');
  cy.get('.simplebar-content').type('{esc}');
});

Cypress.Commands.add('editForm', () => {
  cy.getByData('button-expand-nav').click();
  cy.getByData('list-button-renderer-operation');
  cy.contains('Editor').click();
  cy.location('pathname').should('eq', '/renderer');
  cy.get('.simplebar-content').type('{esc}');
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
    .type(age.toString())
    .wait(50);
});

Cypress.Commands.add('checkResponseTextAndAnswer', (text: string, answer: string) => {
  cy.getByData('response-item-text').contains(text);
  cy.getByData('response-item-answer').contains(answer);
});

export {};

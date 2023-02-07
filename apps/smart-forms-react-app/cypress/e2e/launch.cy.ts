/// <reference types="cypress" />
/// <reference path="../global.d.ts"/>

describe('launching app', () => {
  context('launching without authorisation', () => {
    it('redirects from launch page to renderer', () => {
      cy.visit('http://localhost:3000/launch');
      cy.intercept('/').as('homepage');
      cy.wait('@homepage').its('response.statusCode').should('eq', 200);

      cy.location('pathname').should('eq', '/');
    });
  });

  context('launching with authorisation', () => {
    const patientId = 'd64b37f5-d3b5-4c25-abe8-23ebe8f5a04e';

    it.only('redirects from launch page to renderer', () => {
      cy.intercept('https://launch.smarthealthit.org/v/r4/auth/token').as('authorising');
      cy.intercept('http://localhost:3000/').as('authPage');
      cy.intercept(
        'https://launch.smarthealthit.org/v/r4/fhir/Questionnaire?_count=10&_sort=-&'
      ).as('fetchQuestionnaire');
      cy.intercept(
        `https://launch.smarthealthit.org/v/r4/fhir/QuestionnaireResponse?patient=${patientId}&`
      ).as('fetchQuestionnaireResponse');

      cy.visit(
        'http://localhost:3000/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0'
      );

      cy.wait('@authorising');
      cy.getByData('progress-spinner').find('.MuiTypography-root').contains('Fetching patient');

      // data-test="picker-card-heading-responses"
      cy.wait('@fetchQuestionnaire').its('response.statusCode').should('eq', 200);
      cy.wait('@fetchQuestionnaireResponse').its('response.statusCode').should('eq', 200);

      cy.getByData('picker-card-heading-questionnaires').contains('Questionnaires');
      cy.getByData('picker-card-heading-responses').contains('Responses');
      cy.getByData('picker-alert-refine').find('.MuiAlert-message').contains('Refine your search');

      cy.location('pathname').should('eq', '/');
    });
  });
});

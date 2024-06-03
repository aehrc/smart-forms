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

import { appUrl } from '../e2e/globals.ts';

Cypress.Commands.add('getByData', (selector, ...args) => {
  return cy.get(`[data-test*=${selector}]`, ...args);
});

Cypress.Commands.add('clickOnNavPage', (operationName: string) => {
  cy.getByData('renderer-operation-item');
  cy.contains(operationName).click();
});

Cypress.Commands.add('clickOnRendererOperation', (operationName: string) => {
  cy.getByData('renderer-operation-item');
  cy.contains(operationName).click();
});

Cypress.Commands.add('goToTab', (tabName: string) => {
  cy.getByData('renderer-tab-list').find('.MuiButtonBase-root').contains(tabName).click();
});

Cypress.Commands.add('waitForFormUpdate', () => {
  cy.getByData('updating-indicator').should('exist');
});

Cypress.Commands.add('waitForPopulation', () => {
  const populateRegex = new RegExp(
    /^https:\/\/proxy\.smartforms\.io\/v\/r4\/fhir\/(Observation|Condition)\?.+$/
  );

  cy.intercept(populateRegex).as('populating');

  cy.wait('@populating', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
});

Cypress.Commands.add('launchFromEHRProxy', () => {
  const launchUrl = `${appUrl}/launch?iss=https%3A%2F%2Fproxy.smartforms.io%2Fv%2Fr4%2Ffhir&launch=WzAsInBhdC1zZiIsInByaW1hcnktcGV0ZXIiLCJBVVRPIiwwLDAsMCwiZmhpclVzZXIgb25saW5lX2FjY2VzcyBvcGVuaWQgcHJvZmlsZSBwYXRpZW50L0NvbmRpdGlvbi5ycyBwYXRpZW50L09ic2VydmF0aW9uLnJzIGxhdW5jaCBwYXRpZW50L0VuY291bnRlci5ycyBwYXRpZW50L1F1ZXN0aW9ubmFpcmVSZXNwb25zZS5jcnVkcyBwYXRpZW50L1BhdGllbnQucnMiLCJodHRwOi8vbG9jYWxob3N0OjQxNzMvIiwiYTU3ZDkwZTMtNWY2OS00YjkyLWFhMmUtMjk5MjE4MDg2M2MxIiwiIiwiIiwiIiwiIiwwLDEsIiIsZmFsc2Vd`;
  cy.visit(launchUrl);
});

Cypress.Commands.add('launchFromEHRProxyQuesContext', () => {
  const launchUrl = `${appUrl}/launch?iss=https%3A%2F%2Fproxy.smartforms.io%2Fv%2Fr4%2Ffhir&launch=WzAsInBhdC1zZiIsInByaW1hcnktcGV0ZXIiLCJBVVRPIiwwLDAsMCwiZmhpclVzZXIgb25saW5lX2FjY2VzcyBvcGVuaWQgcHJvZmlsZSBwYXRpZW50L0NvbmRpdGlvbi5ycyBwYXRpZW50L09ic2VydmF0aW9uLnJzIGxhdW5jaCBwYXRpZW50L0VuY291bnRlci5ycyBwYXRpZW50L1F1ZXN0aW9ubmFpcmVSZXNwb25zZS5jcnVkcyBwYXRpZW50L1BhdGllbnQucnMiLCJodHRwOi8vbG9jYWxob3N0OjQxNzMvIiwiYTU3ZDkwZTMtNWY2OS00YjkyLWFhMmUtMjk5MjE4MDg2M2MxIiwiIiwiIiwiIiwiIiwwLDEsIntcInJvbGVcIjpcInF1ZXN0aW9ubmFpcmUtcmVuZGVyLW9uLWxhdW5jaFwiLFwiY2Fub25pY2FsXCI6XCJodHRwOi8vd3d3LmhlYWx0aC5nb3YuYXUvYXNzZXNzbWVudHMvbWJzLzcxNXwwLjEuMC1hc3NlbWJsZWRcIixcInR5cGVcIjpcIlF1ZXN0aW9ubmFpcmVcIn0iLGZhbHNlXQ`;
  cy.visit(launchUrl);
});

Cypress.Commands.add('waitForExistingResponses', () => {
  const fetchQuestionnaireRegex = new RegExp(
    /^https:\/\/proxy\.smartforms\.io\/v\/r4\/fhir\/QuestionnaireResponse\?.+$/
  );
  cy.intercept(fetchQuestionnaireRegex).as('loadExistingResponses');

  cy.wait('@loadExistingResponses', { timeout: 10000 })
    .its('response.statusCode')
    .should('eq', 200);
});

export {};

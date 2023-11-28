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
  const questionnaireTitle = 'Aboriginal and Torres Strait Islander Health Check';

  beforeEach(() => {
    cy.launchFromSMARTHealthIT();
    cy.getByData('questionnaire-list-row').contains(questionnaireTitle).click();

    cy.waitForExistingResponses();
  });

  // FIXME commenting this out because SMART Health IT doesn't use canonical urls
  // it('View responses from a specified questionnaire', () => {
  //   cy.getByData('button-view-responses').should('not.be.disabled').click();
  //   cy.getByData('responses-list-toolbar').should('include.text', questionnaireTitle);
  // });
});

describe('navigate responses page', () => {
  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';
  const formsServerUrl = 'https://smartforms.csiro.au/api/fhir';

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

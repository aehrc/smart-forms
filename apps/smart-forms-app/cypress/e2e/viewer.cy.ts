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

describe('response viewer', () => {
  const formsServerQuestionnaireRegex = new RegExp(
    '^https:\\/\\/api\\.smartforms\\.io\\/fhir\\/Questionnaire\\/.*'
  );

  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';
  const clientQuestionnaireRegex = new RegExp(
    '^https:\\/\\/launch\\.smarthealthit\\.org\\/v\\/r4\\/fhir\\/Questionnaire\\/.*'
  );

  // creating a dummy draft response
  context('creating a dummy draft response', () => {
    it('create a draft response', () => {
      cy.createDraftResponse();
    });
  });

  context('viewing a draft response', () => {
    beforeEach(() => {
      // intercepts
      cy.intercept(
        `${clientUrl}/QuestionnaireResponse?_count=50&_sort=-authored&patient=d64b37f5-d3b5-4c25-abe8-23ebe8f5a04e&`
      ).as('fetchResponse');
      cy.intercept(
        `${clientUrl}/QuestionnaireResponse?_count=50&_sort=-authored&patient=d64b37f5-d3b5-4c25-abe8-23ebe8f5a04e&questionnaire.title:contains=Aboriginal%20and%20Torres%20Strait%20Islander%20Health%20Check`
      ).as('fetchResponseByTitle');

      cy.intercept(formsServerQuestionnaireRegex).as('enableOpenResponseButton');
      cy.intercept(clientQuestionnaireRegex).as('openingResponseClient');

      // ui test process
      cy.launchFromSMARTHealthIT();
      cy.goToResponsesPage();
      cy.wait('@fetchResponse').its('response.statusCode').should('eq', 200);

      cy.getByData('response-list-sort-label').contains('Status').click().click();

      cy.getByData('response-list-row')
        .contains('Aboriginal and Torres Strait Islander Health Check')
        .eq(0)
        .click();

      cy.wait('@enableOpenResponseButton').its('response.statusCode').should('eq', 200);
      cy.getByData('button-open-response').should('not.be.disabled').wait(300).click();

      cy.location('pathname').should('eq', '/viewer');
    });

    it('opening a response', () => {
      cy.getByData('response-preview-box').should(
        'include.text',
        'Aboriginal and Torres Strait Islander Health Check'
      );
    });

    it('edit response', () => {
      cy.clickOnViewerOperation('Edit Response');

      cy.goToPatientDetailsTab();
      cy.initAgeValue(60);

      cy.clickOnRendererOperation('Save as Draft');
    });

    it('save as final', () => {
      const saveAsFinalRegex = new RegExp(
        '^https:\\/\\/launch\\.smarthealthit\\.org\\/v\\/r4\\/fhir\\/QuestionnaireResponse\\/.*'
      );

      cy.intercept({
        method: 'PUT',
        url: saveAsFinalRegex
      }).as('saveAsFinal');

      cy.clickOnViewerOperation('Save as Final');
      cy.get('.MuiButtonBase-root').contains('Save as final').click();
      cy.wait('@saveAsFinal');
      cy.location('pathname').should('eq', '/dashboard/responses');

      cy.getByData('response-list-sort-label').contains('Status').click();
      cy.getByData('response-list-row').eq(0).should('include.text', 'completed');
    });

    it('print preview', () => {
      cy.getByData('list-button-viewer-operation');
      cy.contains('Print Preview').should('be.visible');
    });
  });
});

export {};

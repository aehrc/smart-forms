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

describe('populate form', () => {
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

  it('form items in Patient Details tab have expected populated answers', () => {
    cy.goToPatientDetailsTab();

    cy.getByData('q-item-string-box').eq(0).find('input').should('have.value', 'Lucio, Benito Mr.');
    cy.getByData('q-item-date-box').eq(0).find('input').should('have.value', '18/08/1936');

    cy.getByData('q-item-choice-radio-answer-value-set-box')
      .should('include.text', 'Gender')
      .find('input')
      .eq(1)
      .should('be.checked');
  });

  it('repeat items in Medical history tab have expected populated answers', () => {
    cy.goToTab('Medical history and current problems');

    cy.getByData('q-item-open-choice-autocomplete-field')
      .eq(0)
      .find('input')
      .should('have.value', 'Body mass index 30+ - obesity (finding)');
    cy.getByData('q-item-open-choice-autocomplete-field')
      .eq(1)
      .find('input')
      .should('have.value', 'Viral sinusitis (disorder)');
    cy.getByData('q-item-open-choice-autocomplete-field')
      .eq(2)
      .find('input')
      .should('have.value', "Alzheimer's disease (disorder)");
    cy.getByData('q-item-open-choice-autocomplete-field')
      .eq(3)
      .find('input')
      .should('have.value', 'Viral sinusitis (disorder)');
    cy.getByData('q-item-open-choice-autocomplete-field')
      .eq(7)
      .find('input')
      .should('have.value', 'Polyp of colon');
  });

  it('form preview has the expected populated answers', () => {
    cy.goToPatientDetailsTab();

    cy.getByData('q-item-boolean-box')
      .should('contain.text', 'No fixed address')
      .find('input')
      .eq(0)
      .should('not.be.checked');

    cy.previewForm();

    cy.getByData('response-item-text').contains('Name');
    cy.getByData('response-item-answer').contains('Lucio, Benito Mr.');

    cy.getByData('response-item-text').contains('Date of birth');
    cy.getByData('response-item-answer').contains('18/08/1936');

    cy.getByData('response-item-text').contains('Age');
    cy.getByData('response-item-answer').contains('86');

    cy.getByData('response-item-text').contains('Gender');
    cy.getByData('response-item-answer').contains('Male');

    cy.getByData('response-item-text').contains('No fixed address');
    cy.getByData('response-item-answer').contains('False');

    cy.getByData('response-item-text').contains('Street address');
    cy.getByData('response-item-answer').contains('320 Ritchie Byway');

    cy.getByData('response-item-text').contains('City');
    cy.getByData('response-item-answer').contains('Boston');

    cy.getByData('response-item-text').contains('Postcode');
    cy.getByData('response-item-answer').contains('02108');

    cy.getByData('response-item-text').contains(
      'Other relevant medical history, operations, hospital admissions, etc'
    );
    cy.getByData('response-item-answer').contains('Body mass index 30+ - obesity (finding)');
    cy.getByData('response-item-answer').contains('Viral sinusitis (disorder)');
    cy.getByData('response-item-answer').contains("Alzheimer's disease (disorder)");
    cy.getByData('response-item-answer').contains('Polyp of colon');
  });
});

export {};

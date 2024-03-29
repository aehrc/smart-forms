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

describe('repeat items functionality', () => {
  const ontoserverExpandRegex = new RegExp(
    /^https:\/\/r4\.ontoserver\.csiro\.au\/fhir\/ValueSet\/\$expand\?url=.*$/
  );

  beforeEach(() => {
    cy.launchFromSMARTHealthIT();
    cy.getByData('questionnaire-list-row')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.getByData('button-create-response').click();
    cy.waitForPopulation();

    cy.goToPatientDetailsTab();
    cy.initAgeValue(60);
  });

  it('add button is disabled if there is no input in the last field', () => {
    cy.intercept(ontoserverExpandRegex).as('ontoserverExpand');

    cy.goToPatientDetailsTab();

    cy.getByData('q-item-repeat-box')
      .should('include.text', 'Home phone')
      .find('input')
      .eq(1)
      .clear()
      .type('1234567890')
      .waitForFormUpdate();

    cy.getByData('button-add-repeat-item').eq(0).should('not.be.disabled');

    cy.getByData('q-item-repeat-box')
      .should('include.text', 'Home phone')
      .find('input')
      .eq(1)
      .clear()
      .waitForFormUpdate();
  });
});

export {};

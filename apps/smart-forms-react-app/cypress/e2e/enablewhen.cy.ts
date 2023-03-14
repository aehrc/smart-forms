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

describe('enable when functionality', () => {
  beforeEach(() => {
    cy.launchFromSMARTHealthIT();
    cy.getByData('questionnaire-list-row')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.getByData('button-create-response').click();
    cy.waitForPopulation();

    cy.goToPatientDetailsTab();
    cy.initAgeValue(50);
  });

  it('reveal and hide items within a single tab', () => {
    cy.goToTab('Healthy eating');

    cy.getByData('q-item-text-box')
      .should('include.text', 'Details')
      .should('be.visible')
      .should('have.length', 2);

    cy.getByData('q-item-choice-radio-answer-value-set-box')
      .should('include.text', 'Do you have any worries about your diet or weight?')
      .find('input')
      .eq(0)
      .check();

    cy.getByData('q-item-text-box')
      .should('include.text', 'Details')
      .should('be.visible')
      .should('have.length', 3);

    cy.getByData('q-item-choice-radio-answer-value-set-box')
      .should('include.text', 'Do you have any worries about your diet or weight?')
      .find('input')
      .eq(1)
      .check();

    cy.getByData('q-item-text-box')
      .should('include.text', 'Details')
      .should('be.visible')
      .should('have.length', 2);
  });

  it('reveal and hide tabs', () => {
    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .should('be.visible')
      .should('have.length', 28);

    cy.getByData('q-item-integer-box').eq(0).find('input').clear().type('4').waitForFormUpdate();

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .should('be.visible')
      .should('have.length', 19);
  });

  it('reveal and hide items across multiple tabs', () => {
    cy.goToTab('Examination');

    cy.getByData('q-item-decimal-box').should('not.include.text', 'Head circumference');

    cy.goToPatientDetailsTab();
    cy.getByData('q-item-integer-box')
      .eq(0)
      .find('input')
      .clear()
      .wait(50)
      .type('10')
      .waitForFormUpdate();

    cy.goToTab('Examination');
    cy.getByData('q-item-decimal-box').eq(2).find('p').should('have.text', 'Head circumference');
  });

  it('reveal/hide items with enableBehavior=all, all enableWhen conditions have to be satisfied', () => {
    cy.goToTab('Finalising the health check');

    cy.getByData('q-item-text-box').should(
      'not.include.text',
      'Patient priorities and goals: What does the parent/carer and child say are the important things that have come out of this health check?'
    );

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Patient Details')
      .click();
    cy.getByData('q-item-integer-box')
      .eq(0)
      .find('input')
      .clear()
      .wait(50)
      .type('6')
      .waitForFormUpdate();

    cy.goToTab('Finalising the health check');
    cy.getByData('q-item-text-box')
      .should(
        'include.text',
        'Patient priorities and goals: What does the parent/carer and child say are the important things that have come out of this health check?'
      )
      .should('be.visible');

    cy.goToTab('Patient Details');
    cy.getByData('q-item-integer-box').eq(0).find('input').clear().type('4').waitForFormUpdate();

    cy.getByData('q-item-text-box').should(
      'not.include.text',
      'Patient priorities and goals: What does the parent/carer and child say are the important things that have come out of this health check?'
    );
  });

  it('reveal/hide items with enableBehavior=any, only one of the multiple conditions has to be satisfied', () => {
    cy.goToTab('Finalising the health check');

    cy.getByData('q-item-date-box').should('not.exist');

    cy.getByData('q-item-open-choice-select-answer-option-box')
      .should('include.text', 'Who')
      .find('input')
      .type('gp{enter}')
      .waitForFormUpdate();

    cy.getByData('q-item-date-box').should('exist').should('include.text', 'When');
  });
});

export {};

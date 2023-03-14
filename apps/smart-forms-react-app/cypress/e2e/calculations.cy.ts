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

describe('calculations via variables', () => {
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

  it('enter weight and height inputs, then verify calculated BMI', () => {
    const weightInKg = 70;
    const heightInCm = 180;
    const bmi = weightInKg / Math.pow(heightInCm / 100, 2);

    cy.goToTab('Examination');

    cy.getByData('q-item-decimal-box').eq(0).find('input').type(heightInCm.toString());
    cy.getByData('q-item-decimal-box').eq(1).find('input').type(weightInKg.toString());
    cy.getByData('q-item-decimal-box')
      .eq(2)
      .find('input')
      .should('be.disabled')
      .should('have.value', parseFloat(bmi.toFixed(2)).toString());
  });

  it('enter inputs for cardiovascular risk calculation, then verify calculated score', () => {
    const systolicBP = 140;
    const totCholesterol = 6;
    const hdlCholesterol = 4;

    cy.goToTab('Absolute cardiovascular risk calculation');

    cy.getByData('q-item-decimal-box').eq(0).find('input').type(systolicBP.toString());
    cy.getByData('q-item-decimal-box').eq(1).find('input').type(totCholesterol.toString());

    cy.getByData('q-item-decimal-box').eq(2).find('input').type(hdlCholesterol.toString());

    cy.getByData('q-item-integer-box').eq(0).find('input').should('have.value', '1');

    cy.getByData('q-item-boolean-box').eq(0).find('input').check();
    cy.getByData('q-item-integer-box').eq(0).find('input').should('have.value', '3');

    cy.getByData('q-item-boolean-box').eq(1).find('input').check();
    cy.getByData('q-item-integer-box').eq(0).find('input').should('have.value', '6');

    cy.goToTab('Substance use, including tobacco');
    cy.getByData('q-item-choice-radio-answer-option-box').eq(0).find('input').eq(1).check();

    cy.goToTab('Absolute cardiovascular risk calculation');
    cy.getByData('q-item-integer-box').eq(0).find('input').should('have.value', '11');
  });
});

export {};

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

describe('open choice component behaviour', () => {
  beforeEach(() => {
    cy.launchFromSMARTHealthIT();
    cy.getByData('questionnaire-list-row')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.getByData('button-create-response').click();
    cy.waitForPopulation();

    cy.goToPatientDetailsTab();
    cy.initAgeValue(50);

    cy.goToTab('Finalising the health check');
  });

  context('open choice checkbox answer option component with repeats', () => {
    const itemText = 'Brief intervention: advice and information provided during health check';
    const indexFirstCheckboxToBeChecked = 0;
    const indexSecondCheckboxToBeChecked = 2;
    const openLabelInput = 'Increase protein intake';

    const expectedAnswerFirst = 'Healthy eating';
    const expectedAnswerSecond = 'Mental health and wellbeing';

    it('reflects changes in questionnaire response on selection of first checkbox', () => {
      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstCheckboxToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
    });

    it('reflects changes in questionnaire response on checking second checkbox then unchecking it', () => {
      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstCheckboxToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondCheckboxToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerSecond);

      cy.editForm();

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondCheckboxToBeChecked)
        .uncheck()
        .should('not.be.checked')
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
      cy.getByData('response-item-answer').should('not.have.text', expectedAnswerSecond);
    });

    it('reflects changes in questionnaire response on open label input', () => {
      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstCheckboxToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .getByData('q-item-checkbox-open-label-field')
        .find('input')
        .should('be.disabled');

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .getByData('q-item-checkbox-open-label-box')
        .eq(0)
        .find('input')
        .eq(0)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .getByData('q-item-checkbox-open-label-field')
        .find('input')
        .should('not.be.disabled')
        .type(openLabelInput)
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
      cy.checkResponseTextAndAnswer(itemText, openLabelInput);

      cy.editForm();

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .getByData('q-item-checkbox-open-label-field')
        .find('input')
        .clear()
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
      cy.getByData('response-item-answer').should('not.contain.text', openLabelInput);

      cy.editForm();

      // Check open label, enter input and uncheck again
      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .find('input')
        .eq(0)
        .check()
        .waitForFormUpdate();

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .getByData('q-item-checkbox-open-label-field')
        .find('input')
        .type(openLabelInput)
        .waitForFormUpdate()
        .wait(200); // Add wait here to take debounced input duration into account

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .find('input')
        .eq(0)
        .uncheck()
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
      cy.getByData('response-item-answer').should('not.contain.text', openLabelInput);
    });
  });

  context('open choice autocomplete component', () => {
    const itemText = 'Other relevant medical history, operations, hospital admissions, etc';
    const ontoserverExpandRegex = new RegExp(
      /^https:\/\/r4\.ontoserver\.csiro\.au\/fhir\/ValueSet\/\$expand\?url=.*$/
    );
    const firstInputToBeSearched = 'Diabetes';
    const secondInputToBeSearched = 'stone';

    beforeEach(() => {
      cy.goToTab('Medical history and current problems');
    });

    it('reflects changes in questionnaire response on selection of autocompleted input', () => {
      cy.intercept(ontoserverExpandRegex).as('ontoserverExpand');

      cy.getByData('q-item-open-choice-autocomplete-field')
        .eq(0)
        .find('input')
        .clear()
        .type(firstInputToBeSearched);
      cy.wait('@ontoserverExpand');

      cy.getByData('q-item-open-choice-autocomplete-field')
        .eq(0)
        .find('input')
        .should('have.value', firstInputToBeSearched)
        .click()
        .type('{enter}')
        .should('contain.value', firstInputToBeSearched);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, firstInputToBeSearched);
    });

    it('reflects changes in questionnaire response on change of input and autocompleted input', () => {
      cy.intercept(ontoserverExpandRegex).as('ontoserverExpand');

      cy.getByData('q-item-open-choice-autocomplete-field')
        .eq(0)
        .find('input')
        .clear()
        .type(firstInputToBeSearched);
      cy.wait('@ontoserverExpand');

      cy.getByData('q-item-open-choice-autocomplete-field')
        .eq(0)
        .find('input')
        .should('have.value', firstInputToBeSearched)
        .click()
        .type('{enter}')
        .should('contain.value', firstInputToBeSearched)
        .clear()
        .type(secondInputToBeSearched);
      cy.wait('@ontoserverExpand');

      cy.getByData('q-item-open-choice-autocomplete-field')
        .eq(0)
        .find('input')
        .should('have.value', secondInputToBeSearched)
        .click()
        .type('{enter}')
        .should('contain.value', secondInputToBeSearched);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, secondInputToBeSearched);
    });
  });

  context('open choice radio answer option component with repeats', () => {
    const itemText = 'Location of health check';
    const indexFirstRadioToBeChecked = 0;
    const indexSecondRadioToBeChecked = 2;
    const openLabelInput = 'Hospital';

    const expectedAnswerFirst = 'Clinic';
    const expectedAnswerSecond = 'School';

    beforeEach(() => {
      cy.goToTab('Consent');
    });

    it('reflects changes in questionnaire response on selection of first radio button', () => {
      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
    });

    it('reflects changes in questionnaire response on checking second checkbox then unchecking it', () => {
      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondRadioToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .should('not.be.checked');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerSecond);
    });

    it('reflects changes in questionnaire response on open label input', () => {
      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-radio-open-label-box')
        .getByData('q-item-radio-open-label-field')
        .find('input')
        .should('be.disabled');

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .getByData('q-item-radio-open-label-box')
        .eq(0)
        .find('input')
        .eq(0)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-radio-open-label-box')
        .getByData('q-item-radio-open-label-field')
        .find('input')
        .should('not.be.disabled')
        .type(openLabelInput)
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, openLabelInput);
      cy.getByData('response-item-answer').should('not.include.text', expectedAnswerFirst);

      cy.editForm();

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-radio-open-label-box')
        .getByData('q-item-radio-open-label-field')
        .find('input')
        .clear()
        .waitForFormUpdate();

      cy.previewForm();

      cy.getByData('response-item-text').should('not.contain.text', itemText);
      cy.getByData('response-item-answer').should('not.contain.text', openLabelInput);

      cy.editForm();

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-radio-open-label-box')
        .find('input')
        .eq(0)
        .check()
        .waitForFormUpdate();

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-radio-open-label-box')
        .getByData('q-item-radio-open-label-field')
        .find('input')
        .type(openLabelInput)
        .waitForFormUpdate();

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
      cy.getByData('response-item-answer').should('not.contain.text', openLabelInput);
    });
  });
});

export {};

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

describe('choice component behaviour', () => {
  beforeEach(() => {
    cy.launchFromSMARTHealthIT();
    cy.getByData('questionnaire-list-row')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.getByData('button-create-response').click();
    cy.waitForPopulation();
  });

  context('choice radio answer option component', () => {
    const itemText = 'Cervical screening status';
    const indexFirstRadioToBeChecked = 0;
    const indexSecondRadioToBeChecked = 2;
    const expectedAnswerFirst = 'Up to date';
    const expectedAnswerSecond = 'Not required';

    beforeEach(() => {
      cy.goToPatientDetailsTab();
      cy.initAgeValue(50);

      cy.goToTab('Participation in screening programs');
    });

    it('reflects changes in questionnaire response on selection of first radio', () => {
      cy.getByData('q-item-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .should('be.checked');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
    });

    it('reflects changes in questionnaire response on change of selection to second radio button', () => {
      cy.getByData('q-item-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondRadioToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .should('not.be.checked');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerSecond);
    });
  });

  context('choice radio answer value set component which uses contained value sets', () => {
    const itemText = 'Eligible for health check';
    const indexFirstRadioToBeChecked = 0;
    const indexSecondRadioToBeChecked = 2;
    const expectedAnswerFirst = 'Yes';
    const expectedAnswerSecond = 'Not applicable';

    beforeEach(() => {
      cy.goToPatientDetailsTab();
      cy.initAgeValue(60);

      cy.goToTab('About the health check');
    });

    it('reflects changes in questionnaire response on selection of first radio button', () => {
      cy.getByData('q-item-choice-radio-answer-value-set-box')
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

    it('reflects changes in questionnaire response on change of selection to second radio button', () => {
      cy.getByData('q-item-choice-radio-answer-value-set-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-choice-radio-answer-value-set-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondRadioToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-choice-radio-answer-value-set-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .should('not.be.checked');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerSecond);
    });
  });

  context(
    'choice radio answer value set component which requires expansion of value sets via external urls',
    () => {
      const itemText = 'Gender';
      const indexFirstRadioToBeChecked = 0;
      const indexSecondRadioToBeChecked = 2;
      const expectedAnswerFirst = 'Female';
      const expectedAnswerSecond = 'Other';

      beforeEach(() => {
        cy.goToPatientDetailsTab();
      });

      it('reflects changes in questionnaire response on selection of first radio button', () => {
        cy.getByData('q-item-choice-radio-answer-value-set-box')
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

      it('reflects changes in questionnaire response on change of selection to second radio button', () => {
        cy.getByData('q-item-choice-radio-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexFirstRadioToBeChecked)
          .check()
          .should('be.checked')
          .waitForFormUpdate();

        cy.getByData('q-item-choice-radio-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexSecondRadioToBeChecked)
          .check()
          .should('be.checked')
          .waitForFormUpdate();

        cy.getByData('q-item-choice-radio-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexFirstRadioToBeChecked)
          .should('not.be.checked');

        cy.previewForm();
        cy.checkResponseTextAndAnswer(itemText, expectedAnswerSecond);
      });
    }
  );

  context('choice checkbox answer option component without repeats', () => {
    const itemText = 'Cervical screening status';
    const indexFirstRadioToBeChecked = 0;
    const indexSecondRadioToBeChecked = 2;
    const expectedAnswerFirst = 'Declined';
    const expectedAnswerSecond = 'Not required';

    beforeEach(() => {
      cy.goToPatientDetailsTab();
      cy.initAgeValue(49);

      cy.goToTab('Genitourinary and sexual health');
    });

    it('reflects changes in questionnaire response on selection of first checkbox', () => {
      cy.wait(100)
        .getByData('q-item-choice-checkbox-answer-option-box')
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

    it('reflects changes in questionnaire response on change of selection to second checkbox ', () => {
      cy.wait(100)
        .getByData('q-item-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondRadioToBeChecked)
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.getByData('q-item-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .should('not.be.checked');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerSecond);
    });
  });

  context(
    'choice checkbox answer value set component which uses contained value sets with repeats',
    () => {
      const itemText = 'Parents/primary carer/s';
      const indexFirstCheckboxToBeChecked = 0;
      const indexSecondCheckboxToBeChecked = 2;
      const expectedAnswerFirst = 'Mother';
      const expectedAnswerSecond = 'Grandparent';

      beforeEach(() => {
        cy.goToPatientDetailsTab();
        cy.initAgeValue(10);
      });

      it('reflects changes in questionnaire response on selection of first checkbox', () => {
        cy.getByData('q-item-choice-checkbox-answer-value-set-box')
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
        cy.getByData('q-item-choice-checkbox-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexFirstCheckboxToBeChecked)
          .check()
          .should('be.checked')
          .waitForFormUpdate();

        cy.getByData('q-item-choice-checkbox-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexSecondCheckboxToBeChecked)
          .check()
          .should('be.checked')
          .waitForFormUpdate();

        cy.previewForm();
        cy.checkResponseTextAndAnswer(itemText, expectedAnswerSecond);

        cy.editForm();

        cy.getByData('q-item-choice-checkbox-answer-value-set-box')
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
    }
  );

  // No autocomplete component for choice type

  context('choice dropdown component which uses contained value sets', () => {
    const itemText = 'Clinical Status';
    const firstInput = 'Active';
    const secondInput = 'Recurrence';

    beforeEach(() => {
      cy.goToPatientDetailsTab();
      cy.initAgeValue(50);
    });

    it('reflects changes in questionnaire response on input', () => {
      cy.goToTab('Medical history and current problems');

      cy.getByData('q-item-choice-dropdown-answer-value-set-field')
        .eq(0)
        .find('input')
        .type(`${firstInput}{enter}`);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, firstInput);
    });

    it('reflects changes in questionnaire response on change of input/selection', () => {
      cy.goToTab('Medical history and current problems');

      cy.getByData('q-item-choice-dropdown-answer-value-set-field')
        .eq(0)
        .find('input')
        .type(`${firstInput}{enter}`)
        .clear()
        .type(`${secondInput}{enter}`)
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, secondInput);
    });
  });

  context(
    'choice dropdown component which requires expansion of value sets via external urls',
    () => {
      const itemText = 'State';
      const firstInput = 'Australian Capital Territory';
      const secondInput = 'Northern Territory';

      beforeEach(() => {
        cy.goToPatientDetailsTab();
      });

      it('reflects changes in questionnaire response on input', () => {
        cy.getByData('q-item-choice-dropdown-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .type(`${firstInput}{enter}`);

        cy.previewForm();
        cy.checkResponseTextAndAnswer(itemText, firstInput);
      });

      it('reflects changes in questionnaire response on change of input/selection', () => {
        cy.getByData('q-item-choice-dropdown-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .type(`${firstInput}{enter}`)
          .clear()
          .type(`${secondInput}{enter}`)
          .waitForFormUpdate();

        cy.previewForm();
        cy.checkResponseTextAndAnswer(itemText, secondInput);
      });
    }
  );
});

export {};

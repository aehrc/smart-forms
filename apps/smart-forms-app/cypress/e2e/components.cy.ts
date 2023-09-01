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

describe('simple component behaviour', () => {
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

  context('string component', () => {
    const itemText = 'Name';
    const input = 'Sean';

    it('reflects changes in questionnaire response on input', () => {
      cy.getByData('q-item-string-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(input)
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, input);
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-string-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(input)
        .clear()
        .waitForFormUpdate();

      cy.previewForm();

      cy.getByData('response-item-text').should('not.have.text', itemText);
      cy.getByData('response-item-answer').should('not.have.text', input);
    });
  });

  context('boolean component', () => {
    const itemText = 'No fixed address';

    it('reflects changes in questionnaire response on check', () => {
      cy.getByData('q-item-boolean-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .should('not.be.checked')
        .check()
        .should('be.checked')
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, 'True');
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-boolean-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .should('not.be.checked')
        .check()
        .should('be.checked')
        .uncheck()
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, 'False');
    });
  });

  context('date picker component', () => {
    const itemText = 'Date of birth';
    const validInput = '02032000';
    const expectedAnswer = '02/03/2000';

    it('reflects changes in questionnaire response on inputting correct date', () => {
      cy.getByData('q-item-date-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(`{leftarrow}{leftarrow}`)
        .type(validInput)
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswer);
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-date-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .clear()
        .type(validInput)
        .clear()
        .waitForFormUpdate();

      cy.previewForm();
      cy.getByData('response-item-text').should('not.have.text', itemText);
      cy.getByData('response-item-answer').should('not.have.text', expectedAnswer);
    });
  });

  context('date time picker component', () => {
    const itemText = 'Onset Date';
    const validInput = '020820230400AM';
    const expectedAnswerWithoutTimeZone = 'August 2, 2023 4:00 AM';

    beforeEach(() => {
      cy.goToTab('Medical history and current problems');
    });

    it('reflects changes in questionnaire response on inputting correct datetime', () => {
      cy.getByData('q-item-date-time-field')
        .find('input')
        .eq(0)
        .type(`{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}`)
        .type(validInput)
        .wait(200)
        .should('have.value', '02/08/2023 04:00 AM');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerWithoutTimeZone);
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-date-time-field')
        .find('input')
        .eq(0)
        .clear()
        .type(validInput)
        .clear()
        .waitForFormUpdate();

      cy.previewForm();

      cy.getByData('response-item-text').should('not.have.text', itemText);
      cy.getByData('response-item-answer').should('not.have.text', expectedAnswerWithoutTimeZone);
    });
  });

  context('text component', () => {
    const itemText = 'Details';
    const input = 'Some details';

    it('reflects changes in questionnaire response on input', () => {
      cy.getByData('q-item-text-box')
        .should('include.text', itemText)
        .find('textarea')
        .eq(0)
        .type(input)
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, input);
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-text-box')
        .should('include.text', itemText)
        .find('textarea')
        .eq(0)
        .type(input)
        .clear()
        .waitForFormUpdate();

      cy.previewForm();
      cy.getByData('response-item-text').should('not.have.text', itemText);
      cy.getByData('response-item-answer').should('not.have.text', input);
    });
  });

  context('integer component', () => {
    const itemText = 'Age';
    const input = '60';

    it('reflects changes in questionnaire response on input', () => {
      cy.getByData('q-item-integer-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .should('have.value', '60');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, input);
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-integer-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .clear()
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, '0');
    });
  });

  context('decimal component', () => {
    const itemText = 'Height';
    const input = '180';

    beforeEach(() => {
      cy.goToTab('Examination');
    });

    it('reflects changes in questionnaire response on input', () => {
      cy.getByData('q-item-decimal-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(input)
        .waitForFormUpdate();

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, input);
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-decimal-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(input)
        .clear()
        .waitForFormUpdate();

      cy.previewForm();
      cy.getByData('response-item-text').should('not.have.text', itemText);
      cy.getByData('response-item-answer').should('not.have.text', input);
    });
  });
});

export {};

describe('simple component behaviour', () => {
  const launchPage = 'http://localhost:3000/launch';

  beforeEach(() => {
    cy.visit(launchPage);

    cy.getByData('questionnaire-list-row')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.getByData('button-create-response').click();
    cy.getByData('form-heading').should('be.visible');

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
        .wait(50);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, input);
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-string-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(input)
        .wait(50)
        .clear()
        .wait(50);

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
        .wait(100)
        .check()
        .wait(50)
        .should('be.checked');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, 'True');
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-boolean-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .should('not.be.checked')
        .wait(100)
        .check()
        .wait(50)
        .should('be.checked')
        .uncheck()
        .wait(50);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, 'False');
    });
  });

  context('date picker component', () => {
    const itemText = 'Date of birth';
    const validInput = '02032000';
    const invalidInput = '0203200';
    const expectedAnswer = '02/03/2000';

    it('reflects changes in questionnaire response on inputting correct date', () => {
      cy.getByData('q-item-date-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(validInput)
        .wait(50);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswer);
    });

    it('reflects changes in questionnaire response on inputting invalid date', () => {
      cy.getByData('q-item-date-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(invalidInput)
        .wait(50);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, 'Invalid Date');
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-date-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(validInput)
        .wait(50)
        .clear()
        .wait(50);

      cy.previewForm();
      cy.getByData('response-item-text').should('not.have.text', itemText);
      cy.getByData('response-item-answer').should('not.have.text', expectedAnswer);
    });
  });

  context('date time picker component', () => {
    const itemText = 'Onset Date';
    const validInput = '020820230400AM';
    const invalidInput = '02022000';
    const expectedAnswerWithoutTimeZone = 'August 2, 2023 4:00 AM';

    beforeEach(() => {
      cy.goToTab('Medical history and current problems');
    });

    it('reflects changes in questionnaire response on inputting correct datetime', () => {
      cy.getByData('q-item-date-time-field')
        .find('input')
        .eq(0)
        .type(validInput)
        .wait(300)
        .should('have.value', '02/08/2023 04:00 AM');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerWithoutTimeZone);
    });

    it('reflects changes in questionnaire response on inputting invalid datetime', () => {
      cy.getByData('q-item-date-time-field').find('input').eq(0).type(invalidInput).wait(200);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, 'Invalid date');
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-date-time-field')
        .find('input')
        .eq(0)
        .type(validInput)
        .wait(200)
        .clear()
        .wait(200);

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
        .wait(50);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, input);
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-text-box')
        .should('include.text', itemText)
        .find('textarea')
        .eq(0)
        .type(input)
        .wait(50)
        .clear()
        .wait(50);

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
        .wait(50);

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
        .wait(200);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, input);
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-decimal-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(input)
        .wait(200)
        .clear()
        .wait(200);

      cy.previewForm();
      cy.getByData('response-item-text').should('not.have.text', itemText);
      cy.getByData('response-item-answer').should('not.have.text', input);
    });
  });
});

export {};

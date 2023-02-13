describe('simple component behaviour', () => {
  const launchPage = 'http://localhost:3000/launch';

  beforeEach(() => {
    cy.visit(launchPage);
    cy.getByData('picker-questionnaire-list')
      .find('.MuiButtonBase-root')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.getByData('button-create-response').click();
    cy.getByData('renderer-heading').should('be.visible');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Patient Details')
      .click();

    cy.getByData('q-item-integer-box').should('include.text', 'Age').find('input').type('60');
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

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(input);
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

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

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

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains('True');
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

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains('False');
    });
  });

  context('date picker component', () => {
    const itemText = 'Date of birth';
    const validInput = '02022000';
    const invalidInput = '0202200';
    const expectedAnswer = '2000-02-02';

    it('reflects changes in questionnaire response on inputting correct date', () => {
      cy.getByData('q-item-date-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(validInput)
        .wait(50);

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(expectedAnswer);
    });

    it('reflects changes in questionnaire response on inputting invalid date', () => {
      cy.getByData('q-item-date-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(invalidInput)
        .wait(50);

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains('Invalid Date');
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

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').should('not.have.text', itemText);
      cy.getByData('response-item-answer').should('not.have.text', expectedAnswer);
    });
  });

  context('date time picker component', () => {
    const itemText = 'Onset Date';
    const validInput = '020820230400AM';
    const invalidInput = '02022000';
    const expectedAnswerWithoutTimeZone = '2023-02-08T04:00:00';

    beforeEach(() => {
      cy.getByData('renderer-tab-list')
        .find('.MuiButtonBase-root')
        .contains('Medical history and current problems')
        .click();
    });

    it('reflects changes in questionnaire response on inputting correct datetime', () => {
      cy.getByData('q-item-date-time-field')
        .find('input')
        .eq(0)
        .type(validInput)
        .wait(300)
        .should('have.value', '02/08/2023 04:00 AM');

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(expectedAnswerWithoutTimeZone);
    });

    it('reflects changes in questionnaire response on inputting invalid datetime', () => {
      cy.getByData('q-item-date-time-field').find('input').eq(0).type(invalidInput).wait(200);

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains('Invalid Date');
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-date-time-field')
        .find('input')
        .eq(0)
        .type(validInput)
        .wait(200)
        .clear()
        .wait(200);

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').should('not.have.text', itemText);
      cy.getByData('response-item-answer').should('not.have.text', expectedAnswer);
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

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(input);
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

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

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

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(input);
    });

    it('removes changes in questionnaire response on clearing field', () => {
      cy.getByData('q-item-integer-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .clear()
        .wait(50);

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').should('not.have.text', itemText);
      cy.getByData('response-item-answer').should('not.have.text', input);
    });
  });

  context('decimal component', () => {
    const itemText = 'Height';
    const input = '180';

    beforeEach(() => {
      cy.getByData('renderer-tab-list').find('.MuiButtonBase-root').contains('Examination').click();
    });

    it('reflects changes in questionnaire response on input', () => {
      cy.getByData('q-item-decimal-box')
        .should('include.text', itemText)
        .find('input')
        .eq(0)
        .type(input)
        .wait(200);

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(input);
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

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').should('not.have.text', itemText);
      cy.getByData('response-item-answer').should('not.have.text', input);
    });
  });
});

export {};

describe('component behaviour', () => {
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
        .type(input);

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
        .clear();

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
        .clear();

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
        .should('be.checked')
        .uncheck();

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains('False');
    });
  });
});

export {};

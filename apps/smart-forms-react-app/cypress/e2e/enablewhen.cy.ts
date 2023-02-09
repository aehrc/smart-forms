describe('enable when', () => {
  const launchPage = 'http://localhost:3000/launch';

  beforeEach(() => {
    cy.visit(launchPage);
  });

  it('reveal and hide items within a single tab', () => {
    cy.getByData('picker-questionnaire-list').find('.MuiButtonBase-root').eq(0).click();
    cy.getByData('button-create-response').click();
    cy.getByData('renderer-heading').should('be.visible');

    cy.getByData('renderer-tab-list').find('.MuiButtonBase-root').eq(1).contains('Consent').click();

    cy.getByData('q-item-choice-radio-answer-option-box').eq(0).find('input').eq(0).check();
    cy.getByData('q-item-string-box').eq(0).find('p').should('have.text', 'Who/details');

    cy.getByData('q-item-choice-radio-answer-option-box').eq(0).find('input').eq(1).check();
    cy.getByData('q-item-string-box').eq(0).find('p').should('have.text', 'Doctor');
  });

  it('reveal and hide tabs', () => {
    // Use assembled 715 questionnaire
    cy.getByData('picker-questionnaire-list').find('.MuiButtonBase-root').eq(4).click();
    cy.getByData('button-create-response').click();
    cy.getByData('renderer-heading').should('be.visible');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .should('be.visible')
      .should('have.length', 15);

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(2)
      .contains('Patient Details')
      .click();
    cy.getByData('q-item-integer-box').eq(0).find('input').type('60');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .should('be.visible')
      .should('have.length', 28);

    cy.getByData('q-item-integer-box').eq(0).find('input').clear().type('4');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .should('be.visible')
      .should('have.length', 19);
  });

  it.only('reveal and hide items across multiple tabs', () => {
    // Use assembled 715 questionnaire
    cy.getByData('picker-questionnaire-list').find('.MuiButtonBase-root').eq(4).click();
    cy.getByData('button-create-response').click();
    cy.getByData('renderer-heading').should('be.visible');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(13)
      .contains('Examination')
      .click();

    cy.getByData('q-item-decimal-box').should('not.include.text', 'Head circumference');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(2)
      .contains('Patient Details')
      .click();
    cy.getByData('q-item-integer-box').eq(0).find('input').type('10');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(17)
      .contains('Examination')
      .click();

    cy.getByData('q-item-decimal-box').eq(2).find('p').should('have.text', 'Head circumference');
  });
});

export {};

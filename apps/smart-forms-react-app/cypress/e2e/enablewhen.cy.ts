describe('enable when in original 715 questionnaire', () => {
  const launchPage = 'http://localhost:3000/launch';

  beforeEach(() => {
    cy.visit(launchPage);
    cy.getByData('picker-questionnaire-list')
      .find('.MuiButtonBase-root')
      .contains('Aboriginal and Torres Strait Islander health check – Adults (25–49 years)')
      .click();
    cy.getByData('button-create-response').click();
    cy.getByData('renderer-heading').should('be.visible');
  });

  it('reveal and hide items within a single tab', () => {
    cy.getByData('renderer-tab-list').find('.MuiButtonBase-root').contains('Consent').click();

    cy.getByData('q-item-choice-radio-answer-option-box').eq(0).find('input').eq(0).check();
    cy.getByData('q-item-string-box').eq(0).find('p').should('have.text', 'Who/details');

    cy.getByData('q-item-choice-radio-answer-option-box').eq(0).find('input').eq(1).check();
    cy.getByData('q-item-string-box').eq(0).find('p').should('have.text', 'Doctor');
  });
});

describe('enable when in assembled 715 questionnaire', () => {
  const launchPage = 'http://localhost:3000/launch';

  beforeEach(() => {
    cy.visit(launchPage);
    cy.getByData('picker-questionnaire-list')
      .find('.MuiButtonBase-root')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.getByData('button-create-response').click();
    cy.getByData('renderer-heading').should('be.visible');
  });

  it('reveal and hide tabs', () => {
    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .should('be.visible')
      .should('have.length', 15);

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
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

  it('reveal and hide items across multiple tabs', () => {
    cy.getByData('renderer-tab-list').find('.MuiButtonBase-root').contains('Examination').click();

    cy.getByData('q-item-decimal-box').should('not.include.text', 'Head circumference');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Patient Details')
      .click();
    cy.getByData('q-item-integer-box').eq(0).find('input').type('10');

    cy.getByData('renderer-tab-list').find('.MuiButtonBase-root').contains('Examination').click();

    cy.getByData('q-item-decimal-box').eq(2).find('p').should('have.text', 'Head circumference');
  });

  it('reveal/hide items with enableBehavior=all, all enableWhen conditions have to be satisfied', () => {
    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Finalising the health check')
      .click();

    cy.getByData('q-item-text-box').should(
      'not.include.text',
      'Patient priorities and goals: What does the parent/carer and child say are the important things that have come out of this health check?'
    );

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Patient Details')
      .click();
    cy.getByData('q-item-integer-box').eq(0).find('input').type('6');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Finalising the health check')
      .click();

    cy.getByData('q-item-text-box')
      .should(
        'include.text',
        'Patient priorities and goals: What does the parent/carer and child say are the important things that have come out of this health check?'
      )
      .should('be.visible');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Patient Details')
      .click();
    cy.getByData('q-item-integer-box').eq(0).find('input').clear().type('4');

    cy.getByData('q-item-text-box').should(
      'not.include.text',
      'Patient priorities and goals: What does the parent/carer and child say are the important things that have come out of this health check?'
    );
  });

  it.only('reveal/hide items with enableBehavior=any, only one of the multiple conditions has to be satisfied', () => {
    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Patient Details')
      .click();
    cy.getByData('q-item-integer-box').eq(0).find('input').type('60');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Finalising the health check')
      .click();

    cy.getByData('q-item-date-box').should('not.exist');

    cy.getByData('q-item-open-choice-select-answer-option-box')
      .should('include.text', 'Who')
      .find('input')
      .type('gp{enter}');

    cy.getByData('q-item-date-box').should('exist').should('include.text', 'When');
  });
});

export {};

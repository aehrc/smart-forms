describe('calculations via variables', () => {
  const launchPage = 'http://localhost:3000/launch';

  beforeEach(() => {
    cy.visit(launchPage);
  });

  it('enter weight and height inputs, then verify calculated BMI', () => {
    const weightInKg = 70;
    const heightInCm = 180;
    const bmi = weightInKg / Math.pow(heightInCm / 100, 2);

    cy.getByData('picker-questionnaire-list').find('.MuiButtonBase-root').eq(0).click();
    cy.getByData('button-create-response').click();
    cy.getByData('renderer-heading').should('be.visible');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(18)
      .contains('Examination')
      .click();

    cy.getByData('q-item-decimal-box').eq(0).find('input').type(heightInCm.toString());
    cy.getByData('q-item-decimal-box').eq(1).find('input').type(weightInKg.toString());
    cy.getByData('q-item-decimal-box')
      .eq(2)
      .find('input')
      .should('be.disabled')
      .should('have.value', bmi.toFixed(2).toString());
  });

  it('enter inputs for cardiovascular risk calculation, then verify calculated score', () => {
    const age = 60;
    const systolicBP = 120;
    const totCholesterol = 6;
    const hdlCholesterol = 4;

    // Use assembled 715 questionnaire
    cy.getByData('picker-questionnaire-list').find('.MuiButtonBase-root').eq(4).click();
    cy.getByData('button-create-response').click();
    cy.getByData('renderer-heading').should('be.visible');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(2)
      .contains('Patient Details')
      .click();

    cy.getByData('q-item-integer-box').eq(0).find('input').type(age.toString());

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(25)
      .contains('Absolute cardiovascular risk calculation')
      .click();

    cy.getByData('q-item-decimal-box').eq(0).find('input').type(systolicBP.toString());
    cy.getByData('q-item-decimal-box').eq(1).find('input').type(totCholesterol.toString());
    cy.getByData('q-item-decimal-box').eq(2).find('input').type(hdlCholesterol.toString());
    cy.getByData('q-item-integer-box').eq(0).find('input').should('have.value', '2');

    cy.getByData('q-item-boolean-box').eq(0).find('input').check();
    cy.getByData('q-item-integer-box').eq(0).find('input').should('have.value', '4');

    cy.getByData('q-item-boolean-box').eq(1).find('input').check();
    cy.getByData('q-item-integer-box').eq(0).find('input').should('have.value', '7');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(17)
      .contains('Substance use, including tobacco')
      .click();

    cy.getByData('q-item-choice-radio-answer-option-box').eq(0).find('input').eq(1).check();

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(25)
      .contains('Absolute cardiovascular risk calculation')
      .click();
    cy.getByData('q-item-integer-box').eq(0).find('input').should('have.value', '13');
  });
});

export {};

describe('calculations via variables', () => {
  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';
  const launchPage = 'http://localhost:3000/launch';

  beforeEach(() => {
    cy.visit(launchPage);
    cy.getByData('picker-questionnaire-list').find('.MuiButtonBase-root').eq(0).click();
    cy.getByData('button-create-response').click();

    cy.getByData('renderer-heading').should('be.visible');
  });

  it('enter weight and height inputs, then verify calculated BMI', () => {
    const weightInKg = 70;
    const heightInCm = 180;
    const bmi = weightInKg / Math.pow(heightInCm / 100, 2);

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(18)
      .contains('Examination')
      .click();

    cy.getByData('q-item-decimal-field').eq(0).find('input').type(heightInCm.toString());
    cy.getByData('q-item-decimal-field').eq(1).find('input').type(weightInKg.toString());
    cy.getByData('q-item-decimal-field')
      .eq(2)
      .find('input')
      .should('be.disabled')
      .should('have.value', bmi.toFixed(2).toString());
  });

  it('enter inputs for cardiovascular risk calculation, then verify calculated score', () => {
    const systolicBP = 120;
    const totCholesterol = 6;
    const hdlCholesterol = 4;

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(19)
      .contains('Absolute cardiovascular risk calculation')
      .click();

    cy.getByData('q-item-decimal-field').eq(0).find('input').type(systolicBP.toString());
    cy.getByData('q-item-decimal-field').eq(1).find('input').type(totCholesterol.toString());
    cy.getByData('q-item-decimal-field').eq(2).find('input').type(hdlCholesterol.toString());
  });
});

export {};

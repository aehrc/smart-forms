describe('repeat items functionality', () => {
  const launchPage = 'http://localhost:3000/launch';
  const ontoserverExpandRegex = new RegExp(
    /^https:\/\/r4\.ontoserver\.csiro\.au\/fhir\/ValueSet\/\$expand\?url=.*$/
  );

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
    cy.getByData('q-item-integer-box').eq(0).find('input').type('60').wait(50);
  });

  it('add button is disabled if there is no input in the last field', () => {
    cy.intercept(ontoserverExpandRegex).as('ontoserverExpand');

    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Medical history and current problems')
      .click();

    cy.getByData('q-item-repeat-box').getByData('button-add-repeat-item').should('be.disabled');

    cy.getByData('q-item-repeat-box')
      .eq(0)
      .getByData('q-item-open-choice-autocomplete-field')
      .eq(0)
      .type('diabetes')
      .wait(50);

    cy.wait('@ontoserverExpand');

    cy.getByData('q-item-repeat-box')
      .eq(0)
      .getByData('q-item-open-choice-autocomplete-field')
      .eq(0)
      .type('{enter}')
      .wait(50);

    cy.getByData('q-item-repeat-box').getByData('button-add-repeat-item').should('not.be.disabled');
  });
});

export {};

describe('repeat items functionality', () => {
  const launchPage = 'http://localhost:3000/launch';
  const ontoserverExpandRegex = new RegExp(
    /^https:\/\/r4\.ontoserver\.csiro\.au\/fhir\/ValueSet\/\$expand\?url=.*$/
  );

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

  it('add button is disabled if there is no input in the last field', () => {
    cy.intercept(ontoserverExpandRegex).as('ontoserverExpand');

    cy.goToTab('Medical history and current problems');

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

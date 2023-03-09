describe('repeat items functionality', () => {
  const ontoserverExpandRegex = new RegExp(
    /^https:\/\/r4\.ontoserver\.csiro\.au\/fhir\/ValueSet\/\$expand\?url=.*$/
  );

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

  it('add button is disabled if there is no input in the last field', () => {
    cy.intercept(ontoserverExpandRegex).as('ontoserverExpand');

    cy.goToPatientDetailsTab();

    cy.getByData('q-item-repeat-box')
      .should('include.text', 'Home phone')
      .find('input')
      .eq(1)
      .clear()
      .type('1234567890')
      .waitForFormUpdate();

    cy.getByData('button-add-repeat-item').eq(0).should('not.be.disabled');

    cy.getByData('q-item-repeat-box')
      .should('include.text', 'Home phone')
      .find('input')
      .eq(1)
      .clear()
      .waitForFormUpdate();

    cy.getByData('button-add-repeat-item').eq(0).should('be.disabled');
  });
});

export {};

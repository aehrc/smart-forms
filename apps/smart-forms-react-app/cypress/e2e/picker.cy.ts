describe('navigating picker', () => {
  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';
  const launchUrl =
    'http://localhost:3000/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  it('selecting a questionnaire and creating a new response', () => {
    cy.intercept(`${clientUrl}/Questionnaire?_count=10&_sort=-&`).as('fetchQuestionnaire');
    cy.intercept(
      `${clientUrl}/Questionnaire?_count=10&_sort=-&title=Aboriginal%20and%20Torres%20Strait%20Islander%20health%20check`
    ).as('fetchQuestionnaireByTitle');
    cy.intercept({
      method: 'POST',
      url: clientUrl
    }).as('populating');

    cy.visit(launchUrl);

    cy.wait('@fetchQuestionnaire').its('response.statusCode').should('eq', 200);

    cy.getByData('picker-search-field-desktop')
      .find('input')
      .should('not.be.disabled')
      .type('Aboriginal and Torres Strait Islander health check');
    cy.wait('@fetchQuestionnaireByTitle').its('response.statusCode').should('eq', 200);
    cy.getByData('picker-questionnaire-list').find('.MuiButtonBase-root').eq(0).click();
    cy.getByData('button-create-response').click();

    cy.wait('@populating').its('response.statusCode').should('eq', 200);
    cy.getByData('renderer-heading').should('be.visible');
  });
});

export {};

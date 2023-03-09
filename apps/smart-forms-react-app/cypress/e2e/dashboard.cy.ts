// TODO create test to navigate dashboard
/*
cy.intercept(
  `${clientUrl}/QuestionnaireResponse?_count=50&_sort=-date&patient=${patientId}&`
).as('fetchQuestionnaireResponse');
  cy.wait('@fetchQuestionnaireResponse').its('response.statusCode').should('eq', 200);
*/

describe('navigate dashboard', () => {
  const formsServerUrl = process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';

  const launchUrlWithQuestionnaireParam =
    'http://localhost:3000/launch?questionnaireUrl=http%3A%2F%2Fwww.health.gov.au%2Fassessments%2Fmbs%2F715&iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  const launchUrlWithoutQuestionnaire =
    'http://localhost:3000/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  it('selecting a questionnaire and creating a new response', () => {
    cy.intercept(`${formsServerUrl}/Questionnaire?_count=100&_sort=-date&`).as(
      'fetchQuestionnaire'
    );
    cy.intercept(
      `${formsServerUrl}/Questionnaire?_count=100&_sort=-date&title:contains=Aboriginal%20and%20Torres%20Strait%20Islander%20Health%20Check`
    ).as('fetchQuestionnaireByTitle');

    cy.visit(launchUrlWithoutQuestionnaire);

    cy.wait('@fetchQuestionnaire').its('response.statusCode').should('eq', 200);

    cy.getByData('search-field-questionnaires')
      .find('input')
      .type('Aboriginal and Torres Strait Islander Health Check');

    cy.wait('@fetchQuestionnaireByTitle').its('response.statusCode').should('eq', 200);

    cy.getByData('questionnaire-list-row')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.getByData('button-create-response').click();

    cy.waitForPopulation();
  });
});

export {};

describe('pre-test setup', () => {
  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';
  const formsServerUrl = 'https://api.smartforms.io/fhir';

  beforeEach(() => {
    cy.launchFromSMARTHealthIT();
  });

  it('selecting a questionnaire and creating a new response', () => {
    cy.intercept(`${formsServerUrl}/Questionnaire?_count=100&_sort=-date&`).as(
      'fetchQuestionnaire'
    );
    cy.intercept(
      `${formsServerUrl}/Questionnaire?_count=100&_sort=-date&title:contains=Aboriginal%20and%20Torres%20Strait%20Islander%20Health%20Check`
    ).as('fetchQuestionnaireByTitle');
    cy.intercept(`${clientUrl}/QuestionnaireResponse`).as('saveAsDraft');

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

    cy.getByData('q-item-choice-radio-answer-value-set-box')
      .should('include.text', 'Aboriginal and/or Torres Strait Islander status')
      .eq(0)
      .find('input')
      .check()
      .should('be.checked')
      .waitForFormUpdate();

    cy.clickOnRendererOperation('Save as Draft');
    cy.wait('@saveAsDraft').its('response.statusCode').should('eq', 201);
    cy.clickOnNavPage('Back to Questionnaires');
  });
});

export {};

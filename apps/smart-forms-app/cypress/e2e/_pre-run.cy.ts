import { ehrUrl, formsServerUrl } from './globals';

describe('pre-run', () => {
  it('Launch without questionnaire context, select a questionnaire and create a new response', () => {
    cy.launchFromEHRProxy();

    cy.intercept(`${formsServerUrl}/Questionnaire?_count=100&_sort=-date&`).as(
      'fetchQuestionnaire'
    );
    cy.intercept(
      `${formsServerUrl}/Questionnaire?_count=100&_sort=-date&title:contains=Aboriginal%20and%20Torres%20Strait%20Islander%20Health%20Check`
    ).as('fetchQuestionnaireByTitle');
    cy.intercept(`${ehrUrl}/QuestionnaireResponse`).as('saveAsDraft');

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
      .should('include.text', 'Eligible for health check')
      .eq(0)
      .find('input')
      .eq(0)
      .check()
      .should('be.checked')
      .waitForFormUpdate();

    cy.clickOnRendererOperation('Save Progress');
    cy.wait('@saveAsDraft').its('response.statusCode').should('eq', 201);
    cy.clickOnNavPage('Back to Questionnaires');
  });
});

export {};

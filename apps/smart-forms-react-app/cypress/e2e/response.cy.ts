describe('save response', () => {
  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';
  const launchUrl =
    'http://localhost:3000/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  beforeEach(() => {
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
      .type('Aboriginal and Torres Strait Islander health check')
      .wait(50);

    cy.wait('@fetchQuestionnaireByTitle').its('response.statusCode').should('eq', 200);
    cy.getByData('picker-questionnaire-list')
      .find('.MuiButtonBase-root')
      .contains('Aboriginal and Torres Strait Islander health check – Adults (25–49 years)')
      .click();
    cy.getByData('button-create-response').click();

    cy.wait('@populating').its('response.statusCode').should('eq', 200);
    cy.getByData('renderer-heading').should('be.visible');
  });

  context('saving a response as draft', () => {
    it('saving a response as draft', () => {
      cy.intercept({
        method: 'POST',
        url: 'https://launch.smarthealthit.org/v/r4/fhir/QuestionnaireResponse'
      }).as('savingResponse');

      cy.getByData('chip-save-as-draft').should('be.visible').should('have.class', 'Mui-disabled');
      cy.getByData('alert-response-saved').should('not.be.visible');
      cy.getByData('q-item-radio-group').eq(0).find('input').eq(0).check().wait(50);
      cy.getByData('chip-save-as-draft').click();

      cy.wait('@savingResponse');
      cy.getByData('chip-save-as-draft').should('be.visible').should('have.class', 'Mui-disabled');
      cy.getByData('alert-response-saved').should('be.visible');
    });

    it('saving a response as final', () => {
      cy.getByData('chip-save-as-final').should('be.visible').should('have.class', 'Mui-disabled');
      cy.getByData('q-item-radio-group').eq(0).find('input').eq(0).check().wait(50);
      cy.getByData('chip-save-as-final').click();
      cy.getByData('dialog-confirm-save').find('button').contains('Save as final').click();
    });
  });
});

describe('view response', () => {
  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';
  const launchUrl =
    'http://localhost:3000/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  beforeEach(() => {
    cy.intercept(`${clientUrl}/Questionnaire?_count=10&_sort=-&`).as('fetchQuestionnaire');
    cy.intercept(
      `${clientUrl}/Questionnaire?_count=10&_sort=-&title=Aboriginal%20and%20Torres%20Strait%20Islander%20health%20check`
    ).as('fetchQuestionnaireByTitle');

    cy.visit(launchUrl);
    cy.wait('@fetchQuestionnaire').its('response.statusCode').should('eq', 200);

    cy.getByData('picker-search-field-desktop')
      .find('input')
      .should('not.be.disabled')
      .type('Aboriginal and Torres Strait Islander health check')
      .wait(50);

    cy.wait('@fetchQuestionnaireByTitle').its('response.statusCode').should('eq', 200);
    cy.getByData('picker-questionnaire-list')
      .find('.MuiButtonBase-root')
      .contains('Aboriginal and Torres Strait Islander health check – Adults (25–49 years)')
      .click();
  });

  it.only('view draft response', () => {
    cy.getByData('picker-questionnaire-list');
  });
});

export {};

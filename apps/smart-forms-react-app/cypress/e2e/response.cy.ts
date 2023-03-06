describe('save response', () => {
  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';
  const formsServerUrl = process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';

  const launchUrlWithoutQuestionnaire =
    'http://localhost:3000/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  beforeEach(() => {
    cy.intercept(`${formsServerUrl}/Questionnaire?_count=100&_sort=-date&`).as(
      'fetchQuestionnaire'
    );
    cy.intercept(
      `${formsServerUrl}/Questionnaire?_count=100&_sort=-date&title:contains=Aboriginal%20and%20Torres%20Strait%20Islander%20Health%20Check`
    ).as('fetchQuestionnaireByTitle');
    cy.intercept({
      method: 'POST',
      url: clientUrl
    }).as('populating');

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

    cy.wait('@populating').its('response.statusCode').should('eq', 200);
    cy.getByData('form-heading').should('be.visible');
  });

  context('saving a response as draft', () => {
    it('saving a response as draft', () => {
      cy.intercept({
        method: 'POST',
        url: 'https://launch.smarthealthit.org/v/r4/fhir/QuestionnaireResponse'
      }).as('savingResponse');

      cy.goToPatientDetailsTab();
      cy.getByData('q-item-integer-box').eq(0).find('input').clear().wait(50);
      cy.initAgeValue(60);

      cy.clickOnOperation('Save as Draft');

      cy.wait('@savingResponse');
    });

    it.only('saving a response as final', () => {
      cy.intercept({
        method: 'POST',
        url: 'https://launch.smarthealthit.org/v/r4/fhir/QuestionnaireResponse'
      }).as('savingResponse');

      cy.goToPatientDetailsTab();
      cy.getByData('q-item-integer-box').eq(0).find('input').clear().wait(50);
      cy.initAgeValue(60);

      cy.getByData('button-expand-nav').click();
      cy.getByData('list-button-renderer-operation');
      cy.contains('Save as Final').click();
      cy.get('.MuiButtonBase-root').contains('Save as final').click();

      cy.wait('@savingResponse');
    });
  });
});

// TODO create test for viewing responses
//
// describe('view response', () => {
//   const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';
//   const launchUrl =
//     'http://localhost:3000/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';
//
//   beforeEach(() => {
//     cy.intercept(`${clientUrl}/Questionnaire?_count=10&_sort=-&`).as('fetchQuestionnaire');
//     cy.intercept(
//       `${clientUrl}/Questionnaire?_count=10&_sort=-&title=Aboriginal%20and%20Torres%20Strait%20Islander%20Health%20Check`
//     ).as('fetchQuestionnaireByTitle');
//
//     cy.visit(launchUrl);
//     cy.wait('@fetchQuestionnaire').its('response.statusCode').should('eq', 200);
//
//     cy.getByData('picker-search-field-desktop')
//       .find('input')
//       .should('not.be.disabled')
//       .type('Aboriginal and Torres Strait Islander Health Check')
//       .wait(50);
//
//     cy.wait('@fetchQuestionnaireByTitle').its('response.statusCode').should('eq', 200);
//     cy.getByData('picker-questionnaire-list')
//       .find('.MuiButtonBase-root')
//       .contains('Aboriginal and Torres Strait Islander Health Check')
//       .click();
//   });
//
//   it('view draft response', () => {
//     cy.getByData('picker-questionnaire-list');
//   });
// });

export {};

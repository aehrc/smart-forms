import Q715 from '../../src/data/resources/715.R4.json';

describe('launch app', () => {
  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';

  context('launch without authorisation', () => {
    const launchPage = 'http://localhost:3000/launch';

    it('from launch page, redirect to picker', () => {
      cy.intercept('/').as('homepage');

      cy.visit(launchPage);
      cy.wait('@homepage').its('response.statusCode').should('eq', 200);
      cy.location('pathname').should('eq', '/');
    });
  });

  context('launch with authorisation without questionnaire url parameter', () => {
    const patientId = 'd64b37f5-d3b5-4c25-abe8-23ebe8f5a04e';
    const launchUrl =
      'http://localhost:3000/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

    it('from launch page, fetch patient and redirect to picker', () => {
      cy.intercept({
        method: 'POST',
        url: 'https://launch.smarthealthit.org/v/r4/auth/token'
      }).as('authorising');
      cy.intercept(`${clientUrl}/Questionnaire?_count=10&_sort=-&`).as('fetchQuestionnaire');
      cy.intercept(`${clientUrl}/QuestionnaireResponse?patient=${patientId}&`).as(
        'fetchQuestionnaireResponse'
      );

      cy.visit(launchUrl);
      cy.wait('@authorising');
      cy.getByData('progress-spinner').find('.MuiTypography-root').contains('Fetching patient');

      cy.wait('@fetchQuestionnaire').its('response.statusCode').should('eq', 200);
      cy.wait('@fetchQuestionnaireResponse').its('response.statusCode').should('eq', 200);
      cy.getByData('picker-card-heading-questionnaires').contains('Questionnaires');
      cy.getByData('picker-card-heading-responses').contains('Responses');
      cy.getByData('picker-alert-refine').find('.MuiAlert-message').contains('Refine your search');
      cy.location('pathname').should('eq', '/');
    });
  });

  context('launch with authorisation with a questionnaire url parameter', () => {
    const questionnaireUrl = 'http://www.health.gov.au/assessments/mbs/715';
    const questionnaireId = 'mbs715';
    const questionnaire = Q715;
    const launchUrl =
      'http://localhost:3000/launch?questionnaireUrl=http%3A%2F%2Fwww.health.gov.au%2Fassessments%2Fmbs%2F715&iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

    it('from launch page, fetch patient and redirect to renderer while populating form', () => {
      cy.intercept({
        method: 'POST',
        url: 'https://launch.smarthealthit.org/v/r4/auth/token'
      }).as('authorising');
      cy.intercept({
        method: 'POST',
        url: clientUrl
      }).as('populating');

      cy.request({
        method: 'GET',
        url: `${clientUrl}/Questionnaire?url=${questionnaireUrl}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('total');

        // PUT questionnaire if it doesn't already exist
        if (response.body.total === 0) {
          cy.request({
            method: 'PUT',
            url: `${clientUrl}/Questionnaire/${questionnaireId}`,
            body: questionnaire
          }).then((response) => {
            expect(response.status).to.satisfy((statusCode: string) => /^2\d\d$/.test(statusCode));
            expect(response.body).to.have.property('resourceType', 'Questionnaire');
            expect(response.body).to.have.property('id', questionnaireId);
          });
        }
      });

      cy.visit(launchUrl);
      cy.wait('@authorising');
      cy.getByData('progress-spinner').find('.MuiTypography-root').contains('Fetching patient');

      cy.wait('@populating');
      cy.getByData('progress-spinner')
        .find('.MuiTypography-root')
        .contains('Populating questionnaire form');
      cy.location('pathname').should('eq', '/');
      cy.getByData('renderer-heading').should('be.visible');
    });
  });
});

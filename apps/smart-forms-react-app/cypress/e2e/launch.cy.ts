import Q715 from '../../src/data/resources/715.R4.json';

describe('launch app', () => {
  context('launch without authorisation', () => {
    it('from launch page, redirect to picker', () => {
      cy.visit('http://localhost:3000/launch');
      cy.intercept('/').as('homepage');
      cy.wait('@homepage').its('response.statusCode').should('eq', 200);

      cy.location('pathname').should('eq', '/');
    });
  });

  context('launch with authorisation without questionnaire url parameter', () => {
    const patientId = 'd64b37f5-d3b5-4c25-abe8-23ebe8f5a04e';

    it('from launch page, fetch patient and redirect to picker', () => {
      cy.intercept({
        method: 'POST',
        url: 'https://launch.smarthealthit.org/v/r4/auth/token'
      }).as('authorising');
      cy.intercept(
        'https://launch.smarthealthit.org/v/r4/fhir/Questionnaire?_count=10&_sort=-&'
      ).as('fetchQuestionnaire');
      cy.intercept(
        `https://launch.smarthealthit.org/v/r4/fhir/QuestionnaireResponse?patient=${patientId}&`
      ).as('fetchQuestionnaireResponse');

      cy.visit(
        'http://localhost:3000/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0'
      );

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
    const smartHealthItLink =
      'http://localhost:3000/launch?questionnaireUrl=http%3A%2F%2Fwww.health.gov.au%2Fassessments%2Fmbs%2F715&iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

    it('from launch page, fetch patient and redirect to renderer while populating form', () => {
      cy.intercept({
        method: 'POST',
        url: 'https://launch.smarthealthit.org/v/r4/auth/token'
      }).as('authorising');
      cy.intercept({
        method: 'POST',
        url: 'https://launch.smarthealthit.org/v/r4/fhir/'
      }).as('populating');
      cy.intercept('http://localhost:3000/').as('populatedForm');

      cy.request({
        method: 'GET',
        url: `https://launch.smarthealthit.org/v/r4/fhir/Questionnaire?url=${questionnaireUrl}`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('total');

        // PUT questionnaire if it doesn't already exist
        if (response.body.total === 0) {
          console.log(response.body.total);
          cy.request({
            method: 'PUT',
            url: `https://launch.smarthealthit.org/v/r4/fhir/Questionnaire/${questionnaireId}`,
            body: questionnaire
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('resourceType', 'Questionnaire');
            expect(response.body).to.have.property('id', questionnaireId);
          });
        }
      });

      cy.visit(smartHealthItLink);

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

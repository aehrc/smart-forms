/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe('launch app in SMART Launcher', () => {
  const formsServerUrl = 'https://smartforms.csiro.au/api/fhir';

  context('launch without authorisation', () => {
    const launchPage = 'http://localhost:5173/launch';

    it('from launch page, redirect to picker', () => {
      cy.visit(launchPage);
      cy.getByData('button-unlaunched-state');
    });
  });

  context('launch with authorisation without questionnaire url parameter', () => {
    const launchUrl =
      'http://localhost:5173/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

    it('from launch page, fetch patient and redirect to questionnaire page', () => {
      cy.intercept({
        method: 'POST',
        url: 'https://launch.smarthealthit.org/v/r4/auth/token'
      }).as('authorising');
      cy.intercept(`${formsServerUrl}/Questionnaire?_count=100&_sort=-date&`).as(
        'fetchQuestionnaire'
      );

      cy.visit(launchUrl);
      cy.wait('@authorising');

      cy.wait('@fetchQuestionnaire').its('response.statusCode').should('eq', 200);

      cy.getByData('dashboard-questionnaires-container').contains('Questionnaires');
      cy.location('pathname').should('eq', '/dashboard/questionnaires');
    });
  });
});

// FIXME commenting out this test as https://launch.smartforms.io/v/r4/fhir is not deployed
// describe('launch app in simulated EHR', () => {
//   const clientUrl = 'https://launch.smartforms.io/v/r4/fhir';
//
//   context('launch with authorisation with a questionnaire url parameter', () => {
//     const questionnaireUrl = 'http://www.health.gov.au/assessments/mbs/715';
//     const questionnaireId = 'AboriginalTorresStraitIslanderHealthCheck';
//     const questionnaire = Q715Assembled;
//     const launchUrl =
//       'http://localhost:5173/launch?iss=https%3A%2F%2Flaunch.smartforms.io%2Fv%2Fr4%2Ffhir&launch=WzAsImIyMThjZWU5LTAxOWQtNDdhNC1iMTYxLWU5N2MwZmQ2ZjczNiIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMSwie1wiUXVlc3Rpb25uYWlyZVwiOlwiQWJvcmlnaW5hbFRvcnJlc1N0cmFpdElzbGFuZGVySGVhbHRoQ2hlY2tcIn0iXQ';
//     it('from launch page, fetch patient and redirect to renderer while populating form', () => {
//       cy.intercept({
//         method: 'POST',
//         url: 'https://launch.smartforms.io/v/r4/auth/token'
//       }).as('authorising');
//       cy.intercept({
//         method: 'POST',
//         url: clientUrl
//       }).as('populating');
//
//       cy.request({
//         method: 'GET',
//         url: `${clientUrl}/Questionnaire?url=${questionnaireUrl}`
//       }).then((response) => {
//         expect(response.status).to.eq(200);
//         expect(response.body).to.have.property('total');
//
//         // PUT questionnaire if it doesn't already exist
//         if (response.body.total === 0) {
//           cy.request({
//             method: 'PUT',
//             url: `${clientUrl}/Questionnaire/${questionnaireId}`,
//             body: questionnaire
//           }).then((response) => {
//             expect(response.status).to.satisfy((statusCode: string) => /^2\d\d$/.test(statusCode));
//             expect(response.body).to.have.property('resourceType', 'Questionnaire');
//             expect(response.body).to.have.property('id', questionnaireId);
//           });
//         }
//       });
//
//       cy.visit(launchUrl);
//       cy.wait('@authorising');
//       cy.wait('@populating');
//       cy.getByData('progress-spinner').find('.MuiTypography-root').contains('Populating form');
//       cy.location('pathname').should('eq', '/renderer');
//       cy.getByData('form-heading').should('be.visible');
//     });
//   });
// });

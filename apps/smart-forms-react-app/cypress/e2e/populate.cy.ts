describe('populate form', () => {
  const formsServerUrl = process.env.REACT_APP_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';

  const launchUrlWithQuestionnaireParam =
    'http://localhost:3000/launch?questionnaireUrl=http%3A%2F%2Fwww.health.gov.au%2Fassessments%2Fmbs%2F715&iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  const launchUrlWithoutQuestionnaire =
    'http://localhost:3000/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  beforeEach(() => {
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

  it('form items in Patient Details tab have expected populated answers', () => {
    cy.goToPatientDetailsTab();

    cy.getByData('q-item-string-box').eq(0).find('input').should('have.value', 'Benito Lucio');
    cy.getByData('q-item-date-box').eq(0).find('input').should('have.value', '18/08/1936');

    cy.getByData('q-item-choice-radio-answer-value-set-box')
      .should('include.text', 'Gender')
      .find('input')
      .eq(1)
      .should('be.checked');
  });

  it('repeat items in Medical history tab have expected populated answers', () => {
    cy.goToTab('Medical history and current problems');

    cy.getByData('q-item-open-choice-autocomplete-field')
      .eq(0)
      .find('input')
      .should('have.value', 'Body mass index 30+ - obesity (finding)');
    cy.getByData('q-item-open-choice-autocomplete-field')
      .eq(1)
      .find('input')
      .should('have.value', 'Viral sinusitis (disorder)');
    cy.getByData('q-item-open-choice-autocomplete-field')
      .eq(2)
      .find('input')
      .should('have.value', "Alzheimer's disease (disorder)");
    cy.getByData('q-item-open-choice-autocomplete-field')
      .eq(3)
      .find('input')
      .should('have.value', 'Viral sinusitis (disorder)');
    cy.getByData('q-item-open-choice-autocomplete-field')
      .eq(7)
      .find('input')
      .should('have.value', 'Polyp of colon');
  });

  it.only('form preview has the expected populated answers', () => {
    cy.goToPatientDetailsTab();

    cy.getByData('q-item-boolean-box')
      .should('contain.text', 'No fixed address')
      .find('input')
      .eq(0)
      .should('not.be.checked');

    cy.previewForm();

    cy.getByData('response-item-text').contains('Name');
    cy.getByData('response-item-answer').contains('Benito Lucio');

    cy.getByData('response-item-text').contains('Date of birth');
    cy.getByData('response-item-answer').contains('18/08/1936');

    cy.getByData('response-item-text').contains('Age');
    cy.getByData('response-item-answer').contains('86');

    cy.getByData('response-item-text').contains('Gender');
    cy.getByData('response-item-answer').contains('Male');

    cy.getByData('response-item-text').contains('No fixed address');
    cy.getByData('response-item-answer').contains('False');

    cy.getByData('response-item-text').contains('Street address');
    cy.getByData('response-item-answer').contains('320 Ritchie Byway');

    cy.getByData('response-item-text').contains('City');
    cy.getByData('response-item-answer').contains('Boston');

    cy.getByData('response-item-text').contains('Postcode');
    cy.getByData('response-item-answer').contains('02108');

    cy.getByData('response-item-text').contains('Home phone');
    cy.getByData('response-item-answer').contains('555-913-5055');

    cy.getByData('response-item-text').contains(
      'Other relevant medical history, operations, hospital admissions, etc'
    );
    cy.getByData('response-item-answer').contains('Body mass index 30+ - obesity (finding)');
    cy.getByData('response-item-answer').contains('Viral sinusitis (disorder)');
    cy.getByData('response-item-answer').contains("Alzheimer's disease (disorder)");
    cy.getByData('response-item-answer').contains('Polyp of colon');
  });
});

export {};

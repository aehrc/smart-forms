describe('populate form', () => {
  const clientUrl = 'https://launch.smarthealthit.org/v/r4/fhir';
  const launchUrl =
    'http://localhost:3000/launch?iss=https%3A%2F%2Flaunch.smarthealthit.org%2Fv%2Fr4%2Ffhir&launch=WzAsImQ2NGIzN2Y1LWQzYjUtNGMyNS1hYmU4LTIzZWJlOGY1YTA0ZSIsImU0NDNhYzU4LThlY2UtNDM4NS04ZDU1LTc3NWMxYjhmM2EzNyIsIkFVVE8iLDAsMCwwLCIiLCIiLCIiLCIiLCIiLCIiLCIiLDAsMV0';

  beforeEach(() => {
    cy.intercept(`${clientUrl}/Questionnaire?_count=10&_sort=-&`).as('fetchQuestionnaire');
    cy.intercept(
      `${clientUrl}/Questionnaire?_count=10&_sort=-&title=Aboriginal%20and%20Torres%20Strait%20Islander%20Health%20Check`
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
      .type('Aboriginal and Torres Strait Islander Health Check')
      .wait(50);

    cy.wait('@fetchQuestionnaireByTitle').its('response.statusCode').should('eq', 200);
    cy.getByData('picker-questionnaire-list')
      .find('.MuiButtonBase-root')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.getByData('button-create-response').click();

    cy.wait('@populating').its('response.statusCode').should('eq', 200);
    cy.getByData('renderer-heading').should('be.visible');
  });

  it('form items in Patient Details tab have expected populated answers', () => {
    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Patient Details')
      .click();

    cy.getByData('q-item-string-box').eq(0).find('input').should('have.value', 'Benito Lucio');
    cy.getByData('q-item-date-box').eq(0).find('input').should('have.value', '18/08/1936');

    cy.getByData('q-item-choice-radio-answer-value-set-box')
      .should('include.text', 'Gender')
      .find('input')
      .eq(1)
      .should('be.checked');
  });

  it('repeat items in Medical history tab have expected populated answers', () => {
    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Medical history and current problems')
      .click();

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
    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .contains('Patient Details')
      .click();

    cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

    cy.getByData('response-item-text').contains('Name');
    cy.getByData('response-item-answer').contains('Benito Lucio');

    cy.getByData('response-item-text').contains('Date of birth');
    cy.getByData('response-item-answer').contains('1936-08-18');

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

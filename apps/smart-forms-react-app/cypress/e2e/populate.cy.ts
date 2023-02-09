describe('populate form', () => {
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
      .type('Aboriginal and Torres Strait Islander health check');

    cy.wait('@fetchQuestionnaireByTitle').its('response.statusCode').should('eq', 200);
    cy.getByData('picker-questionnaire-list').find('.MuiButtonBase-root').eq(0).click();
    cy.getByData('button-create-response').click();

    cy.wait('@populating').its('response.statusCode').should('eq', 200);
    cy.getByData('renderer-heading').should('be.visible');
  });

  it('form items in Patient Details tab have expected populated answers', () => {
    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(2)
      .contains('Patient Details')
      .click();

    cy.getByData('q-item-string-box').eq(0).find('input').should('have.value', 'Benito Lucio');
    cy.getByData('q-item-date-box').eq(0).find('input').should('have.value', '18/08/1936');

    cy.getByData('q-item-radio-group').eq(0).find('input').eq(0).should('be.checked');
    cy.getByData('q-item-radio-group').eq(0).find('input').eq(1).should('not.be.checked');

    cy.getByData('q-item-text-box')
      .eq(0)
      .find('textarea')
      .should('have.value', '320 Ritchie Byway, Boston, Massachusetts 02108');
    cy.getByData('q-item-string-box').eq(1).find('input').should('have.value', '555-913-5055');
  });

  it('repeat items in Medical history tab have expected populated answers', () => {
    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(4)
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

  it('form preview has the expected populated answers', () => {
    cy.getByData('chip-bar-box').find('.MuiButtonBase-root').eq(1).click();

    cy.getByData('response-item-text').eq(0).contains('Name');
    cy.getByData('response-item-answer').eq(0).contains('Benito Lucio');

    cy.getByData('response-item-text').eq(1).contains('Date of birth');
    cy.getByData('response-item-answer').eq(1).contains('1936-08-18');

    cy.getByData('response-item-text').eq(2).contains('Age');
    cy.getByData('response-item-answer').eq(2).contains('87');

    cy.getByData('response-item-text').eq(3).contains('Gender');
    cy.getByData('response-item-answer').eq(3).contains('Male');

    cy.getByData('response-item-text').eq(4).contains('Address');
    cy.getByData('response-item-answer')
      .eq(4)
      .contains('320 Ritchie Byway, Boston, Massachusetts 02108');

    cy.getByData('response-item-text').eq(5).contains('Home phone');
    cy.getByData('response-item-answer').eq(5).contains('555-913-5055');

    cy.getByData('response-item-text')
      .eq(6)
      .contains('Relevant medical history, operations, hospital admissions, etc');
    cy.getByData('response-item-answer').eq(6).contains('Body mass index 30+ - obesity (finding)');
    cy.getByData('response-item-answer').eq(7).contains('Viral sinusitis (disorder)');
    cy.getByData('response-item-answer').eq(8).contains("Alzheimer's disease (disorder)");
    cy.getByData('response-item-answer').eq(13).contains('Polyp of colon');

    cy.getByData('response-item-text').eq(11).contains('Diabetes');
    cy.getByData('response-item-answer').eq(18).contains('False');
  });
});

export {};

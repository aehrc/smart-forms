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

  it('form items have expected populated answers', () => {
    // verify populated items in Patient Details tab
    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(2)
      .contains('Patient Details')
      .click();

    cy.getByData('q-item-string-field').eq(0).find('input').should('have.value', 'Benito Lucio');
    cy.getByData('q-item-date-field').eq(0).find('input').should('have.value', '18/08/1936');

    cy.getByData('q-item-radio-group').eq(0).find('input').eq(0).should('be.checked');
    cy.getByData('q-item-radio-group').eq(0).find('input').eq(1).should('not.be.checked');

    cy.getByData('q-item-text-field')
      .eq(0)
      .find('textarea')
      .should('have.value', '320 Ritchie Byway, Boston, Massachusetts 02108');
    cy.getByData('q-item-string-field').eq(1).find('input').should('have.value', '555-913-5055');

    // verify populated items in Medical History and Current Problems tab
    cy.getByData('renderer-tab-list')
      .find('.MuiButtonBase-root')
      .eq(4)
      .contains('Medical history and current problems')
      .click();

    cy.getByData('q-item-open-choice-autocomplete')
      .eq(0)
      .find('input')
      .should('have.value', 'Body mass index 30+ - obesity (finding)');
    cy.getByData('q-item-open-choice-autocomplete')
      .eq(1)
      .find('input')
      .should('have.value', 'Viral sinusitis (disorder)');
    cy.getByData('q-item-open-choice-autocomplete')
      .eq(2)
      .find('input')
      .should('have.value', "Alzheimer's disease (disorder)");
    cy.getByData('q-item-open-choice-autocomplete')
      .eq(3)
      .find('input')
      .should('have.value', 'Viral sinusitis (disorder)');
    cy.getByData('q-item-open-choice-autocomplete')
      .eq(7)
      .find('input')
      .should('have.value', 'Polyp of colon');
  });
});

export {};

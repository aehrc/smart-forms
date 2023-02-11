describe('choice component behaviour', () => {
  const launchPage = 'http://localhost:3000/launch';

  beforeEach(() => {
    cy.visit(launchPage);
    cy.getByData('picker-questionnaire-list')
      .find('.MuiButtonBase-root')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.getByData('button-create-response').click();
    cy.getByData('renderer-heading').should('be.visible');
  });

  context('choice radio answer value set component which uses contained value sets', () => {
    const itemText = 'Eligible for health check';
    const indexFirstRadioToBeChecked = 0;
    const indexSecondRadioToBeChecked = 2;
    const expectedAnswerFirst = 'Yes';
    const expectedAnswerSecond = 'Not applicable';

    beforeEach(() => {
      cy.getByData('renderer-tab-list')
        .find('.MuiButtonBase-root')
        .contains('Patient Details')
        .click();

      cy.getByData('q-item-integer-box').should('include.text', 'Age').find('input').type('60');

      cy.getByData('q-item-integer-box').should('include.text', 'Age').find('input').type('60');

      cy.getByData('renderer-tab-list')
        .find('.MuiButtonBase-root')
        .contains('About the health check')
        .click();
    });

    it('reflects changes in questionnaire response on selection of first radio button', () => {
      cy.getByData('q-item-choice-radio-answer-value-set-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .should('be.checked');

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(expectedAnswerFirst);
    });

    it('reflects changes in questionnaire response on change of selection to second radio button', () => {
      cy.getByData('q-item-choice-radio-answer-value-set-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .should('be.checked');

      cy.getByData('q-item-choice-radio-answer-value-set-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondRadioToBeChecked)
        .check()
        .should('be.checked');

      cy.getByData('q-item-choice-radio-answer-value-set-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .should('not.be.checked');

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(expectedAnswerSecond);
    });
  });

  context(
    'choice radio answer value set component which expansion of value sets via external urls',
    () => {
      const itemText = 'Gender';
      const indexFirstRadioToBeChecked = 0;
      const indexSecondRadioToBeChecked = 2;
      const expectedAnswerFirst = 'Female';
      const expectedAnswerSecond = 'Other';

      beforeEach(() => {
        cy.intercept(
          'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://hl7.org/fhir/ValueSet/administrative-gender'
        ).as('ontoserverExpand');

        cy.getByData('renderer-tab-list')
          .find('.MuiButtonBase-root')
          .contains('Patient Details')
          .click();

        // wait for valueSet to be expanded
        cy.wait('@ontoserverExpand');
      });

      it('reflects changes in questionnaire response on selection of first radio button', () => {
        cy.getByData('q-item-choice-radio-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexFirstRadioToBeChecked)
          .check()
          .should('be.checked');

        cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

        cy.getByData('response-item-text').contains(itemText);
        cy.getByData('response-item-answer').contains(expectedAnswerFirst);
      });

      it('reflects changes in questionnaire response on change of selection to second radio button', () => {
        cy.getByData('q-item-choice-radio-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexFirstRadioToBeChecked)
          .check()
          .should('be.checked');

        cy.getByData('q-item-choice-radio-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexSecondRadioToBeChecked)
          .check()
          .should('be.checked');

        cy.getByData('q-item-choice-radio-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexFirstRadioToBeChecked)
          .should('not.be.checked');

        cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

        cy.getByData('response-item-text').contains(itemText);
        cy.getByData('response-item-answer').contains(expectedAnswerSecond);
      });
    }
  );

  context.only(
    'choice checkbox answer value set component which uses contained value sets with repeats',
    () => {
      const itemText = 'Parents/primary carer/s';
      const indexFirstRadioToBeChecked = 0;
      const indexSecondRadioToBeChecked = 2;
      const expectedAnswerFirst = 'Mother';
      const expectedAnswerSecond = 'Grandparent';

      beforeEach(() => {
        cy.getByData('renderer-tab-list')
          .find('.MuiButtonBase-root')
          .contains('Patient Details')
          .click();

        cy.getByData('q-item-integer-box')
          .should('include.text', 'Age')
          .find('input')
          .eq(0)
          .type('10');
      });

      it.only('reflects changes in questionnaire response on selection of first checkbox', () => {
        cy.getByData('q-item-choice-checkbox-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexFirstRadioToBeChecked)
          .check()
          .should('be.checked');

        cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

        cy.getByData('response-item-text').contains(itemText);
        cy.getByData('response-item-answer').contains(expectedAnswerFirst);
      });

      it('reflects changes in questionnaire response on checking second checkbox then unchecking it', () => {
        cy.getByData('q-item-choice-checkbox-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexFirstRadioToBeChecked)
          .check()
          .should('be.checked');

        cy.getByData('q-item-choice-radio-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexSecondRadioToBeChecked)
          .check()
          .should('be.checked');

        cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

        cy.getByData('response-item-text').contains(itemText);
        cy.getByData('response-item-answer').contains(expectedAnswerSecond);
        cy.getByData('response-item-answer').contains(expectedAnswerSecond);

        cy.getByData('q-item-choice-radio-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexSecondRadioToBeChecked)
          .check()
          .should('not.be.checked');

        cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

        cy.getByData('response-item-text').contains(itemText);
        cy.getByData('response-item-answer').contains(expectedAnswerFirst);
        cy.getByData('response-item-answer').should('not.have.text', expectedAnswerSecond);
      });
    }
  );
});

export {};

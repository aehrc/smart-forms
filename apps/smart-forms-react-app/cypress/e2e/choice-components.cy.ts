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

  context('choice radio answer option component', () => {
    const itemText = 'Cervical screening status';
    const indexFirstRadioToBeChecked = 0;
    const indexSecondRadioToBeChecked = 2;
    const expectedAnswerFirst = 'Up to date';
    const expectedAnswerSecond = 'Not required';

    beforeEach(() => {
      cy.getByData('renderer-tab-list')
        .find('.MuiButtonBase-root')
        .contains('Patient Details')
        .click();

      cy.getByData('q-item-integer-box')
        .should('include.text', 'Age')
        .find('input')
        .eq(0)
        .type('50')
        .wait(50);

      cy.getByData('renderer-tab-list')
        .find('.MuiButtonBase-root')
        .contains('Participation in screening programs')
        .click();
    });

    it('reflects changes in questionnaire response on selection of first radio', () => {
      cy.getByData('q-item-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(expectedAnswerFirst);
    });

    it('reflects changes in questionnaire response on change of selection to second radio button', () => {
      cy.getByData('q-item-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('q-item-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondRadioToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('q-item-choice-radio-answer-option-box')
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

      cy.getByData('q-item-integer-box')
        .should('include.text', 'Age')
        .find('input')
        .type('60')
        .wait(50);

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
        .wait(50)
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
        .wait(50)
        .should('be.checked');

      cy.getByData('q-item-choice-radio-answer-value-set-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondRadioToBeChecked)
        .check()
        .wait(50)
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
    'choice radio answer value set component which requires expansion of value sets via external urls',
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
          .wait(50)
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
          .wait(50)
          .should('be.checked');

        cy.getByData('q-item-choice-radio-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexSecondRadioToBeChecked)
          .check()
          .wait(50)
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

  context('choice checkbox answer option component without repeats', () => {
    const itemText = 'Cervical screening status';
    const indexFirstRadioToBeChecked = 0;
    const indexSecondRadioToBeChecked = 2;
    const expectedAnswerFirst = 'Declined';
    const expectedAnswerSecond = 'Not required';

    beforeEach(() => {
      cy.getByData('renderer-tab-list')
        .find('.MuiButtonBase-root')
        .contains('Patient Details')
        .click();

      cy.getByData('q-item-integer-box')
        .should('include.text', 'Age')
        .find('input')
        .eq(0)
        .type('49')
        .wait(50);

      cy.getByData('renderer-tab-list')
        .find('.MuiButtonBase-root')
        .contains('Genitourinary and sexual health')
        .click();
    });

    it('reflects changes in questionnaire response on selection of first checkbox', () => {
      cy.getByData('q-item-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(expectedAnswerFirst);
    });

    it('reflects changes in questionnaire response on change of selection to second checkbox ', () => {
      cy.getByData('q-item-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('q-item-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondRadioToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('q-item-choice-checkbox-answer-option-box')
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
    'choice checkbox answer value set component which uses contained value sets with repeats',
    () => {
      const itemText = 'Parents/primary carer/s';
      const indexFirstCheckboxToBeChecked = 0;
      const indexSecondCheckboxToBeChecked = 2;
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
          .type('10')
          .wait(50);
      });

      it('reflects changes in questionnaire response on selection of first checkbox', () => {
        cy.getByData('q-item-choice-checkbox-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexFirstCheckboxToBeChecked)
          .check()
          .wait(50)
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
          .eq(indexFirstCheckboxToBeChecked)
          .check()
          .wait(50)
          .should('be.checked');

        cy.getByData('q-item-choice-checkbox-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexSecondCheckboxToBeChecked)
          .check()
          .wait(50)
          .should('be.checked');

        cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

        cy.getByData('response-item-text').contains(itemText);
        cy.getByData('response-item-answer').contains(expectedAnswerSecond);
        cy.getByData('response-item-answer').contains(expectedAnswerSecond);

        cy.getByData('chip-bar-box')
          .find('.MuiButtonBase-root')
          .contains('Continue Editing')
          .click()
          .wait(100);

        cy.getByData('q-item-choice-checkbox-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .eq(indexSecondCheckboxToBeChecked)
          .uncheck()
          .wait(50)
          .should('not.be.checked');

        cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

        cy.getByData('response-item-text').contains(itemText);
        cy.getByData('response-item-answer').contains(expectedAnswerFirst);
        cy.getByData('response-item-answer').should('not.have.text', expectedAnswerSecond);
      });
    }
  );

  // No autocomplete component for choice type

  context('choice dropdown component which uses contained value sets', () => {
    const itemText = 'Clinical Status';
    const firstInput = 'Active';
    const secondInput = 'Recurrence';

    beforeEach(() => {
      cy.getByData('renderer-tab-list')
        .find('.MuiButtonBase-root')
        .contains('Patient Details')
        .click();

      cy.getByData('q-item-integer-box')
        .should('include.text', 'Age')
        .find('input')
        .eq(0)
        .type('10')
        .wait(50);
    });

    it('reflects changes in questionnaire response on input', () => {
      cy.getByData('renderer-tab-list')
        .find('.MuiButtonBase-root')
        .contains('Medical history and current problems')
        .click();

      cy.getByData('q-item-choice-dropdown-answer-value-set-field')
        .eq(0)
        .find('input')
        .type(`${firstInput}{enter}`);

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(firstInput);
    });

    it('reflects changes in questionnaire response on change of input/selection', () => {
      cy.getByData('renderer-tab-list')
        .find('.MuiButtonBase-root')
        .contains('Medical history and current problems')
        .click();

      cy.getByData('q-item-choice-dropdown-answer-value-set-field')
        .eq(0)
        .find('input')
        .type(`${firstInput}{enter}`)
        .wait(50)
        .clear()
        .type(`${secondInput}{enter}`);

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(secondInput);
    });
  });

  context(
    'choice dropdown component which requires expansion of value sets via external urls',
    () => {
      const itemText = 'State';
      const firstInput = 'Australian Capital Territory';
      const secondInput = 'Northern Territory';

      beforeEach(() => {
        cy.intercept(
          'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://healthterminologies.gov.au/fhir/ValueSet/australian-states-territories-2'
        ).as('ontoserverExpand');

        cy.getByData('renderer-tab-list')
          .find('.MuiButtonBase-root')
          .contains('Patient Details')
          .click();

        // wait for valueSet to be expanded
        cy.wait('@ontoserverExpand');
      });

      it('reflects changes in questionnaire response on input', () => {
        cy.getByData('q-item-choice-dropdown-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .type(`${firstInput}{enter}`);

        cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

        cy.getByData('response-item-text').contains(itemText);
        cy.getByData('response-item-answer').contains(firstInput);
      });

      it('reflects changes in questionnaire response on change of input/selection', () => {
        cy.getByData('q-item-choice-dropdown-answer-value-set-box')
          .should('include.text', itemText)
          .eq(0)
          .find('input')
          .type(`${firstInput}{enter}`)
          .wait(50)
          .clear()
          .type(`${secondInput}{enter}`)
          .wait(50);

        cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

        cy.getByData('response-item-text').contains(itemText);
        cy.getByData('response-item-answer').contains(secondInput);
      });
    }
  );
});

export {};

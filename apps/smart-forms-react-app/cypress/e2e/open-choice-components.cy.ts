describe('open choice component behaviour', () => {
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

  // TODO implement open-choice radio component answerOption with open-label

  context('open choice checkbox answer option component with repeats', () => {
    const itemText = 'Brief intervention: advice and information provided during health check';
    const indexFirstCheckboxToBeChecked = 0;
    const indexSecondCheckboxToBeChecked = 2;
    const openLabelInput = 'Increase protein intake';

    const expectedAnswerFirst = 'Healthy eating';
    const expectedAnswerSecond = 'Mental health and wellbeing';

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
        .contains('Finalising the health check')
        .click();
    });

    it('reflects changes in questionnaire response on selection of first checkbox', () => {
      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
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
      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstCheckboxToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondCheckboxToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(expectedAnswerFirst);
      cy.getByData('response-item-answer').contains(expectedAnswerSecond);

      cy.getByData('chip-bar-box')
        .find('.MuiButtonBase-root')
        .contains('Continue Editing')
        .click()
        .wait(100);

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
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

    it('reflects changes in questionnaire response on open label input', () => {
      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstCheckboxToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .getByData('q-item-checkbox-open-label-field')
        .find('input')
        .should('be.disabled');

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .getByData('q-item-checkbox-open-label-box')
        .eq(0)
        .find('input')
        .eq(0)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .getByData('q-item-checkbox-open-label-field')
        .find('input')
        .should('not.be.disabled')
        .type(openLabelInput)
        .wait(50);

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(expectedAnswerFirst);
      cy.getByData('response-item-answer').contains(openLabelInput);

      cy.getByData('chip-bar-box')
        .find('.MuiButtonBase-root')
        .contains('Continue Editing')
        .click()
        .wait(100);

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .getByData('q-item-checkbox-open-label-field')
        .find('input')
        .clear()
        .wait(50);

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(expectedAnswerFirst);
      cy.getByData('response-item-answer').should('not.contain.text', openLabelInput);

      cy.getByData('chip-bar-box')
        .find('.MuiButtonBase-root')
        .contains('Continue Editing')
        .click()
        .wait(100);

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .find('input')
        .eq(0)
        .check()
        .wait(50);

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .getByData('q-item-checkbox-open-label-field')
        .find('input')
        .type(openLabelInput)
        .wait(50);

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .find('input')
        .eq(0)
        .uncheck()
        .wait(50);

      cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

      cy.getByData('response-item-text').contains(itemText);
      cy.getByData('response-item-answer').contains(expectedAnswerFirst);
      cy.getByData('response-item-answer').should('not.contain.text', openLabelInput);
    });

    context('open choice autocomplete component', () => {
      const itemText = 'Other relevant medical history, operations, hospital admissions, etc';
      const ontoserverExpandUrl =
        'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://aehrc.csiro.au/fhir/ValueSet/MedicalHistory&filter=';
      const trailingUrlWithCount = '&count=10';
      const firstInputToBeSearched = 'Diabetes';
      const secondInputToBeSearched = 'stone';

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
          .contains('Medical history and current problems')
          .click();
      });

      it('reflects changes in questionnaire response on selection of autocompleted input', () => {
        cy.intercept(ontoserverExpandUrl + firstInputToBeSearched + trailingUrlWithCount).as(
          'ontoserverExpand'
        );

        cy.getByData('q-item-open-choice-autocomplete-field')
          .eq(0)
          .find('input')
          .eq(0)
          .type(firstInputToBeSearched)
          .wait(50);
        cy.wait('@ontoserverExpand');

        cy.getByData('q-item-open-choice-autocomplete-field')
          .eq(0)
          .find('input')
          .eq(0)
          .should('have.value', firstInputToBeSearched)
          .click()
          .type('{enter}')
          .should('contain.value', firstInputToBeSearched);

        cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

        cy.getByData('response-item-text').contains(itemText);
        cy.getByData('response-item-answer').contains(firstInputToBeSearched);
      });

      it('reflects changes in questionnaire response on change of input and autocompleted input', () => {
        cy.intercept(ontoserverExpandUrl + firstInputToBeSearched + trailingUrlWithCount).as(
          'firstOntoserverExpand'
        );
        cy.intercept(ontoserverExpandUrl + secondInputToBeSearched + trailingUrlWithCount).as(
          'secondOntoserverExpand'
        );

        cy.getByData('q-item-open-choice-autocomplete-field')
          .eq(0)
          .find('input')
          .eq(0)
          .type(firstInputToBeSearched)
          .wait(50);
        cy.wait('@firstOntoserverExpand');

        cy.getByData('q-item-open-choice-autocomplete-field')
          .eq(0)
          .find('input')
          .eq(0)
          .should('have.value', firstInputToBeSearched)
          .click()
          .type('{enter}')
          .wait(50)
          .should('contain.value', firstInputToBeSearched)
          .clear()
          .wait(50)
          .type(secondInputToBeSearched)
          .wait(50);
        cy.wait('@secondOntoserverExpand');

        cy.getByData('q-item-open-choice-autocomplete-field')
          .eq(0)
          .find('input')
          .eq(0)
          .should('have.value', secondInputToBeSearched)
          .click()
          .type('{enter}')
          .should('contain.value', secondInputToBeSearched);

        cy.getByData('chip-bar-box').find('.MuiButtonBase-root').contains('View Preview').click();

        cy.getByData('response-item-text').contains(itemText);
        cy.getByData('response-item-answer').contains(secondInputToBeSearched);
      });
    });
  });
});

export {};

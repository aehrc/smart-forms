describe('open choice component behaviour', () => {
  const launchPage = 'http://localhost:3000/launch';

  beforeEach(() => {
    cy.visit(launchPage);

    cy.getByData('questionnaire-list-row')
      .contains('Aboriginal and Torres Strait Islander Health Check')
      .click();
    cy.getByData('button-create-response').click();
    cy.getByData('form-heading').should('be.visible');

    cy.goToPatientDetailsTab();
    cy.initAgeValue(50);

    cy.goToTab('Finalising the health check');
  });

  context('open choice checkbox answer option component with repeats', () => {
    const itemText = 'Brief intervention: advice and information provided during health check';
    const indexFirstCheckboxToBeChecked = 0;
    const indexSecondCheckboxToBeChecked = 2;
    const openLabelInput = 'Increase protein intake';

    const expectedAnswerFirst = 'Healthy eating';
    const expectedAnswerSecond = 'Mental health and wellbeing';

    it('reflects changes in questionnaire response on selection of first checkbox', () => {
      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstCheckboxToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
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

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerSecond);

      cy.editForm();

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondCheckboxToBeChecked)
        .uncheck()
        .should('not.be.checked')
        .wait(100);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
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

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
      cy.checkResponseTextAndAnswer(itemText, openLabelInput);

      cy.editForm();

      cy.getByData('q-item-open-choice-checkbox-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-checkbox-open-label-box')
        .getByData('q-item-checkbox-open-label-field')
        .find('input')
        .clear()
        .wait(50);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
      cy.getByData('response-item-answer').should('not.contain.text', openLabelInput);

      cy.editForm();

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

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
      cy.getByData('response-item-answer').should('not.contain.text', openLabelInput);
    });
  });

  context('open choice autocomplete component', () => {
    const itemText = 'Other relevant medical history, operations, hospital admissions, etc';
    const ontoserverExpandUrl =
      'https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=https://aehrc.csiro.au/fhir/ValueSet/MedicalHistory&filter=';
    const trailingUrlWithCount = '&count=10';
    const firstInputToBeSearched = 'Diabetes';
    const secondInputToBeSearched = 'stone';

    beforeEach(() => {
      cy.goToTab('Medical history and current problems');
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

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, firstInputToBeSearched);
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
        .wait(200);
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
        .wait(200);
      cy.wait('@secondOntoserverExpand');

      cy.getByData('q-item-open-choice-autocomplete-field')
        .eq(0)
        .find('input')
        .eq(0)
        .should('have.value', secondInputToBeSearched)
        .click()
        .type('{enter}')
        .should('contain.value', secondInputToBeSearched);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, secondInputToBeSearched);
    });
  });

  context('open choice radio answer option component with repeats', () => {
    const itemText = 'Location of health check';
    const indexFirstRadioToBeChecked = 0;
    const indexSecondRadioToBeChecked = 2;
    const openLabelInput = 'Hospital';

    const expectedAnswerFirst = 'Clinic';
    const expectedAnswerSecond = 'School';

    beforeEach(() => {
      cy.goToTab('Consent');
    });

    it('reflects changes in questionnaire response on selection of first radio button', () => {
      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
    });

    it('reflects changes in questionnaire response on checking second checkbox then unchecking it', () => {
      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexSecondRadioToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .should('not.be.checked');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerSecond);
    });

    it('reflects changes in questionnaire response on open label input', () => {
      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-radio-open-label-box')
        .getByData('q-item-radio-open-label-field')
        .find('input')
        .should('be.disabled');

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .getByData('q-item-radio-open-label-box')
        .eq(0)
        .find('input')
        .eq(0)
        .check()
        .wait(50)
        .should('be.checked');

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-radio-open-label-box')
        .getByData('q-item-radio-open-label-field')
        .find('input')
        .should('not.be.disabled')
        .type(openLabelInput)
        .wait(50);

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, openLabelInput);
      cy.getByData('response-item-answer').should('not.include.text', expectedAnswerFirst);

      cy.editForm();

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-radio-open-label-box')
        .getByData('q-item-radio-open-label-field')
        .find('input')
        .clear()
        .wait(50);

      cy.previewForm();

      cy.getByData('response-item-text').should('not.contain.text', itemText);
      cy.getByData('response-item-answer').should('not.contain.text', openLabelInput);

      cy.editForm();

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-radio-open-label-box')
        .find('input')
        .eq(0)
        .check()
        .wait(50);

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .getByData('q-item-radio-open-label-box')
        .getByData('q-item-radio-open-label-field')
        .find('input')
        .type(openLabelInput)
        .wait(50);

      cy.getByData('q-item-open-choice-radio-answer-option-box')
        .should('include.text', itemText)
        .eq(0)
        .find('input')
        .eq(indexFirstRadioToBeChecked)
        .check()
        .wait(50)
        .should('be.checked');

      cy.previewForm();
      cy.checkResponseTextAndAnswer(itemText, expectedAnswerFirst);
      cy.getByData('response-item-answer').should('not.contain.text', openLabelInput);
    });
  });
});

export {};

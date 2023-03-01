/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    getByData(dataTestAttribute: string, args?: any): Chainable<Element>;
    previewForm(): void;
    editForm(): void;
    goToPatientDetailsTab(): void;
    goToTab(tabName: string): void;
    initAgeValue(age: number): void;
    checkResponseTextAndAnswer(text: string, answer: string): void;
  }
}

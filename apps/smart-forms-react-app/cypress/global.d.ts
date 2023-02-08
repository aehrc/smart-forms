/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    getByData(dataTestAttribute: string, args?: any): Chainable<Element>;
  }
}

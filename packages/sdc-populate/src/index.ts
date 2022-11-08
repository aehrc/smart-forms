import questionnaireMbs715 from './resources/715.R4.json';
import patient from '../src/resources/patient.json';
import batchResponse from '../src/resources/batchresponse.json';
import {Questionnaire} from 'fhir/r5';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import {readInitialExpressions} from './InitialExpressionFunctions';
import {constructResponse} from './ConstructQuestionnaireResponse';

export function sdcPopulate() {
  const questionnaire = questionnaireMbs715 as Questionnaire;
  const context: any = {LaunchPatient: patient, PrePopQuery: batchResponse};

  const unimplementedFunctions = ['join'];

  const initialExpressions = readInitialExpressions(questionnaire);

  for (const linkId in initialExpressions) {
    let expression = initialExpressions[linkId].expression;

    if (unimplementedFunctions.some((fn) => initialExpressions[linkId].expression.includes(fn))) {
      expression = removeUnimplementedFunction(
        unimplementedFunctions,
        initialExpressions[linkId].expression
      );
    }

    initialExpressions[linkId].value = fhirpath.evaluate(
      {},
      expression,
      context,
      fhirpath_r4_model
    );
  }

  const questionnaireResponse = constructResponse(questionnaire, initialExpressions);
}

function removeUnimplementedFunction(unimplementedFunctions: string[], expression: string): string {
  for (const fnName of unimplementedFunctions) {
    const foundFnIndex = expression.indexOf('.' + fnName);
    if (foundFnIndex === -1) continue;

    const openingBracketIndex = foundFnIndex + fnName.length + 1;
    const closingBracketIndex = findClosingBracketMatchIndex(expression, openingBracketIndex);
    return expression.slice(0, foundFnIndex - 1) + expression.slice(closingBracketIndex);
  }
  return expression;
}

function findClosingBracketMatchIndex(str: string, startPosition: number) {
  if (str[startPosition] != '(') {
    throw new Error("No '(' at index " + startPosition);
  }
  let depth = 1;
  for (let i = startPosition + 1; i < str.length; i++) {
    switch (str[i]) {
      case '(':
        depth++;
        break;
      case ')':
        if (--depth == 0) {
          return i;
        }
        break;
    }
  }
  return -1; // No matching closing parenthesis
}

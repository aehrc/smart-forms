// Helper functions for SDC Extract operation will go here 

import type { QuestionnaireResponse, QuestionnaireResponseItem, QuestionnaireItem, Questionnaire } from 'fhir/r4';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
// import { DebugInfo } from './types'; // Uncomment and adjust as needed

export function evaluateTemplateExpression(
  questionnaireResponse: QuestionnaireResponse,
  expression: string,
  context?: QuestionnaireResponseItem | QuestionnaireResponseItem[]
): any {
  try {
    const evaluationContext = context || questionnaireResponse;
    if (expression.includes('item.where')) {
      const result = fhirpath.evaluate(
        evaluationContext,
        expression,
        {},
        fhirpath_r4_model as any,
        { async: false }
      );
      if (Array.isArray(result)) {
        if (result.length === 0) return null;
        if (result.length === 1) return result[0];
        return result;
      }
      return result;
    }
    const result = fhirpath.evaluate(
      evaluationContext,
      expression,
      {},
      fhirpath_r4_model as any,
      { async: false }
    );
    return result;
  } catch (error) {
    console.error('Error evaluating FHIRPath expression:', error);
    return null;
  }
}

export function findNestedItem(
  items: QuestionnaireResponseItem[] | undefined,
  linkId: string
): QuestionnaireResponseItem | null {
  if (!items) return null;
  for (const item of items) {
    if (item.linkId === linkId) {
      return item;
    }
    if (item.item) {
      const nested = findNestedItem(item.item, linkId);
      if (nested) return nested;
    }
  }
  return null;
}

export function getNestedAnswerValue(
  response: QuestionnaireResponse,
  linkId: string,
  parentLinkId?: string
): any {
  const findItem = (items: QuestionnaireResponseItem[] | undefined, currentLevel: number = 0): QuestionnaireResponseItem | null => {
    if (!items) return null;
    for (const item of items) {
      if (item.linkId === linkId) {
        return item;
      }
      if (parentLinkId && item.linkId === parentLinkId && item.item) {
        for (const childItem of item.item) {
          if (childItem.linkId === linkId) {
            return childItem;
          }
        }
      }
      if (item.item) {
        const foundItem = findItem(item.item, currentLevel + 1);
        if (foundItem) return foundItem;
      }
    }
    return null;
  };
  const item = findItem(response.item);
  if (!item || !item.answer || item.answer.length === 0) {
    return null;
  }
  const answer = item.answer?.[0];
  if (answer?.valueDecimal !== undefined) return answer.valueDecimal;
  if (answer?.valueInteger !== undefined) return answer.valueInteger;
  if (answer?.valueString !== undefined) return answer.valueString;
  if (answer?.valueBoolean !== undefined) return answer.valueBoolean;
  if (answer?.valueQuantity?.value !== undefined) return answer.valueQuantity.value;
  return null;
}

export function hasTemplateExtractExtension(item: QuestionnaireItem | Questionnaire): boolean {
  if (!item.extension || item.extension.length === 0) {
    return false;
  }
  for (const ext of item.extension) {
    if (ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract') {
      if (ext.valueBoolean !== undefined) {
        return ext.valueBoolean;
      }
      if (ext.extension) {
        for (const subExt of ext.extension) {
          if (subExt.url === 'template' && subExt.valueReference?.reference) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export function processDateTimeExtraction(template: any, _response: QuestionnaireResponse, _debugInfo: any): string {
  // Placeholder for actual implementation
  return template.effectiveDateTime || '';
} 
import type { Resource, QuestionnaireResponse, Bundle, QuestionnaireResponseItem } from 'fhir/r4';
import * as FHIR from 'fhirclient';
import type { Questionnaire } from 'fhir/r4';
import { FORMS_SERVER_URL } from '../../../globals';
import { HEADERS } from '../../../api/headers';

export function processTemplateExpressions(
  template: Resource,
  questionnaireResponse: QuestionnaireResponse
): Resource {
  const processedResource = JSON.parse(JSON.stringify(template)) as Resource;
  
  // Process all properties recursively
  processObject(processedResource, questionnaireResponse);
  
  return processedResource;
}

function processObject(obj: any, questionnaireResponse: QuestionnaireResponse): void {
  if (!obj || typeof obj !== 'object') return;

  // Process FHIRPath expressions in extensions
  if (obj.extension) {
    obj.extension.forEach((ext: any) => {
      if (ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue') {
        const expression = ext.valueString;
        const value = evaluateExpression(expression, questionnaireResponse);
        if (value !== undefined) {
          // Find the parent object that contains this extension
          const parent = obj;
          // Replace the parent's value with the evaluated value
          if (parent._value) {
            parent.value = value;
            delete parent._value;
          } else {
            parent.value = value;
          }
          // Remove the extension
          parent.extension = parent.extension.filter((e: any) => e !== ext);
          if (parent.extension.length === 0) {
            delete parent.extension;
          }
        }
      }
    });
  }

  // Process FHIRPath expressions in value fields
  if (obj.value && typeof obj.value === 'string' && obj.value.startsWith('%')) {
    const value = evaluateExpression(obj.value, questionnaireResponse);
    if (value !== undefined) {
      obj.value = value;
    }
  }

  // Process nested objects
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      processObject(obj[key], questionnaireResponse);
    }
  });
}

function findItemByLinkId(items: QuestionnaireResponseItem[] | undefined, targetLinkId: string): QuestionnaireResponseItem | undefined {
  if (!items) return undefined;
  
  for (const item of items) {
    if (item.linkId === targetLinkId) {
      return item;
    }
    if (item.item) {
      const found = findItemByLinkId(item.item, targetLinkId);
      if (found) return found;
    }
  }
  return undefined;
}

function evaluateExpression(expression: string, questionnaireResponse: QuestionnaireResponse): any {
  // Handle special variables
  if (expression.startsWith('%')) {
    if (expression === '%NewPatientId') {
      // Generate a new patient ID or use existing one
      return 'patient-' + Date.now();
    }
    if (expression === '%resource.authored') {
      return questionnaireResponse.authored;
    }
    if (expression === '%resource.author') {
      return questionnaireResponse.author;
    }
    if (expression === '%resource.id') {
      return questionnaireResponse.id;
    }

    // Handle FHIRPath expressions for questionnaire items
    const match = expression.match(/%([^.]+)\.value/);
    if (match) {
      const linkId = match[1];
      const item = findItemByLinkId(questionnaireResponse.item, linkId);
      if (item) {
        const answer = item.answer?.[0];
        if (answer) {
          return answer.valueDecimal;
        }
      }
    }
  }

  // Handle FHIRPath expressions for questionnaire items
  if (expression.includes('item.where')) {
    const linkId = expression.match(/linkId\s*=\s*'([^']+)'/)?.[1];
    if (!linkId) return undefined;

    const item = findItemByLinkId(questionnaireResponse.item, linkId);
    if (!item) return undefined;

    if (expression.includes('answer.value')) {
      const answer = item.answer?.[0];
      if (answer) {
        return answer.valueDecimal;
      }
    }
  }

  // Handle mathematical expressions
  if (expression.includes('*') || expression.includes('/')) {
    // Split the expression into parts and evaluate each part
    const parts = expression.split(/([*/])/);
    const values = parts.map(part => {
      const trimmed = part.trim();
      if (trimmed === '*' || trimmed === '/') return trimmed;
      if (trimmed.includes('item.where')) {
        return evaluateExpression(trimmed, questionnaireResponse);
      }
      return parseFloat(trimmed);
    });

    // Calculate the result
    let result = values[0];
    for (let i = 1; i < values.length; i += 2) {
      const operator = values[i];
      const operand = values[i + 1];
      if (operator === '*') {
        result *= operand;
      } else if (operator === '/') {
        result /= operand;
      }
    }
    return result;
  }

  return undefined;
}

export function createTransactionBundle(resources: Resource[]): Bundle {
  return {
    resourceType: 'Bundle',
    type: 'transaction',
    entry: resources.map(resource => ({
      resource: resource as any // Type assertion needed due to FHIR type limitations
    }))
  };
}

export function validateTemplate(template: Resource): boolean {
  // Basic validation for required fields
  if (!template.resourceType || !template.id) {
    return false;
  }

  // Check if the template has any templateExtractValue extensions
  const hasTemplateExtractValue = (obj: any): boolean => {
    if (!obj) {
      return false;
    }
    
    // Check if this object has the templateExtractValue extension
    if (obj.extension) {
      const hasExtractValue = obj.extension.some((ext: any) => {
        return ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue';
      });
      if (hasExtractValue) {
        return true;
      }
    }

    // Check valueQuantity field for templateExtractValue extension
    if (obj.valueQuantity && obj.valueQuantity.extension) {
      const hasExtractValue = obj.valueQuantity.extension.some((ext: any) => {
        return ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue';
      });
      if (hasExtractValue) {
        return true;
      }
    }

    // Recursively check all properties
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        if (hasTemplateExtractValue(obj[key])) {
          return true;
        }
      }
    }

    return false;
  };

  return hasTemplateExtractValue(template);
}

export async function addBMIQuestionnaireToServer(questionnaire: Questionnaire) {
  try {
    const response = await FHIR.client(FORMS_SERVER_URL).request({
      url: 'Questionnaire',
      method: 'POST',
      body: JSON.stringify(questionnaire),
      headers: { ...HEADERS, 'Content-Type': 'application/json' }
    });
    return response;
  } catch (error) {
    console.error('Error adding BMI questionnaire to server:', error);
    throw error;
  }
} 
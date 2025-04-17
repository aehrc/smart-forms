import type {
  Extension,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  Observation,
  StructureMap,
  Element
} from 'fhir/r4';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import { findMatchingItem, FHIR_TEMPLATE_EXTRACT_EXTENSION } from './templateMatching';

const FHIR_TEMPLATE_REFERENCE_EXTENSION =
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateReference';

const TEMPLATE_EXTRACT_VALUE_EXTENSION = 
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue';

interface DebugInfo {
  contentAnalysis: {
    detectedTemplates: string[];
    patterns: string[];
    confidence: string;
  };
  fieldMapping: {
    mappedFields: Record<string, any>;
    assumptions: string[];
    alternatives: string[];
  };
  valueProcessing: {
    values: Record<string, any>;
    transformations: string[];
    qualityChecks: Array<{
      check: string;
      passed: boolean;
      message: string;
    }>;
    datetime?: {
      source: 'static' | 'dynamic' | 'fallback';
      expression?: string;
      value?: string;
      originalValue?: string;
    };
  };
  resultGeneration: {
    status: string;
    observations: Observation[];
    warnings?: string[];
  };
}

interface ExtendedElement extends Element {
  extension?: Extension[];
}

interface ExtendedObservation extends Observation {
  _effectiveDateTime?: ExtendedElement;
  _issued?: ExtendedElement;
  _valueBoolean?: ExtendedElement;
}

function evaluateTemplateExpression(
  questionnaireResponse: QuestionnaireResponse,
  expression: string,
  context?: QuestionnaireResponseItem | QuestionnaireResponseItem[]
): any {
  try {
    // If we have a context, use it as the starting point for evaluation
    const evaluationContext = context || questionnaireResponse;
    
    // Handle special cases for nested structures
    if (expression.includes('item.where')) {
      // Process nested item expressions
      const result = fhirpath.evaluate(
        evaluationContext,
        expression,
        {}, // Empty context object
        fhirpath_r4_model,
        {
          async: false
        }
      );

      if (Array.isArray(result)) {
        if (result.length === 0) return null;
        if (result.length === 1) return result[0];
        return result;
      }

      return result;
    }

    // Handle direct value references
    const result = fhirpath.evaluate(
      evaluationContext,
      expression,
      {}, // Empty context object
      fhirpath_r4_model,
      {
        async: false
      }
    );

    return result;
  } catch (error) {
    console.error('Error evaluating FHIRPath expression:', error);
    return null;
  }
}

function findNestedItem(
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

function getNestedAnswerValue(
  response: QuestionnaireResponse,
  linkId: string,
  parentLinkId?: string
): any {
  console.log(`Looking for value at linkId: ${linkId} (parent: ${parentLinkId || 'none'})`);
  
  // More flexible recursive item finder
  const findItem = (items: QuestionnaireResponseItem[] | undefined, currentLevel: number = 0): QuestionnaireResponseItem | null => {
    if (!items) return null;
    
    for (const item of items) {
      console.log(`${' '.repeat(currentLevel * 2)}Checking item: ${item.linkId}`);
      
      // Direct match
      if (item.linkId === linkId) {
        console.log(`${' '.repeat(currentLevel * 2)}✅ Found direct match: ${item.linkId}`);
        return item;
      }
      
      // Parent match, check children
      if (parentLinkId && item.linkId === parentLinkId && item.item) {
        console.log(`${' '.repeat(currentLevel * 2)}Found parent: ${item.linkId}, checking children...`);
        for (const childItem of item.item) {
          if (childItem.linkId === linkId) {
            console.log(`${' '.repeat(currentLevel * 2)}✅ Found child match: ${childItem.linkId}`);
            return childItem;
          }
        }
      }
      
      // Recursive search in children
      if (item.item) {
        const foundItem = findItem(item.item, currentLevel + 1);
        if (foundItem) return foundItem;
      }
    }
    
    return null;
  };
  
  const item = findItem(response.item);
  if (!item || !item.answer || item.answer.length === 0) {
    console.log(`❌ No answer found for linkId: ${linkId}`);
    return null;
  }
  
  const answer = item.answer[0];
  
  // Extract the value based on its type
  if (answer.valueDecimal !== undefined) return answer.valueDecimal;
  if (answer.valueInteger !== undefined) return answer.valueInteger;
  if (answer.valueString !== undefined) return answer.valueString;
  if (answer.valueBoolean !== undefined) return answer.valueBoolean;
  if (answer.valueQuantity?.value !== undefined) return answer.valueQuantity.value;
  
  console.log(`❌ No supported value type found in answer for linkId: ${linkId}`);
  return null;
}

function hasTemplateExtractExtension(item: QuestionnaireItem | Questionnaire): boolean {
  // Enhanced detection with detailed logging
  console.log(`Checking for template extraction extension in item with linkId: ${(item as QuestionnaireItem).linkId || 'root questionnaire'}`);
  
  if (!item.extension || item.extension.length === 0) {
    console.log(`No extensions found for item ${(item as QuestionnaireItem).linkId || 'root questionnaire'}`);
    return false;
  }
  
  for (const ext of item.extension) {
    console.log(`Examining extension with URL: ${ext.url}`);
    
    if (ext.url === FHIR_TEMPLATE_EXTRACT_EXTENSION) {
      // Check for direct boolean value
      if (ext.valueBoolean !== undefined) {
        console.log(`Found template extraction extension with valueBoolean: ${ext.valueBoolean}`);
        return ext.valueBoolean;
      }
      
      // Check for nested template reference
      if (ext.extension) {
        for (const subExt of ext.extension) {
          if (subExt.url === 'template' && subExt.valueReference?.reference) {
            console.log(`Found template reference: ${subExt.valueReference.reference}`);
            return true;
          }
        }
      }
    }
  }
  
  return false;
}

/**
 * Processes datetime extraction from templates, handling both static values and expressions
 * @param template The template containing datetime fields
 * @param response The questionnaire response to extract values from
 * @returns An ISO formatted datetime string
 */
function processDateTimeExtraction(template: any, response: QuestionnaireResponse, debugInfo: DebugInfo): string {
  // Check if we have an effectiveDateTime with extraction extension
  const effectiveDateTime = template.effectiveDateTime;
  const effectiveDateTimeExt = template._effectiveDateTime?.extension?.find(
    (ext: Extension) => ext.url === TEMPLATE_EXTRACT_VALUE_EXTENSION
  );

  // Initialize datetime debug info
  debugInfo.valueProcessing.datetime = {
    source: 'fallback',
    value: ''
  };

  if (effectiveDateTimeExt?.valueString) {
    // Handle specific extraction expressions
    if (effectiveDateTimeExt.valueString === 'now()') {
      // Use current date/time
      const now = new Date().toISOString();
      console.log(`Processing datetime with now() function: ${now}`);
      
      // Update datetime debug info
      debugInfo.valueProcessing.datetime = {
        source: 'dynamic',
        expression: 'now()',
        value: now,
        originalValue: effectiveDateTime
      };
      
      return now;
    } else {
      // Try to evaluate as a FHIRPath expression
      const extractedDateTime = evaluateTemplateExpression(response, effectiveDateTimeExt.valueString);
      if (extractedDateTime) {
        console.log(`Extracted datetime using expression: ${extractedDateTime}`);
        
        // Update datetime debug info
        debugInfo.valueProcessing.datetime = {
          source: 'dynamic',
          expression: effectiveDateTimeExt.valueString,
          value: extractedDateTime,
          originalValue: effectiveDateTime
        };
        
        return extractedDateTime;
      }
    }
  }

  // Default to template's static value if available
  if (effectiveDateTime) {
    console.log(`Using template's static datetime: ${effectiveDateTime}`);
    
    // Update datetime debug info
    debugInfo.valueProcessing.datetime = {
      source: 'static',
      value: effectiveDateTime
    };
    
    return effectiveDateTime;
  }

  // Final fallback to current date/time
  const fallbackTime = new Date().toISOString();
  console.log(`No datetime information found, using current time: ${fallbackTime}`);
  
  // Update datetime debug info
  debugInfo.valueProcessing.datetime = {
    source: 'fallback',
    value: fallbackTime
  };
  
  return fallbackTime;
}

export async function extractTemplateBased(
  questionnaire: Questionnaire,
  response: QuestionnaireResponse
): Promise<{ result: Observation[] | null; error: string | null; debugInfo: DebugInfo }> {
  const debugInfo: DebugInfo = {
    contentAnalysis: {
      detectedTemplates: [],
      confidence: 'Valid',
      patterns: []
    },
    fieldMapping: {
      mappedFields: {},
      assumptions: [],
      alternatives: []
    },
    valueProcessing: {
      values: {},
      transformations: [],
      qualityChecks: []
    },
    resultGeneration: {
      status: 'Pending',
      observations: []
    }
  };

  console.log('=== Template Extraction Debug ===');
  console.log('Stage 1: Initial Validation');
  
  // Enhanced validation with more detailed error reporting
  if (!questionnaire) {
    console.log('❌ Failed: Questionnaire is undefined or null');
    debugInfo.contentAnalysis.confidence = 'Invalid';
    return {
      result: null,
      error: 'Missing questionnaire',
      debugInfo
    };
  }
  
  if (!questionnaire.item) {
    console.log('❌ Failed: Questionnaire has no items');
    debugInfo.contentAnalysis.confidence = 'Invalid';
    return {
      result: null,
      error: 'Questionnaire has no items',
      debugInfo
    };
  }
  
  if (!questionnaire.contained || questionnaire.contained.length === 0) {
    console.log('❌ Failed: Questionnaire has no contained resources for templates');
    debugInfo.contentAnalysis.confidence = 'Invalid';
    return {
      result: null,
      error: 'Questionnaire has no contained resources for templates',
      debugInfo
    };
  }
  
  if (!response.item) {
    console.log('❌ Failed: Response has no items');
    debugInfo.contentAnalysis.confidence = 'Invalid';
    return {
      result: null,
      error: 'Response has no items',
      debugInfo
    };
  }
  
  console.log('✅ Passed: Required items present');

  // Check for template extraction extension at questionnaire or item level
  console.log('\nStage 2: Template Extraction Extension Check');
  
  // Enhanced template detection with recursive item checking
  const hasTemplateExtract = hasTemplateExtractExtension(questionnaire);
  let itemsWithTemplates: string[] = [];
  
  const checkItemsForTemplates = (items: QuestionnaireItem[]): boolean => {
    let found = false;
    for (const item of items) {
      if (hasTemplateExtractExtension(item)) {
        found = true;
        itemsWithTemplates.push(item.linkId);
      }
      
      if (item.item && checkItemsForTemplates(item.item)) {
        found = true;
      }
    }
    return found;
  };
  
  const hasItemTemplates = checkItemsForTemplates(questionnaire.item);
  
  if (!hasTemplateExtract && !hasItemTemplates) {
    console.log('❌ Failed: No template extraction extension found');
    debugInfo.contentAnalysis.confidence = 'Invalid';
    debugInfo.contentAnalysis.detectedTemplates.push('No template type detected');
    
    // Enhanced debug information for template detection failure
    if (questionnaire.extension && questionnaire.extension.length > 0) {
      const urls = questionnaire.extension.map(e => e.url).join(', ');
      debugInfo.fieldMapping.assumptions.push(`Found extensions but none match template extraction: ${urls}`);
    } else {
      debugInfo.fieldMapping.assumptions.push('No extensions found at questionnaire level');
    }
    
    if (itemsWithTemplates.length > 0) {
      debugInfo.fieldMapping.assumptions.push(`Found items with extensions: ${itemsWithTemplates.join(', ')}`);
    }
    
    return {
      result: null,
      error: 'Questionnaire is not configured for template extraction',
      debugInfo
    };
  }
  
  if (hasTemplateExtract) {
    console.log('✅ Passed: Template extraction extension found at questionnaire level');
  }
  
  if (hasItemTemplates) {
    console.log(`✅ Passed: Template extraction extensions found at item level: ${itemsWithTemplates.join(', ')}`);
  }

  const templates = questionnaire.contained;
  console.log('\nStage 3: Template Analysis');
  console.log(`Found ${templates.length} templates:`);
  
  // Enhanced template analysis
  const observationTemplates = templates.filter(t => t.resourceType === 'Observation');
  const patientTemplates = templates.filter(t => t.resourceType === 'Patient');
  const otherTemplates = templates.filter(t => !['Observation', 'Patient'].includes(t.resourceType));
  
  console.log(`- ${observationTemplates.length} Observation templates`);
  console.log(`- ${patientTemplates.length} Patient templates`);
  console.log(`- ${otherTemplates.length} Other templates`);
  
  templates.forEach(template => {
    const templateId = template.id || 'unnamed';
    console.log(`- ${template.resourceType}: ${templateId}`);
    debugInfo.contentAnalysis.detectedTemplates.push(templateId);
  });

  const observations: Observation[] = [];

  // Initialize field mapping with template information
  console.log('\nStage 4: Field Mapping');
  debugInfo.fieldMapping.mappedFields = templates.reduce((acc, template) => {
    if (template.resourceType === 'Observation') {
      const code = template.code?.coding?.[0]?.code;
      if (code) {
        // Skip the boolean observation for now
        if ((template as ExtendedObservation)._valueBoolean) return acc;

        // Find the corresponding item in the questionnaire using the enhanced matcher
        const item = findMatchingItem(
          questionnaire.item, 
          template.id || 'unknown',
          template.resourceType, 
          template.code?.coding
        );
        
        if (!item) {
          console.log(`❌ Failed to find corresponding item in questionnaire for template: ${template.id}`);
          debugInfo.valueProcessing.qualityChecks.push({
            check: `Process ${template.id || 'unknown'}`,
            passed: false,
            message: 'Failed to find corresponding item in questionnaire'
          });
          return acc;
        }

        // Enhanced path detection with better support for different questionnaire structures
        let valuePath = "";
        
        // Check for parent hierarchy to build proper path
        const buildPath = (items: QuestionnaireItem[] | undefined, targetLinkId: string, path: string = ""): string => {
          if (!items) return "";
          
          for (const i of items) {
            if (i.linkId === targetLinkId) return path ? `${path}.item.where(linkId='${targetLinkId}')` : `item.where(linkId='${targetLinkId}')`;
            
            if (i.item) {
              const newPath = path ? `${path}.item.where(linkId='${i.linkId}')` : `item.where(linkId='${i.linkId}')`;
              const result = buildPath(i.item, targetLinkId, newPath);
              if (result) return result;
            }
          }
          
          return "";
        };
        
        valuePath = buildPath(questionnaire.item, item.linkId);
        if (!valuePath) {
          valuePath = `item.where(linkId='${item.linkId}')`;
        }
        
        // Add answer type based on item type
        switch (item.type) {
          case 'decimal':
            valuePath += '.answer.valueDecimal';
            break;
          case 'integer':
            valuePath += '.answer.valueInteger';
            break;
          case 'boolean':
            valuePath += '.answer.valueBoolean';
            break;
          case 'string':
            valuePath += '.answer.valueString';
            break;
          case 'quantity':
            valuePath += '.answer.valueQuantity.value';
            break;
          default:
            valuePath += '.answer.value';
        }
        
        acc[code] = {
          templateId: template.id,
          type: template.resourceType,
          valuePath: valuePath,
          itemType: item.type,
          itemLinkId: item.linkId,
          itemText: item.text || "No text"
        };
        
        console.log(`Mapped field: ${code} -> ${template.id} (${valuePath})`);
      }
    }
    return acc;
  }, {} as Record<string, any>);

  // Add relevant assumptions about the mapping based on found patterns
  if (Object.keys(debugInfo.fieldMapping.mappedFields).length === 0) {
    debugInfo.fieldMapping.assumptions.push('No fields could be mapped between templates and questionnaire items');
  } else {
    debugInfo.fieldMapping.assumptions.push(`Successfully mapped ${Object.keys(debugInfo.fieldMapping.mappedFields).length} fields`);
  }

  // Check for specific patterns in the template (like height, weight, blood pressure)
  const hasHeight = observationTemplates.some(t => 
    t.code?.coding?.some(c => c.code === '8302-2' || c.display?.toLowerCase().includes('height'))
  );
  
  const hasWeight = observationTemplates.some(t => 
    t.code?.coding?.some(c => c.code === '29463-7' || c.display?.toLowerCase().includes('weight'))
  );
  
  // More precise BP detection to avoid false positives
  const hasBpLoinc = observationTemplates.some(t => 
    t.code?.coding?.some(c => c.code === '85354-9') // Blood pressure panel with all children optional
  );
  
  const hasSystolicComponent = observationTemplates.some(t => 
    t.component?.some(comp => 
      comp.code?.coding?.some(c => c.code === '8480-6' || c.display?.toLowerCase().includes('systolic'))
    )
  );
  
  const hasDiastolicComponent = observationTemplates.some(t => 
    t.component?.some(comp => 
      comp.code?.coding?.some(c => c.code === '8462-4' || c.display?.toLowerCase().includes('diastolic'))
    )
  );
  
  // Separate standalone templates with BP codes
  const hasSystolicTemplate = observationTemplates.some(t => 
    t.code?.coding?.some(c => c.code === '8480-6' || c.display?.toLowerCase().includes('systolic'))
  );
  
  const hasDiastolicTemplate = observationTemplates.some(t => 
    t.code?.coding?.some(c => c.code === '8462-4' || c.display?.toLowerCase().includes('diastolic'))
  );
  
  // Content-driven pattern detection
  // Instead of fixed assumptions, detect patterns dynamically based on content
  const patterns = [];
  const assumptions = [];
  
  if (observationTemplates.length > 0) {
    assumptions.push(`Found ${observationTemplates.length} observation templates`);
  }
  
  if (hasHeight) {
    patterns.push('Height Measurement');
    if (hasWeight) {
      // Both height and weight together form a pattern
      assumptions.push('Detected height and weight template pattern');
    } else {
      // Just height alone
      assumptions.push('Detected height measurement template');
    }
  } else if (hasWeight) {
    // Just weight alone
    patterns.push('Weight Measurement');
    assumptions.push('Detected weight measurement template');
  }
  
  // Only detect BP if we have a proper complete BP pattern
  const isCompleteBpPattern = hasBpLoinc || 
    (hasSystolicComponent && hasDiastolicComponent) || 
    (hasSystolicTemplate && hasDiastolicTemplate);
  
  if (isCompleteBpPattern) {
    patterns.push('Blood Pressure Measurement');
    assumptions.push('Detected complete blood pressure template pattern');
  } else if (hasSystolicTemplate && !hasDiastolicTemplate) {
    // Just systolic without diastolic - not a complete BP pattern
    patterns.push('Systolic Measurement');
    assumptions.push('Detected systolic pressure template (incomplete BP pattern)');
  } else if (!hasSystolicTemplate && hasDiastolicTemplate) {
    // Just diastolic without systolic - not a complete BP pattern
    patterns.push('Diastolic Measurement');
    assumptions.push('Detected diastolic pressure template (incomplete BP pattern)');
  }
  
  // Add the detected patterns to debug info
  debugInfo.contentAnalysis.patterns.push(...patterns);
  
  // Add the assumptions to debug info
  debugInfo.fieldMapping.assumptions.push(...assumptions);

  // Update debug info with resource types
  debugInfo.contentAnalysis.patterns.push(
    ...templates.map(template => `${template.resourceType}: ${template.id || 'unnamed'}`)
  );

  console.log('\nStage 5: Template Processing');
  // Process each template
  for (const template of templates) {
    try {
      if (template.resourceType === 'Observation') {
        const templateId = template.id || 'unnamed';
        console.log(`\nProcessing template: ${templateId}`);
        
        // Skip the boolean observation for now
        if ((template as ExtendedObservation)._valueBoolean) continue;

        const observation: ExtendedObservation = {
          ...template,
          id: undefined // Remove template ID
        };

        // Find the corresponding item in the questionnaire using the enhanced matcher
        const item = findMatchingItem(
          questionnaire.item, 
          template.id || 'unknown',
          template.resourceType, 
          template.code?.coding
        );
        
        if (!item) {
          console.log(`❌ Failed to find corresponding item in questionnaire for template: ${template.id}`);
          debugInfo.valueProcessing.qualityChecks.push({
            check: `Process ${template.id || 'unknown'}`,
            passed: false,
            message: 'Failed to find corresponding item in questionnaire'
          });
          continue;
        }

        // Process datetime values for the observation
        const originalDateTime = template.effectiveDateTime;
        observation.effectiveDateTime = processDateTimeExtraction(template, response, debugInfo);
        
        // Add information to debug info
        debugInfo.valueProcessing.transformations.push(
          `Set effectiveDateTime to ${observation.effectiveDateTime} for ${templateId}`
        );
        
        // Remove the extraction extension since it's been processed
        if (observation._effectiveDateTime) {
          delete observation._effectiveDateTime;
        }

        // Process value extraction with improved nested handling
        if (template.valueQuantity) {
          // First try direct extension on valueQuantity (common in test files)
          let valueExt = template.valueQuantity.extension?.find(
            (ext: Extension) => ext.url === TEMPLATE_EXTRACT_VALUE_EXTENSION
          );
          
          // If not found, try the nested structure from HL7 SDC examples
          if (!valueExt && (template.valueQuantity as any)._value?.extension) {
            valueExt = (template.valueQuantity as any)._value.extension.find(
              (ext: Extension) => ext.url === TEMPLATE_EXTRACT_VALUE_EXTENSION
            );
            console.log('Using nested _value extension structure from HL7 SDC example');
          }
          
          if (valueExt?.valueString) {
            console.log(`Extracting value with expression: ${valueExt.valueString}`);
            let value;
            
            // Handle direct answer value references
            if (valueExt.valueString.includes('answer.value')) {
              value = getNestedAnswerValue(response, item.linkId);
              if (value !== null) {
                // Improved unit detection and value conversion based on context
                const isHeightTemplate = template.code?.coding?.some(c => 
                  c.code === '8302-2' || c.display?.toLowerCase().includes('height')
                );
                
                // Check if a unit conversion is needed
                if (isHeightTemplate) {
                  console.log(`Processing height value: ${value}`);
                  
                  // Determine the source unit from the questionnaire item
                  const unitExtension = item.extension?.find(ext => 
                    ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-unit'
                  );
                  const sourceUnit = unitExtension?.valueCoding?.code || 'm';
                  
                  // Extract target unit from template
                  const targetUnit = template.valueQuantity.unit || 'cm';
                  
                  // Intelligence for unit conversion
                  if (sourceUnit === 'm' && targetUnit === 'cm') {
                    // Smart unit conversion - only apply if the value looks like meters
                    if (value < 3) {
                      const originalValue = value;
                      value = value * 100;
                      console.log(`Converting height from ${originalValue}m to ${value}cm`);
                      debugInfo.valueProcessing.transformations.push(`Converted height from ${originalValue}m to ${value}cm for ${templateId}`);
                    } else {
                      // Value is likely already in cm
                      console.log(`Height value ${value} appears to already be in cm, no conversion needed`);
                      debugInfo.valueProcessing.transformations.push(`Height value ${value} appears to already be in cm, no conversion needed for ${templateId}`);
                    }
                  }
                } else {
                  // Not a height template, just extract the value
                  debugInfo.valueProcessing.transformations.push(`Extracted value ${value} for ${templateId}`);
                }
                
                observation.valueQuantity = {
                  value: value,
                  unit: template.valueQuantity.unit,
                  system: template.valueQuantity.system,
                  code: template.valueQuantity.code
                };
                
                debugInfo.valueProcessing.values[templateId] = value;
                console.log(`✅ Value extracted: ${value}`);
                
                // Enhanced quality checks based on value type
                if (isHeightTemplate) {
                  const inReasonableRange = value > 30 && value < 250;
                  debugInfo.valueProcessing.qualityChecks.push({
                    check: `Height value in reasonable range (${value}cm)`,
                    passed: inReasonableRange,
                    message: inReasonableRange 
                      ? 'Height within expected range'
                      : 'Height outside normal range, verify input'
                  });
                } else if (template.code?.coding?.some(c => 
                  c.code === '29463-7' || c.display?.toLowerCase().includes('weight')
                )) {
                  const inReasonableRange = value > 0.1 && value < 300;
                  debugInfo.valueProcessing.qualityChecks.push({
                    check: `Weight value in reasonable range (${value}kg)`,
                    passed: inReasonableRange,
                    message: inReasonableRange 
                      ? 'Weight within expected range'
                      : 'Weight outside normal range, verify input'
                  });
                }
                
                debugInfo.valueProcessing.qualityChecks.push({
                  check: `Process ${templateId}`,
                  passed: true,
                  message: 'Successfully processed observation'
                });
              } else {
                console.log('❌ Failed to extract value');
                debugInfo.valueProcessing.qualityChecks.push({
                  check: `Process ${templateId}`,
                  passed: false,
                  message: 'Failed to extract value from questionnaire response'
                });
                continue; // Skip this observation if value extraction failed
              }
            } else {
              // Handle complex FHIRPath expressions
              value = evaluateTemplateExpression(response, valueExt.valueString);
              if (value !== null) {
                observation.valueQuantity = {
                  value: value,
                  unit: template.valueQuantity.unit,
                  system: template.valueQuantity.system,
                  code: template.valueQuantity.code
                };
                
                debugInfo.valueProcessing.values[templateId] = value;
                debugInfo.valueProcessing.transformations.push(`Extracted value ${value} for ${templateId} using expression`);
                console.log(`✅ Value extracted with expression: ${value}`);
                
                debugInfo.valueProcessing.qualityChecks.push({
                  check: `Process ${templateId}`,
                  passed: true,
                  message: 'Successfully processed observation'
                });
              } else {
                console.log('❌ Failed to extract value with expression');
                debugInfo.valueProcessing.qualityChecks.push({
                  check: `Process ${templateId}`,
                  passed: false,
                  message: 'Failed to extract value using expression'
                });
                continue;
              }
            }
          } else {
            console.log('❌ No template extraction value extension found');
            debugInfo.valueProcessing.qualityChecks.push({
              check: `Process ${templateId}`,
              passed: false,
              message: 'No template extraction value extension found'
            });
            continue;
          }
        } else if ((template as ExtendedObservation)._valueBoolean) {
          // Handle boolean observations
          console.log('Processing boolean observation template');
          
          // Get the template extraction expression from the boolean extension
          const booleanExt = (template as ExtendedObservation)._valueBoolean?.extension?.find(
            (ext: Extension) => ext.url === TEMPLATE_EXTRACT_VALUE_EXTENSION
          );
          
          if (!booleanExt?.valueString) {
            console.log('❌ No template extraction value extension found for boolean value');
            debugInfo.valueProcessing.qualityChecks.push({
              check: `Process ${templateId}`,
              passed: false,
              message: 'No template extraction value extension found for boolean value'
            });
            continue;
          }
          
          console.log(`Boolean extraction expression: ${booleanExt.valueString}`);
          
          // Use the extraction expression
          if (booleanExt.valueString.includes('answer.value')) {
            const boolValue = getNestedAnswerValue(response, item.linkId);
            
            if (boolValue !== null) {
              observation.valueBoolean = boolValue === true || boolValue === 'true';
              
              debugInfo.valueProcessing.values[templateId] = boolValue;
              debugInfo.valueProcessing.transformations.push(`Extracted boolean value ${boolValue} for ${templateId}`);
              console.log(`✅ Boolean value extracted: ${boolValue}`);
              
              debugInfo.valueProcessing.qualityChecks.push({
                check: `Process ${templateId}`,
                passed: true,
                message: 'Successfully processed boolean observation'
              });
            } else {
              console.log('❌ Failed to extract boolean value');
              debugInfo.valueProcessing.qualityChecks.push({
                check: `Process ${templateId}`,
                passed: false,
                message: 'Failed to extract boolean value from questionnaire response'
              });
              continue;
            }
          } else {
            // Handle complex FHIRPath expressions
            const boolValue = evaluateTemplateExpression(response, booleanExt.valueString);
            
            if (boolValue !== null) {
              observation.valueBoolean = boolValue === true || boolValue === 'true';
              
              debugInfo.valueProcessing.values[templateId] = boolValue;
              debugInfo.valueProcessing.transformations.push(`Extracted boolean value ${boolValue} for ${templateId} using expression`);
              console.log(`✅ Boolean value extracted with expression: ${boolValue}`);
              
              debugInfo.valueProcessing.qualityChecks.push({
                check: `Process ${templateId}`,
                passed: true,
                message: 'Successfully processed boolean observation'
              });
            } else {
              console.log('❌ Failed to extract boolean value with expression');
              debugInfo.valueProcessing.qualityChecks.push({
                check: `Process ${templateId}`,
                passed: false,
                message: 'Failed to extract boolean value using expression'
              });
              continue;
            }
          }
        } else {
          console.log('❌ Template has unsupported value type');
          debugInfo.valueProcessing.qualityChecks.push({
            check: `Process ${templateId}`,
            passed: false,
            message: 'Template has unsupported value type'
          });
          continue;
        }

        observations.push(observation);
      }
    } catch (error) {
      console.error(`Error processing template ${template.id}:`, error);
      debugInfo.valueProcessing.qualityChecks.push({
        check: `Process ${template.id || 'unknown'}`,
        passed: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }

  // Stage 6: Generate result
  if (observations.length > 0) {
    debugInfo.resultGeneration.status = 'Success';
    debugInfo.resultGeneration.observations = observations;
    console.log(`✅ Successfully extracted ${observations.length} observations`);
  } else {
    debugInfo.resultGeneration.status = 'Failed';
    debugInfo.resultGeneration.warnings = ['No observations could be extracted'];
    console.log('❌ No observations could be extracted');
  }

  return {
    result: observations.length > 0 ? observations : null,
    error: observations.length === 0 ? 'No observations could be extracted' : null,
    debugInfo
  };
}

export type TemplateExtractable = {
  extractable: boolean;
  templateReference?: string;
};

export function mapQItemsTemplate(questionnaire: Questionnaire): Record<string, TemplateExtractable> {
  if (!questionnaire.item || questionnaire.item.length === 0) {
    return {};
  }

  const initialExtension = questionnaire.extension?.find(
    (e) => e.url === FHIR_TEMPLATE_EXTRACT_EXTENSION
  );

  const templateReference = questionnaire.extension?.find(
    (e) => e.url === FHIR_TEMPLATE_REFERENCE_EXTENSION
  )?.valueString;

  const initialTemplateMap: Record<string, TemplateExtractable> = {
    [questionnaire.id ?? 'root']: {
      extractable: initialExtension?.valueBoolean ?? false,
      templateReference
    }
  };

  transverseQuestionnaire(questionnaire, mapQItemsTemplateRecursive, initialTemplateMap);

  return initialTemplateMap;
}

function mapQItemsTemplateRecursive(
  qItem: QuestionnaireItem,
  root?: Questionnaire,
  parent?: QuestionnaireItem,
  qItemTemplateMap?: Record<string, TemplateExtractable>
): void {
  if (!qItemTemplateMap) return;

  if (!qItemTemplateMap[qItem.linkId]) {
    qItemTemplateMap[qItem.linkId] = { extractable: false };
  }

  // Check if questionnaire extractable
  const extension = qItem.extension?.find((e: Extension) => e.url === FHIR_TEMPLATE_EXTRACT_EXTENSION);
  const templateReference = qItem.extension?.find(
    (e: Extension) => e.url === FHIR_TEMPLATE_REFERENCE_EXTENSION
  )?.valueString;

  if (extension?.valueBoolean || extension?.valueBoolean === false) {
    qItemTemplateMap[qItem.linkId].extractable = extension?.valueBoolean ?? false;
  } else if (parent && qItemTemplateMap[parent.linkId]) {
    qItemTemplateMap[qItem.linkId].extractable = qItemTemplateMap[parent.linkId].extractable;
  } else if (root && qItemTemplateMap[root.id ?? 'root']) {
    qItemTemplateMap[qItem.linkId].extractable = qItemTemplateMap[root?.id ?? 'root'].extractable;
  } else {
    qItemTemplateMap[qItem.linkId].extractable = false;
  }

  if (templateReference) {
    qItemTemplateMap[qItem.linkId].templateReference = templateReference;
  }

  if (qItem.item && qItem.item.length !== 0) {
    for (const qChildItem of qItem.item) {
      mapQItemsTemplateRecursive(qChildItem, root, qItem, qItemTemplateMap);
    }
  }
}

function transverseQuestionnaire(
  questionnaire: Questionnaire,
  callback: (
    qItem: QuestionnaireItem,
    root?: Questionnaire,
    parent?: QuestionnaireItem,
    qItemTemplateMap?: Record<string, TemplateExtractable>
  ) => void,
  qItemTemplateMap?: Record<string, TemplateExtractable>
): void {
  if (!questionnaire.item) return;

  for (const item of questionnaire.item) {
    callback(item, questionnaire, undefined, qItemTemplateMap);
    if (item.item) {
      for (const childItem of item.item) {
        callback(childItem, questionnaire, item, qItemTemplateMap);
      }
    }
  }
} 
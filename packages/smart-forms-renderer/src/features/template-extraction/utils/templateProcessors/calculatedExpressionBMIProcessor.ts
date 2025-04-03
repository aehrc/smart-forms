import { Questionnaire, QuestionnaireResponse, Observation } from 'fhir/r4';
import { evaluateFhirPath } from '../fhirPathUtils';
import { TemplateExtractionDebugger, debugUtils } from '../debugUtils';

export interface BMIProcessorResult {
  observations: Observation[];
  debugInfo?: {
    steps: any[];
    questionnaireId: string;
  };
}

/**
 * Process a BMI template with pre-population support
 * @param questionnaire The questionnaire containing the BMI template
 * @param response The questionnaire response with height and weight values
 * @returns Array of observations for height, weight, and BMI, along with debug info
 */
export async function processCalculatedExpressionBMITemplate(
  questionnaire: Questionnaire,
  response: QuestionnaireResponse
): Promise<BMIProcessorResult> {
  const debugLogger = new TemplateExtractionDebugger(questionnaire.id || 'unknown');
  
  try {
    // Step 1: Log questionnaire structure
    debugUtils.logQuestionnaireStructure(debugLogger, questionnaire);

    // Step 2: Log observation templates
    debugUtils.logObservationTemplates(debugLogger, questionnaire);

    // Step 3: Log item templates
    debugUtils.logItemTemplates(debugLogger, questionnaire);

    // Step 4: Extract height and weight values from nested structure
    const bmiCalculationItem = response.item?.find(item => item.linkId === 'bmi-calculation');
    const heightItem = bmiCalculationItem?.item?.find(item => item.linkId === 'patient-height');
    const weightItem = bmiCalculationItem?.item?.find(item => item.linkId === 'patient-weight');
    const bmiItem = bmiCalculationItem?.item?.find(item => item.linkId === 'bmi-result');

    debugLogger.logStep('extract_values', {
      height: heightItem?.answer?.[0]?.valueDecimal,
      weight: weightItem?.answer?.[0]?.valueDecimal,
      bmi: bmiItem?.answer?.[0]?.valueQuantity
    });

    // Step 5: Calculate BMI
    const heightValue = heightItem?.answer?.[0]?.valueDecimal;
    const weightValue = weightItem?.answer?.[0]?.valueDecimal;
    const bmiValue = bmiItem?.answer?.[0]?.valueQuantity?.value;
    const bmiComparator = bmiItem?.answer?.[0]?.valueQuantity?.comparator;

    let calculatedBmi = 0;
    if (heightValue && weightValue && heightValue > 0) {
      calculatedBmi = Number((weightValue / Math.pow(heightValue / 100, 2)).toFixed(1));
    }

    debugLogger.logStep('calculate_bmi', {
      heightValue,
      weightValue,
      bmiValue,
      bmiComparator,
      calculatedBmi
    });

    // Step 6: Create observations
    const observations: Observation[] = [];
    if (heightValue) {
      observations.push({
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8302-2',
            display: 'Body height'
          }]
        },
        valueQuantity: {
          value: heightValue,
          unit: 'cm',
          system: 'http://unitsofmeasure.org'
        }
      });
    }

    if (weightValue) {
      observations.push({
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '29463-7',
            display: 'Weight'
          }]
        },
        valueQuantity: {
          value: weightValue,
          unit: 'kg',
          system: 'http://unitsofmeasure.org'
        }
      });
    }

    if (calculatedBmi > 0) {
      observations.push({
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '39156-5',
            display: 'Body mass index'
          }]
        },
        valueQuantity: {
          value: calculatedBmi,
          unit: 'kg/m2',
          system: 'http://unitsofmeasure.org',
          comparator: bmiComparator
        }
      });
    }

    // Step 7: Log final result
    debugUtils.logExtractionResult(debugLogger, { observations });

    // Return both observations and debug info
    return {
      observations,
      debugInfo: debugUtils.getPlaygroundDebugInfo(debugLogger)
    };
  } catch (error) {
    debugLogger.logStep('error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'error');
    throw error;
  }
}
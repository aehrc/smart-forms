import type { Questionnaire, QuestionnaireResponse, Observation } from 'fhir/r4';
import { evaluateFhirPath } from '../fhirPathUtils';

export async function processBMITemplate(
  questionnaire: Questionnaire,
  response: QuestionnaireResponse
): Promise<Observation[]> {
  const observations: Observation[] = [];
  let heightValue: number | undefined;
  let weightValue: number | undefined;

  try {
    // Process height observation
    const heightTemplate = questionnaire.contained?.find(
      obs => obs.resourceType === 'Observation' && obs.id === 'obs-height'
    ) as Observation;

    if (heightTemplate) {
      const heightExt = heightTemplate.extension?.find(
        ext => ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue'
      );
      
      if (heightExt?.valueString) {
        heightValue = evaluateFhirPath(response, heightExt.valueString);
        if (heightValue !== undefined) {
          observations.push({
            ...heightTemplate,
            valueQuantity: {
              ...heightTemplate.valueQuantity,
              value: heightValue
            }
          });
        }
      }
    }

    // Process weight observation
    const weightTemplate = questionnaire.contained?.find(
      obs => obs.resourceType === 'Observation' && obs.id === 'obs-weight'
    ) as Observation;

    if (weightTemplate) {
      const weightExt = weightTemplate.extension?.find(
        ext => ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue'
      );
      
      if (weightExt?.valueString) {
        weightValue = evaluateFhirPath(response, weightExt.valueString);
        if (weightValue !== undefined) {
          observations.push({
            ...weightTemplate,
            valueQuantity: {
              ...weightTemplate.valueQuantity,
              value: weightValue
            }
          });
        }
      }
    }

    // Process BMI result observation only if both height and weight are available
    if (heightValue !== undefined && weightValue !== undefined) {
      const bmiTemplate = questionnaire.contained?.find(
        obs => obs.resourceType === 'Observation' && obs.id === 'obs-bmi-result'
      ) as Observation;

      if (bmiTemplate) {
        const bmiValue = weightValue / (heightValue * heightValue);
        observations.push({
          ...bmiTemplate,
          valueQuantity: {
            ...bmiTemplate.valueQuantity,
            value: bmiValue
          }
        });
      }
    }

  } catch (error) {
    console.error('Error processing BMI template:', error);
  }

  return observations;
} 
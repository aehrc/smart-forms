import type { Questionnaire, Observation } from 'fhir/r4';

const SDC_TEMPLATE_PROFILE = 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-template';
const SDC_TEMPLATE_EXTENSION = 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-template';
const SDC_OBSERVATION_TEMPLATE_PROFILE = 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationTemplate';

// Export for backward compatibility
export const SDC_TEMPLATE_EXTRACTION_PROFILE = SDC_TEMPLATE_PROFILE;

export interface TemplateValidationResult {
  isValid: boolean;
  error?: TemplateValidationError;
  templates?: Observation[];
}

export interface TemplateValidationError {
  code: 'missing-profile' | 'invalid-profile' | 'no-templates' | 'invalid-template-type' | 'invalid-bmi-template' | 'invalid-bp-template';
  message: string;
}

export function verifyTemplateProfile(questionnaire: Questionnaire): TemplateValidationResult {
  // Check for the template extension
  const hasTemplateExtension = questionnaire.extension?.some(
    ext => ext.url === SDC_TEMPLATE_EXTENSION && ext.valueBoolean === true
  );

  if (!hasTemplateExtension) {
    return {
      isValid: false,
      error: {
        code: 'missing-profile',
        message: 'Questionnaire must have the template extension'
      }
    };
  }

  // Check for either template profile
  const hasTemplateProfile = questionnaire.meta?.profile?.some(
    profile => profile === SDC_TEMPLATE_PROFILE || profile === SDC_OBSERVATION_TEMPLATE_PROFILE
  );

  if (!hasTemplateProfile) {
    return {
      isValid: false,
      error: {
        code: 'invalid-profile',
        message: 'Questionnaire must have either the SDC template profile or observation template profile'
      }
    };
  }

  return { isValid: true };
}

export function validateBMITemplate(questionnaire: Questionnaire): TemplateValidationResult {
  // Check for required contained observations
  const heightObs = questionnaire.contained?.find(
    obs => obs.resourceType === 'Observation' && obs.id === 'height-obs'
  ) as Observation | undefined;
  const weightObs = questionnaire.contained?.find(
    obs => obs.resourceType === 'Observation' && obs.id === 'weight-obs'
  ) as Observation | undefined;
  const bmiObs = questionnaire.contained?.find(
    obs => obs.resourceType === 'Observation' && obs.id === 'bmi-obs'
  ) as Observation | undefined;

  if (!heightObs || !weightObs || !bmiObs) {
    return {
      isValid: false,
      error: {
        code: 'invalid-bmi-template',
        message: 'BMI template must contain height, weight, and BMI observations'
      }
    };
  }

  // Check for required items with template references
  const bmiCalculationItem = questionnaire.item?.find(
    item => item.linkId === 'bmi-calculation'
  );

  if (!bmiCalculationItem) {
    return {
      isValid: false,
      error: {
        code: 'invalid-bmi-template',
        message: 'BMI template must have a bmi-calculation group item'
      }
    };
  }

  const heightItem = bmiCalculationItem.item?.find(
    item => item.linkId === 'patient-height'
  );
  const weightItem = bmiCalculationItem.item?.find(
    item => item.linkId === 'patient-weight'
  );
  const bmiItem = bmiCalculationItem.item?.find(
    item => item.linkId === 'bmi-result'
  );

  if (!heightItem || !weightItem || !bmiItem) {
    return {
      isValid: false,
      error: {
        code: 'invalid-bmi-template',
        message: 'BMI template must have height, weight, and BMI result items'
      }
    };
  }

  // Check for template references
  const hasHeightTemplate = heightItem.extension?.some(
    ext => ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate' &&
    ext.valueReference?.reference === '#height-obs'
  );
  const hasWeightTemplate = weightItem.extension?.some(
    ext => ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate' &&
    ext.valueReference?.reference === '#weight-obs'
  );
  const hasBMITemplate = bmiItem.extension?.some(
    ext => ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate' &&
    ext.valueReference?.reference === '#bmi-obs'
  );

  if (!hasHeightTemplate || !hasWeightTemplate || !hasBMITemplate) {
    return {
      isValid: false,
      error: {
        code: 'invalid-bmi-template',
        message: 'BMI template items must have correct observation template references'
      }
    };
  }

  return {
    isValid: true,
    templates: [heightObs, weightObs, bmiObs]
  };
}

export function isBMITemplate(questionnaire: Questionnaire): boolean {
  // Check for BMI-specific observations
  const hasBMIObservation = questionnaire.contained?.some(
    obs => obs.resourceType === 'Observation' && 
    (obs.code?.coding?.[0]?.code === '39156-5' || // BMI code
     obs.id === 'obs-bmi-result') // Check for BMI result observation by ID
  ) ?? false;

  // Check for BMI-specific items
  const hasBMIItems = questionnaire.item?.some(
    item => 
      // Check for direct items
      (item.linkId === 'height' || item.linkId === 'weight') ||
      // Check for nested items
      item.item?.some(
        subItem => subItem.linkId === 'patient-height' || 
                  subItem.linkId === 'patient-weight' ||
                  subItem.linkId === 'bmi-result'
      )
  ) ?? false;

  return hasBMIObservation && hasBMIItems;
}

export function isBloodPressureTemplate(questionnaire: Questionnaire): boolean {
  // Check for blood pressure specific observations
  const hasBPObservations = questionnaire.contained?.some(
    obs => obs.resourceType === 'Observation' && 
    (obs.code?.coding?.[0]?.code === '8480-6' || // Systolic
     obs.code?.coding?.[0]?.code === '8462-4')   // Diastolic
  ) ?? false;

  // Check for blood pressure specific items
  const hasBPItems = questionnaire.item?.some(
    item => item.linkId === 'systolic' || item.linkId === 'diastolic'
  ) ?? false;

  return hasBPObservations && hasBPItems;
}

export function validateBloodPressureTemplate(questionnaire: Questionnaire): TemplateValidationResult {
  // Check for required contained observations
  const systolicObs = questionnaire.contained?.find(
    obs => obs.resourceType === 'Observation' && obs.code?.coding?.[0]?.code === '8480-6'
  ) as Observation | undefined;
  const diastolicObs = questionnaire.contained?.find(
    obs => obs.resourceType === 'Observation' && obs.code?.coding?.[0]?.code === '8462-4'
  ) as Observation | undefined;

  if (!systolicObs || !diastolicObs) {
    return {
      isValid: false,
      error: {
        code: 'invalid-bp-template',
        message: 'Blood pressure template must contain systolic and diastolic observations'
      }
    };
  }

  // Check for required items
  const systolicItem = questionnaire.item?.find(item => item.linkId === 'systolic');
  const diastolicItem = questionnaire.item?.find(item => item.linkId === 'diastolic');

  if (!systolicItem || !diastolicItem) {
    return {
      isValid: false,
      error: {
        code: 'invalid-bp-template',
        message: 'Blood pressure template must have systolic and diastolic items'
      }
    };
  }

  // Check for template references
  const hasSystolicTemplate = systolicItem.extension?.some(
    ext => ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate' &&
    ext.valueReference?.reference === `#${systolicObs.id}`
  );
  const hasDiastolicTemplate = diastolicItem.extension?.some(
    ext => ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate' &&
    ext.valueReference?.reference === `#${diastolicObs.id}`
  );

  if (!hasSystolicTemplate || !hasDiastolicTemplate) {
    return {
      isValid: false,
      error: {
        code: 'invalid-bp-template',
        message: 'Blood pressure template items must have correct observation template references'
      }
    };
  }

  return {
    isValid: true,
    templates: [systolicObs, diastolicObs]
  };
}

export function extractTemplateObservations(questionnaire: Questionnaire): TemplateValidationResult {
  // First verify the profile
  const profileResult = verifyTemplateProfile(questionnaire);
  if (!profileResult.isValid) {
    return profileResult;
  }

  // Check if it's a blood pressure template first
  if (isBloodPressureTemplate(questionnaire)) {
    return validateBloodPressureTemplate(questionnaire);
  }

  // Then check if it's a BMI calculator template
  if (isBMITemplate(questionnaire)) {
    return validateBMITemplate(questionnaire);
  }

  // If no specific template type is matched, return error
  return {
    isValid: false,
    error: {
      code: 'invalid-template-type',
      message: 'Questionnaire must be either a blood pressure or BMI calculator template'
    }
  };
} 
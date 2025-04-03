import type { Questionnaire, Observation } from 'fhir/r4';
import { validateBMITemplate, validateBloodPressureTemplate, isBMITemplate, isBloodPressureTemplate } from '../utils/templateValidationUtils';

export interface DebugStep {
  step: string;
  status: 'success' | 'error' | 'warning';
  timestamp: string;
  data?: any;
  message?: string;
}

export interface DebugUtils {
  logQuestionnaireStructure: (debugLogger: TemplateExtractionDebugger, questionnaire: Questionnaire) => void;
  logObservationTemplates: (debugLogger: TemplateExtractionDebugger, questionnaire: Questionnaire) => void;
  logItemTemplates: (debugLogger: TemplateExtractionDebugger, questionnaire: Questionnaire) => void;
  logExtractionResult: (debugLogger: TemplateExtractionDebugger, result: { observations: Observation[] }) => void;
  getPlaygroundDebugInfo: (debugLogger: TemplateExtractionDebugger) => { steps: DebugStep[]; questionnaireId: string };
}

export class TemplateExtractionDebugger {
  private steps: DebugStep[] = [];

  constructor(private questionnaireId: string) {}

  logStep(step: string, data?: any, status: 'success' | 'error' | 'warning' = 'success', message?: string) {
    this.steps.push({
      step,
      timestamp: new Date().toISOString(),
      data,
      status,
      message
    });
  }

  getSteps(): DebugStep[] {
    return this.steps;
  }

  getQuestionnaireId(): string {
    return this.questionnaireId;
  }
}

export const debugUtils: DebugUtils = {
  logQuestionnaireStructure(debugLogger: TemplateExtractionDebugger, questionnaire: Questionnaire): void {
    // Log basic questionnaire structure
    debugLogger.logStep('questionnaire_structure', {
      id: questionnaire.id,
      title: questionnaire.title,
      hasTemplateExtension: questionnaire.extension?.some(
        ext => ext.url === 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-template'
      ),
      containedResources: questionnaire.contained?.length || 0,
      items: questionnaire.item?.length || 0
    });

    // Check template type and run appropriate validation
    if (isBloodPressureTemplate(questionnaire)) {
      const bpValidation = validateBloodPressureTemplate(questionnaire);
      debugLogger.logStep('blood_pressure_template_validation', {
        isValid: bpValidation.isValid,
        error: bpValidation.error,
        templates: bpValidation.templates?.map(obs => ({
          id: obs.id,
          code: obs.code?.coding?.[0]?.code
        }))
      }, bpValidation.isValid ? 'success' : 'error', bpValidation.error?.message);
    } else if (isBMITemplate(questionnaire)) {
      const bmiValidation = validateBMITemplate(questionnaire);
      debugLogger.logStep('bmi_template_validation', {
        isValid: bmiValidation.isValid,
        error: bmiValidation.error,
        templates: bmiValidation.templates?.map(obs => ({
          id: obs.id,
          code: obs.code?.coding?.[0]?.code
        }))
      }, bmiValidation.isValid ? 'success' : 'error', bmiValidation.error?.message);
    }
  },

  logObservationTemplates(debugLogger: TemplateExtractionDebugger, questionnaire: Questionnaire): void {
    const observationTemplates = questionnaire.contained?.filter(
      resource => resource.resourceType === 'Observation'
    ) || [];

    debugLogger.logStep('observation_templates', {
      count: observationTemplates.length,
      templates: observationTemplates.map(obs => ({
        id: obs.id,
        code: obs.code?.coding?.[0]?.code,
        hasValue: !!obs.valueQuantity?.value
      }))
    });
  },

  logItemTemplates(debugLogger: TemplateExtractionDebugger, questionnaire: Questionnaire): void {
    const itemsWithTemplates = questionnaire.item?.filter(
      item => item.extension?.some(
        ext => ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate'
      )
    ) || [];

    debugLogger.logStep('item_templates', {
      count: itemsWithTemplates.length,
      items: itemsWithTemplates.map(item => ({
        linkId: item.linkId,
        templateRef: item.extension?.find(
          ext => ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-observationTemplate'
        )?.valueReference?.reference
      }))
    });
  },

  logExtractionResult(debugLogger: TemplateExtractionDebugger, result: { observations: Observation[] }): void {
    debugLogger.logStep('extraction_result', {
      count: result.observations.length,
      observations: result.observations.map(obs => ({
        id: obs.id,
        code: obs.code?.coding?.[0]?.code,
        value: obs.valueQuantity?.value
      }))
    });
  },

  getPlaygroundDebugInfo(debugLogger: TemplateExtractionDebugger): { steps: DebugStep[]; questionnaireId: string } {
    return {
      steps: debugLogger.getSteps(),
      questionnaireId: debugLogger.getQuestionnaireId()
    };
  }
}; 
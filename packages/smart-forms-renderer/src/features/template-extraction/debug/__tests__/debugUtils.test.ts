import { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import { TemplateExtractionDebugger, debugUtils } from '../debugUtils';

describe('TemplateExtractionDebugger', () => {
  let debugLogger: TemplateExtractionDebugger;
  const testQuestionnaireId = 'test-questionnaire';

  beforeEach(() => {
    debugLogger = new TemplateExtractionDebugger(testQuestionnaireId);
  });

  it('should log questionnaire structure', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: testQuestionnaireId,
      title: 'Test Questionnaire',
      status: 'active',
      extension: [{
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-template',
        valueBoolean: true
      }],
      contained: [],
      item: []
    };

    debugUtils.logQuestionnaireStructure(debugLogger, questionnaire);
    const steps = debugLogger.getSteps();

    expect(steps).toHaveLength(1);
    expect(steps[0].step).toBe('questionnaire_structure');
    expect(steps[0].data).toEqual({
      id: testQuestionnaireId,
      title: 'Test Questionnaire',
      hasTemplateExtension: true,
      containedResources: 0,
      items: 0
    });
  });

  it('should log observation templates', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: testQuestionnaireId,
      title: 'Test Questionnaire',
      status: 'active',
      contained: [{
        resourceType: 'Observation',
        id: 'height-obs',
        status: 'final',
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8302-2',
            display: 'Body height'
          }]
        },
        valueQuantity: {
          value: 170,
          unit: 'cm',
          system: 'http://unitsofmeasure.org'
        }
      }],
      item: []
    };

    debugUtils.logObservationTemplates(debugLogger, questionnaire);
    const steps = debugLogger.getSteps();

    expect(steps).toHaveLength(1);
    expect(steps[0].step).toBe('observation_templates');
    expect(steps[0].data).toEqual({
      count: 1,
      templates: [{
        id: 'height-obs',
        code: '8302-2',
        hasValue: true
      }]
    });
  });

  it('should log item templates', () => {
    const questionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      id: testQuestionnaireId,
      title: 'Test Questionnaire',
      status: 'active',
      contained: [],
      item: [{
        linkId: 'height',
        text: 'Height',
        type: 'decimal',
        extension: [{
          url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-observationTemplate',
          valueReference: {
            reference: '#height-obs'
          }
        }]
      }]
    };

    debugUtils.logItemTemplates(debugLogger, questionnaire);
    const steps = debugLogger.getSteps();

    expect(steps).toHaveLength(1);
    expect(steps[0].step).toBe('item_templates');
    expect(steps[0].data).toEqual({
      count: 1,
      items: [{
        linkId: 'height',
        type: 'decimal',
        hasTemplate: true
      }]
    });
  });

  it('should log extraction result', () => {
    const result = {
      observations: [{
        resourceType: 'Observation' as const,
        id: 'height-obs',
        status: 'final' as const,
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '8302-2',
            display: 'Body height'
          }]
        },
        valueQuantity: {
          value: 170,
          unit: 'cm'
        }
      }],
      errors: []
    };

    debugUtils.logExtractionResult(debugLogger, result);
    const steps = debugLogger.getSteps();

    expect(steps).toHaveLength(1);
    expect(steps[0].step).toBe('extraction_result');
    expect(steps[0].data).toEqual({
      success: true,
      observations: result.observations,
      errors: []
    });
  });
}); 
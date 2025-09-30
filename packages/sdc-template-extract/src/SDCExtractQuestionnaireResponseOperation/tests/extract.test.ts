import { extract } from '../utils';
import type { OutputParameters, ReturnParameter } from '../interfaces';
import { createInputParameters } from '../utils/createInputParameters';
import type {
  Bundle,
  Observation,
  Parameters,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  RelatedPerson
} from 'fhir/r4';

// Extracted resources
import { extractedAllergiesAdverseReactions } from './resources/extracted/extractedAllergiesAdverseReactions';
import { extractedImmunisation } from './resources/extracted/extractedImmunisation';
import { extractedMedicalHistoryCurrentProblems } from './resources/extracted/extractedMedicalHistoryCurrentProblems';
import { extractedMedicalHistoryCurrentProblemsWithPatch } from './resources/extracted/extractedMedicalHistoryCurrentProblemsWithPatch';
import { extractedRegularMedications } from './resources/extracted/extractedRegularMedications';
import { extractedRegularMedicationsModified } from './resources/extracted/extractedRegularMedicationsModified';
import { extractedRegularMedicationsWithPatchAdd } from './resources/extracted/extractedRegularMedicationsWithPatchAdd';
import { extractedComplexTemplateExtract } from './resources/extracted/extractedComplexTemplateExtract';

// QuestionnaireResponses
import { QRAllergiesAdverseReactions } from './resources/questionnaireResponses/QRAllergiesAdverseReactions';
import { QRImmunisation } from './resources/questionnaireResponses/QRImmunisation';
import { QRMedicalHistoryCurrentProblems } from './resources/questionnaireResponses/QRMedicalHistoryCurrentProblems';
import { QRMedicalHistoryCurrentProblemsWithPatch } from './resources/questionnaireResponses/QRMedicalHistoryCurrentProblemsWithPatch';
import { QRMedicalHistoryCurrentProblemsWithPatch2 } from './resources/questionnaireResponses/QRMedicalHistoryCurrentProblemsWithPatch2';
import { QRRegularMedications } from './resources/questionnaireResponses/QRRegularMedications';
import { QRRegularMedicationsModified } from './resources/questionnaireResponses/QRRegularMedicationsModified';
import { QRRegularMedicationsWithPatchAdd } from './resources/questionnaireResponses/QRRegularMedicationsWithPatchAdd';
import { QRComplexTemplateExtract } from './resources/questionnaireResponses/QRComplexTemplateExtract';

// Questionnaires
import { QAllergiesAdverseReactions } from './resources/questionnaires/QAllergiesAdverseReactions';
import { QImmunisation } from './resources/questionnaires/QImmunisation';
import { QMedicalHistoryCurrentProblems } from './resources/questionnaires/QMedicalHistoryCurrentProblems';
import { QMedicalHistoryCurrentProblemsWithPatch } from './resources/questionnaires/QMedicalHistoryCurrentProblemsWithPatch';
import { QMedicalHistoryCurrentProblemsWithPatch2 } from './resources/questionnaires/QMedicalHistoryCurrentProblemsWithPatch2';
import { QRegularMedications } from './resources/questionnaires/QRegularMedications';
import { QRegularMedicationsModified } from './resources/questionnaires/QRegularMedicationsModified';
import { QRegularMedicationsWithPatchAdd } from './resources/questionnaires/QRegularMedicationsWithPatchAdd';
import { QComplexTemplateExtract } from './resources/questionnaires/QComplexTemplateExtract';
import { parametersIsFhirPatch } from '../utils/typePredicates';

// Mock the fetchQuestionnaire callback function
const mockFetchQuestionnaire = jest.fn();
const mockFetchQuestionnaireConfig = {
  sourceServerUrl: 'https://example.com/fhir',
  headers: { Authorization: 'Bearer token' }
};

// Test against 715 templates
describe('extract AllergiesAdverseReactions', () => {
  it('extracted result should match extractedAllergiesAdverseReactions.ts expected resources', async () => {
    const result = await extract(
      createInputParameters(QRAllergiesAdverseReactions, QAllergiesAdverseReactions, undefined),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    // Deep comparison of the extracted resources vs expected resources in extractedAllergiesAdverseReactions
    const extracted = returnParam?.resource as Bundle;
    const expected = extractedAllergiesAdverseReactions;
    expect(extracted.entry?.[0]?.resource).toEqual(expected?.entry?.[0]?.resource);
    expect(extracted.entry?.[1]?.resource).toEqual(expected?.entry?.[1]?.resource);
    expect(extracted.entry?.[2]?.resource).toEqual(expected?.entry?.[2]?.resource);
  });
});

describe('extract Immunisation', () => {
  it('extracted result should match extractedImmunisation.ts expected resources', async () => {
    const result = await extract(
      createInputParameters(QRImmunisation, QImmunisation, undefined),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    // Deep comparison of the extracted resources vs expected resources in extractedImmunisation
    const extracted = returnParam?.resource as Bundle;
    const expected = extractedImmunisation;
    expect(extracted.entry?.[0]?.resource).toEqual(expected?.entry?.[0]?.resource);
    expect(extracted.entry?.[1]?.resource).toEqual(expected?.entry?.[1]?.resource);
    expect(extracted.entry?.[2]?.resource).toEqual(expected?.entry?.[2]?.resource);
  });
});

describe('extract MedicalHistoryCurrentProblems', () => {
  it('extracted result should match extractedMedicalHistoryCurrentProblems.ts expected resources', async () => {
    const result = await extract(
      createInputParameters(
        QRMedicalHistoryCurrentProblems,
        QMedicalHistoryCurrentProblems,
        undefined
      ),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    // Deep comparison of the extracted resources vs expected resources in extractedMedicalHistoryCurrentProblems
    const extracted = returnParam?.resource as Bundle;
    const expected = extractedMedicalHistoryCurrentProblems;
    expect(extracted.entry?.[0]?.resource).toEqual(expected?.entry?.[0]?.resource);
    expect(extracted.entry?.[1]?.resource).toEqual(expected?.entry?.[1]?.resource);
    expect(extracted.entry?.[2]?.resource).toEqual(expected?.entry?.[2]?.resource);
    expect(extracted.entry?.[3]?.resource).toEqual(expected?.entry?.[3]?.resource);
    expect(extracted.entry?.[4]?.resource).toEqual(expected?.entry?.[4]?.resource);
    expect(extracted.entry?.[5]?.resource).toEqual(expected?.entry?.[5]?.resource);
    expect(extracted.entry?.[6]?.resource).toEqual(expected?.entry?.[6]?.resource);
    expect(extracted.entry?.[7]?.resource).toEqual(expected?.entry?.[7]?.resource);
  });
});

describe('extract MedicalHistoryCurrentProblemsWithPatch', () => {
  it('extracted result should match extractedMedicalHistoryCurrentProblemsWithPatch.ts expected resources', async () => {
    const result = await extract(
      createInputParameters(
        QRMedicalHistoryCurrentProblemsWithPatch,
        QMedicalHistoryCurrentProblemsWithPatch,
        undefined
      ),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    // Deep comparison of the extracted resources vs expected resources in extractedMedicalHistoryCurrentProblems
    const extracted = returnParam?.resource as Bundle;
    const expected = extractedMedicalHistoryCurrentProblemsWithPatch;

    const extracted0 = extracted.entry?.[0]?.resource as Parameters;
    const extracted1 = extracted.entry?.[1]?.resource as Parameters;
    const extracted2 = extracted.entry?.[2]?.resource as Parameters;
    const extracted3 = extracted.entry?.[3]?.resource as Parameters;

    expect(extracted0).toEqual(expected?.entry?.[0]?.resource);
    expect(extracted1).toEqual(expected?.entry?.[1]?.resource);
    expect(extracted2).toEqual(expected?.entry?.[2]?.resource);
    expect(extracted3).toEqual(expected?.entry?.[3]?.resource);

    // Extracted resources should be a FHIRPatch with method PATCH
    expect(parametersIsFhirPatch(extracted0)).toBe(true);
    expect(extracted.entry?.[0]?.request?.method).toEqual('PATCH');

    expect(parametersIsFhirPatch(extracted1)).toBe(true);
    expect(extracted.entry?.[1]?.request?.method).toEqual('PATCH');

    expect(parametersIsFhirPatch(extracted2)).toBe(true);
    expect(extracted.entry?.[2]?.request?.method).toEqual('PATCH');

    expect(parametersIsFhirPatch(extracted3)).toBe(true);
    expect(extracted.entry?.[3]?.request?.method).toEqual('PATCH');
  });

  it('extracted result should match extractedMedicalHistoryCurrentProblemsWithPatch.ts expected resources (modified only)', async () => {
    const newUtiClinicalStatusAnswer: QuestionnaireResponseItemAnswer = {
      valueCoding: {
        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
        code: 'inactive',
        display: 'Inactive'
      }
    };

    const comparisonSourceResponse = structuredClone(QRMedicalHistoryCurrentProblemsWithPatch);

    // Change Condition ID "uti-pat-sf" clinical status from "active" to "inactive"
    if (
      QRMedicalHistoryCurrentProblemsWithPatch.item?.[0]?.item?.[1]?.item?.[9]?.item?.[2]?.answer
    ) {
      QRMedicalHistoryCurrentProblemsWithPatch.item[0].item[1].item[9].item[2].answer = [
        newUtiClinicalStatusAnswer
      ];
    }
    const result = await extract(
      createInputParameters(
        QRMedicalHistoryCurrentProblemsWithPatch,
        QMedicalHistoryCurrentProblemsWithPatch,
        comparisonSourceResponse
      ),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    // Deep comparison of the extracted resources vs expected resources in extractedMedicalHistoryCurrentProblems
    const extracted = returnParam?.resource as Bundle;

    // Extracted should only produce one entry - FHIRPatch with method PATCH, resourceId must be "uti-pat-sf"
    expect(extracted.entry?.[0]?.resource?.resourceType).toEqual('Parameters');
    expect(
      (extracted.entry?.[0]?.resource as Parameters)?.parameter?.[0]?.part?.[2]
        ?.valueCodeableConcept
    ).toEqual({
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'inactive',
          display: 'Inactive'
        }
      ],
      text: 'Inactive'
    });
    expect(extracted.entry?.[0]?.request?.method).toEqual('PATCH');
    expect(extracted.entry?.[0]?.request?.url).toEqual('Condition/uti-pat-sf');

    // There should be no second entry
    expect(extracted.entry?.[1]?.resource).toEqual(undefined);
  });
});

describe('extract MedicalHistoryCurrentProblemsWithPatch2', () => {
  // This tests Change detection in FHIRPatch Parameters. it should check changes in each "operation" parameter
  it('extracted result should match extractedMedicalHistoryCurrentProblemsWithPatch2.ts expected resources (modified only)', async () => {
    const newUtiClinicalStatusAnswer: QuestionnaireResponseItemAnswer = {
      valueCoding: {
        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
        code: 'inactive',
        display: 'Inactive'
      }
    };
    const newAbatementDateItem: QuestionnaireResponseItem = {
      linkId: 'e4524654-f6de-4717-b288-34919394d46b',
      text: 'Abatement date',
      answer: [
        {
          valueDate: '2025-06-04'
        }
      ]
    };

    const comparisonSourceResponse = structuredClone(QRMedicalHistoryCurrentProblemsWithPatch2);

    // Change Condition ID "uti-pat-sf" clinical status from "active" to "inactive"
    if (
      QRMedicalHistoryCurrentProblemsWithPatch2.item?.[0]?.item?.[1]?.item?.[2]?.item?.[2]?.answer
    ) {
      QRMedicalHistoryCurrentProblemsWithPatch2.item[0].item[1].item[2].item[2].answer = [
        newUtiClinicalStatusAnswer
      ];
    }

    // Add abatement date to Condition ID "uti-pat-sf"
    if (QRMedicalHistoryCurrentProblemsWithPatch2.item?.[0]?.item?.[1]?.item?.[2]?.item) {
      QRMedicalHistoryCurrentProblemsWithPatch2.item?.[0]?.item?.[1]?.item?.[2]?.item.push(
        newAbatementDateItem
      );
    }

    // Add abatement date to Condition ID "diabetes-pat-sf"
    if (QRMedicalHistoryCurrentProblemsWithPatch2.item?.[0]?.item?.[1]?.item?.[3]?.item) {
      QRMedicalHistoryCurrentProblemsWithPatch2.item[0].item[1].item[3]?.item.push(
        newAbatementDateItem
      );
    }

    const result = await extract(
      createInputParameters(
        QRMedicalHistoryCurrentProblemsWithPatch2,
        QMedicalHistoryCurrentProblemsWithPatch2,
        comparisonSourceResponse
      ),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    // Deep comparison of the extracted resources vs expected resources in extractedMedicalHistoryCurrentProblemsWithPatch2
    const extracted = returnParam?.resource as Bundle;

    // Extracted should produce two entries - FHIRPatch with method PATCH
    // 1st resource must be "uti-pat-sf" with two operations - change clinical status and add abatement date
    expect(extracted.entry?.[0]?.resource?.resourceType).toEqual('Parameters');
    expect(
      (extracted.entry?.[0]?.resource as Parameters)?.parameter?.[0]?.part?.[2]
        ?.valueCodeableConcept
    ).toEqual({
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'inactive',
          display: 'Inactive'
        }
      ]
    });

    expect(
      (extracted.entry?.[0]?.resource as Parameters)?.parameter?.[1]?.part?.[2]?.valueDateTime
    ).toEqual('2025-06-04');
    expect(extracted.entry?.[0]?.request?.method).toEqual('PATCH');
    expect(extracted.entry?.[0]?.request?.url).toEqual('Condition/uti-pat-sf');

    // 2nd resource must be "diabetes-pat-sf" with one operation - add abatement date
    expect(extracted.entry?.[1]?.resource?.resourceType).toEqual('Parameters');
    expect(
      (extracted.entry?.[1]?.resource as Parameters)?.parameter?.[0]?.part?.[2]?.valueDateTime
    ).toEqual('2025-06-04');
    expect(extracted.entry?.[1]?.request?.method).toEqual('PATCH');
    expect(extracted.entry?.[1]?.request?.url).toEqual('Condition/diabetes-pat-sf');

    // There should be no third entry
    expect(extracted.entry?.[2]?.resource).toEqual(undefined);
  });
});

describe('extract RegularMedications', () => {
  // _dateAsserted uses FHIRPath expressions of "now()", so dates generated will be different - strip it out for comparison purposes
  function stripDateAsserted(resource: any): any {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dateAsserted, ...rest } = resource ?? {};
    return rest;
  }

  it('extracted result should match extractedRegularMedications.ts expected resources', async () => {
    const result = await extract(
      createInputParameters(QRRegularMedications, QRegularMedications, undefined),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    // Deep comparison of the extracted resources vs expected resources in extractedRegularMedications
    const extracted = returnParam?.resource as Bundle;
    const expected = extractedRegularMedications;
    expect(stripDateAsserted(extracted.entry?.[0]?.resource)).toEqual(
      stripDateAsserted(expected?.entry?.[0]?.resource)
    );
    expect(stripDateAsserted(extracted.entry?.[1]?.resource)).toEqual(
      stripDateAsserted(expected?.entry?.[1]?.resource)
    );
  });
});

describe('extract RegularMedicationsModified', () => {
  // _dateAsserted uses FHIRPath expressions of "now()", so dates generated will be different - strip it out for comparison purposes
  function stripDateAsserted(resource: any): any {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dateAsserted, ...rest } = resource ?? {};
    return rest;
  }

  it('extracted result should match extractedRegularMedicationsModified.ts expected resources', async () => {
    const result = await extract(
      createInputParameters(QRRegularMedicationsModified, QRegularMedicationsModified, undefined),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    // Deep comparison of the extracted resources vs expected resources in extractedRegularMedications
    const extracted = returnParam?.resource as Bundle;
    const expected = extractedRegularMedicationsModified;
    expect(stripDateAsserted(extracted.entry?.[0]?.resource)).toEqual(
      stripDateAsserted(expected?.entry?.[0]?.resource)
    );
    expect(stripDateAsserted(extracted.entry?.[1]?.resource)).toEqual(
      stripDateAsserted(expected?.entry?.[1]?.resource)
    );
  });
});

describe('extract RegularMedicationsWithPatchAdd', () => {
  // _dateAsserted uses FHIRPath expressions of "now()", so dates generated will be different - strip it out for comparison purposes
  function stripDateAsserted(resource: any): any {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dateAsserted, ...rest } = resource ?? {};
    return rest;
  }

  it('extracted result should match extractedRegularMedicationsWithPatchAdd.ts expected resources  (modified only)', async () => {
    const newCommentAnswer: QuestionnaireResponseItemAnswer = {
      valueString: 'Comment2 - modified'
    };

    const comparisonSourceResponse = structuredClone(QRRegularMedicationsWithPatchAdd);

    // Change first Medication's comment from "Comment2" to "Comment2 - modified"
    if (QRRegularMedicationsWithPatchAdd.item?.[0]?.item?.[0]?.item?.[0]?.item?.[6]?.answer) {
      QRRegularMedicationsWithPatchAdd.item[0].item[0].item[0].item[6].answer = [newCommentAnswer];
    }

    const result = await extract(
      createInputParameters(
        QRRegularMedicationsWithPatchAdd,
        QRegularMedicationsWithPatchAdd,
        comparisonSourceResponse
      ),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    // Deep comparison of the extracted resources vs expected resources in extractedRegularMedications
    const extracted = returnParam?.resource as Bundle;
    const expected = extractedRegularMedicationsWithPatchAdd;
    expect(stripDateAsserted(extracted.entry?.[0]?.resource)).toEqual(
      stripDateAsserted(expected?.entry?.[0]?.resource)
    );
  });
});

// Test against https://build.fhir.org/ig/HL7/sdc/Questionnaire-extract-complex-template.html

describe('extract ComplexTemplateExtract', () => {
  let extracted: Bundle;

  beforeAll(async () => {
    const result = await extract(
      createInputParameters(QRComplexTemplateExtract, QComplexTemplateExtract, undefined),
      mockFetchQuestionnaire,
      mockFetchQuestionnaireConfig
    );

    const returnParam = (result as OutputParameters).parameter.find(
      (p): p is ReturnParameter => p.name === 'return'
    );

    extracted = returnParam?.resource as Bundle;
  });

  it('extracted result should match extractedComplexTemplateExtract.ts expected resources', async () => {
    // Deep comparison of the extracted resources vs expected resources in extractedRegularMedications
    const expected = extractedComplexTemplateExtract;

    // Compare Patient
    expect(stripPatientId(extracted.entry?.[0]?.resource)).toEqual(
      stripPatientId(expected?.entry?.[0]?.resource)
    );

    // Compare RelatedPerson
    expect(stripRelatedPersonPatientReference(extracted.entry?.[1]?.resource)).toEqual(
      stripRelatedPersonPatientReference(expected?.entry?.[1]?.resource)
    );

    // Compare Observations
    expect(stripObservationSubjectReferenceAndDates(extracted.entry?.[2]?.resource)).toEqual(
      stripObservationSubjectReferenceAndDates(expected?.entry?.[2]?.resource)
    );

    expect(stripObservationSubjectReferenceAndDates(extracted.entry?.[3]?.resource)).toEqual(
      stripObservationSubjectReferenceAndDates(expected?.entry?.[3]?.resource)
    );
    expect(stripObservationSubjectReferenceAndDates(extracted.entry?.[4]?.resource)).toEqual(
      stripObservationSubjectReferenceAndDates(expected?.entry?.[4]?.resource)
    );
  });

  it('all patient and subject references should use %NewPatientId from sdc-questionnaire-extractAllocateId extension', async () => {
    // Patient ID
    const extractedPatientId = extracted.entry?.[0]?.resource?.id;

    // RelatedPerson.patient.reference should match Patient ID
    const relatedPerson = extracted.entry?.[1]?.resource as RelatedPerson;
    expect(relatedPerson?.resourceType).toEqual('RelatedPerson');
    expect(relatedPerson.patient?.reference).toEqual(`Patient/${extractedPatientId}`);

    // Observation.subject.reference should match Patient ID
    const observationHeight = extracted.entry?.[2]?.resource as Observation;
    expect(observationHeight?.resourceType).toEqual('Observation');
    expect(observationHeight.subject?.reference).toEqual(`Patient/${extractedPatientId}`);

    const observationWeight = extracted.entry?.[3]?.resource as Observation;
    expect(observationWeight?.resourceType).toEqual('Observation');
    expect(observationWeight.subject?.reference).toEqual(`Patient/${extractedPatientId}`);

    const observationSigmoidoscopy = extracted.entry?.[4]?.resource as Observation;
    expect(observationSigmoidoscopy?.resourceType).toEqual('Observation');
    expect(observationSigmoidoscopy.subject?.reference).toEqual(`Patient/${extractedPatientId}`);
  });

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z)?$/;

  it('observation effectiveDateTime and issued should be date-parsable', async () => {
    const observationHeight = extracted.entry?.[2]?.resource as Observation;
    const observationWeight = extracted.entry?.[3]?.resource as Observation;
    const observationSigmoidoscopy = extracted.entry?.[4]?.resource as Observation;

    expect(observationHeight.effectiveDateTime).toMatch(isoDateRegex);
    expect(observationWeight.issued).toMatch(isoDateRegex);
    expect(observationSigmoidoscopy.issued).toMatch(isoDateRegex);
  });
});

/* Helper Functions */

// id is a UUID from %NewPatientId (from sdc-questionnaire-extractAllocateId), so ids generated will be different - strip it out for comparison purposes
function stripPatientId(resource: any): any {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...rest } = resource ?? {};
  return rest;
}

// RelatedPerson.patient.reference is a UUID from %NewPatientId (from sdc-questionnaire-extractAllocateId), so ids generated will be different - strip it out for comparison purposes
function stripRelatedPersonPatientReference(resource: any): any {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { patient, ...rest } = resource ?? {};
  return rest;
}

// Observation.subject.reference is a UUID from %NewPatientId (from sdc-questionnaire-extractAllocateId), so ids generated will be different - strip it out for comparison purposes
function stripObservationSubjectReferenceAndDates(resource: any): any {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { subject, effectiveDateTime, issued, ...rest } = resource ?? {};
  return rest;
}

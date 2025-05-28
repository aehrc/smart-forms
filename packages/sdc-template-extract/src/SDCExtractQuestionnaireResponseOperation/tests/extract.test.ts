import { extract } from '../utils';
import type { OutputParameters, ReturnParameter } from '../interfaces';
import { createInputParameters } from '../utils/createInputParameters';
import type { Bundle, Observation, RelatedPerson } from 'fhir/r4';

// Callbacks
import {
  fetchResourceCallbackTest,
  requestConfigTest
} from './callbacks/fetchResourceCallbackTest';

// Extracted resources
import { extractedAllergiesAdverseReactions } from './resources/extracted/extractedAllergiesAdverseReactions';
import { extractedImmunisation } from './resources/extracted/extractedImmunisation';
import { extractedMedicalHistoryCurrentProblems } from './resources/extracted/extractedMedicalHistoryCurrentProblems';
import { extractedRegularMedications } from './resources/extracted/extractedRegularMedications';
import { extractedComplexTemplateExtract } from './resources/extracted/extractedComplexTemplateExtract';

// QuestionnaireResponses
import { QRAllergiesAdverseReactions } from './resources/questionnaireResponses/QRAllergiesAdverseReactions';
import { QRImmunisation } from './resources/questionnaireResponses/QRImmunisation';
import { QRMedicalHistoryCurrentProblems } from './resources/questionnaireResponses/QRMedicalHistoryCurrentProblems';
import { QRRegularMedications } from './resources/questionnaireResponses/QRRegularMedications';
import { QRComplexTemplateExtract } from './resources/questionnaireResponses/QRComplexTemplateExtract';

// Questionnaires
import { QAllergiesAdverseReactions } from './resources/questionnaires/QAllergiesAdverseReactions';
import { QImmunisation } from './resources/questionnaires/QImmunisation';
import { QMedicalHistoryCurrentProblems } from './resources/questionnaires/QMedicalHistoryCurrentProblems';
import { QRegularMedications } from './resources/questionnaires/QRegularMedications';
import { QComplexTemplateExtract } from './resources/questionnaires/QComplexTemplateExtract';

// Test against 715 templates
describe('extract AllergiesAdverseReactions', () => {
  it('extracted result should match extractedAllergiesAdverseReactions.ts expected resources', async () => {
    const result = await extract(
      createInputParameters(QRAllergiesAdverseReactions, QAllergiesAdverseReactions),
      fetchResourceCallbackTest,
      requestConfigTest
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
      createInputParameters(QRImmunisation, QImmunisation),
      fetchResourceCallbackTest,
      requestConfigTest
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
      createInputParameters(QRMedicalHistoryCurrentProblems, QMedicalHistoryCurrentProblems),
      fetchResourceCallbackTest,
      requestConfigTest
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

describe('extract RegularMedications', () => {
  // _dateAsserted uses FHIRPath expressions of "now()", so dates generated will be different - strip it out for comparison purposes
  function stripDateAsserted(resource: any): any {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dateAsserted, ...rest } = resource ?? {};
    return rest;
  }

  it('extracted result should match extractedRegularMedications.ts expected resources', async () => {
    const result = await extract(
      createInputParameters(QRRegularMedications, QRegularMedications),
      fetchResourceCallbackTest,
      requestConfigTest
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

// Test against https://build.fhir.org/ig/HL7/sdc/Questionnaire-extract-complex-template.html

describe('extract ComplexTemplateExtract', () => {
  let extracted: Bundle;

  beforeAll(async () => {
    const result = await extract(
      createInputParameters(QRComplexTemplateExtract, QComplexTemplateExtract),
      fetchResourceCallbackTest,
      requestConfigTest
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

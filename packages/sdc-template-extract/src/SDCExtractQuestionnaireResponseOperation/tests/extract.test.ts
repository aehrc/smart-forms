import { extract } from '../utils';
import type { OutputParameters, ReturnParameter } from '../interfaces';
import { createInputParameters } from '../utils/createInputParameters';
import type { Bundle } from 'fhir/r4';

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

// QuestionnaireResponses
import { QRAllergiesAdverseReactions } from './resources/questionnaireResponses/QRAllergiesAdverseReactions';
import { QRImmunisation } from './resources/questionnaireResponses/QRImmunisation';
import { QRMedicalHistoryCurrentProblems } from './resources/questionnaireResponses/QRMedicalHistoryCurrentProblems';
import { QRRegularMedications } from './resources/questionnaireResponses/QRRegularMedications';

// Questionnaires
import { QAllergiesAdverseReactions } from './resources/questionnaires/QAllergiesAdverseReactions';
import { QImmunisation } from './resources/questionnaires/QImmunisation';
import { QMedicalHistoryCurrentProblems } from './resources/questionnaires/QMedicalHistoryCurrentProblems';
import { QRegularMedications } from './resources/questionnaires/QRegularMedications';

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
    const bundle = returnParam?.resource as Bundle;
    const extracted = extractedAllergiesAdverseReactions;
    expect(bundle.entry?.[0]?.resource).toEqual(extracted?.entry?.[0]?.resource);
    expect(bundle.entry?.[1]?.resource).toEqual(extracted?.entry?.[1]?.resource);
    expect(bundle.entry?.[2]?.resource).toEqual(extracted?.entry?.[2]?.resource);
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
    const bundle = returnParam?.resource as Bundle;
    const extracted = extractedImmunisation;
    expect(bundle.entry?.[0]?.resource).toEqual(extracted?.entry?.[0]?.resource);
    expect(bundle.entry?.[1]?.resource).toEqual(extracted?.entry?.[1]?.resource);
    expect(bundle.entry?.[2]?.resource).toEqual(extracted?.entry?.[2]?.resource);
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
    const bundle = returnParam?.resource as Bundle;
    const expected = extractedRegularMedications;
    expect(stripDateAsserted(bundle.entry?.[0]?.resource)).toEqual(
      stripDateAsserted(expected?.entry?.[0]?.resource)
    );
    expect(stripDateAsserted(bundle.entry?.[1]?.resource)).toEqual(
      stripDateAsserted(expected?.entry?.[1]?.resource)
    );
  });
});

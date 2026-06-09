import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import type { Bundle, Patient, QuestionnaireResponse } from 'fhir/r4';
import { patRepop } from '../../test-data-shared/patRepop';
import { bundleObsBodyHeight } from '../../test-data-shared/CalculatedExpressionBMICalculatorPrepop/bundleObsBodyHeight';
import { bundleObsBodyWeight } from '../../test-data-shared/CalculatedExpressionBMICalculatorPrepop/bundleObsBodyWeight';
import { QRCalculatedExpressionBMICalculatorPrepop } from '../../test-data-shared/CalculatedExpressionBMICalculatorPrepop/QRCalculatedExpressionBMICalculatorPrepop';
import { Base64 } from 'js-base64';
import type { InputParameters, OutputParameters } from '../interfaces';
import { populate } from '../utils';
import { createFhirPathContext } from '../utils/createFhirPathContext';
import { inputParamsCalculatedExpressionBMICalculatorPrepop } from '../../test-data-shared/CalculatedExpressionBMICalculatorPrepop/inputParamsCalculatedExpressionBMICalculatorPrepop';
import { FhirPathContextAboriginalTorresStraitIslanderHealthCheck } from '../../test-data-shared/AboriginalTorresStraitIslanderHealthCheck/fhirPathContextAboriginalTorresStraitIslanderHealthCheck';
import { inputParamsAboriginalTorresStraitIslanderHealthCheck } from '../../test-data-shared/AboriginalTorresStraitIslanderHealthCheck/inputParamsAboriginalTorresStraitIslanderHealthCheck';
import { QRAboriginalTorresStraitIslanderHealthCheck } from '../../test-data-shared/AboriginalTorresStraitIslanderHealthCheck/QRAboriginalTorresStraitIslanderHealthCheck';
import { resolveLookupPromises } from '../utils/resolveLookupPromises';
import { resolvedLookupAboriginalTorresStraitIslanderHealthCheck } from '../../test-data-shared/AboriginalTorresStraitIslanderHealthCheck/resolvedLookupAboriginalTorresStraitIslanderHealthCheck';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4/index.js';
import { stampFhirpathMetadata } from '../utils/evaluateExpressions';

// Prepares a fhirpath context for use in tests by stamping __path__ on all resource arrays.
// Uses the same stampFhirpathMetadata helper used in production code.
function prepareContextForFhirpathV4(ctx: Record<string, any>): Record<string, any> {
  const prepared = { ...ctx };
  for (const [key, value] of Object.entries(prepared)) {
    if (Array.isArray(value) && value.some((i: any) => i?.resourceType)) {
      prepared[key] = value.map(stampFhirpathMetadata);
    }
  }
  return prepared;
}

// Mock createFhirPathContext function
jest.mock('../utils/createFhirPathContext', () => {
  const actual = jest.requireActual('../utils/createFhirPathContext');
  return {
    ...(actual as object),
    createFhirPathContext: jest.fn() // only createReferenceContextTuple is mocked
  };
});

// Mock resolveLookupPromises function
jest.mock('../utils/resolveLookupPromises');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFetchResourceCallback = jest.fn() as any;
const mockFetchResourceCallbackConfig = {
  sourceServerUrl: 'https://example.com/fhir'
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTerminologyCallback = jest.fn() as any;
const mockTerminologyCallbackConfig = {
  terminologyServerUrl: 'https://example.com/terminology/fhir'
};

// Launch context resources
const mockPatient: Patient = patRepop;

const SDC_INITIAL_EXPR =
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression';
const SDC_ITEM_POP_CTX =
  'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext';

// Minimal questionnaire with a repeat group whose children use toString() on a context variable.
// This pattern previously caused false-positive issues when 2+ resources were in the collection.
const qRepeatGroupWithToString = {
  resourceType: 'Questionnaire',
  id: 'repeat-group-tostring-test',
  status: 'active',
  item: [
    {
      linkId: 'conditions-group',
      type: 'group',
      repeats: true,
      extension: [
        {
          url: SDC_ITEM_POP_CTX,
          valueExpression: {
            name: 'ConditionRepeat',
            language: 'text/fhirpath',
            expression: '%ConditionInput.entry.resource'
          }
        }
      ],
      item: [
        {
          linkId: 'condition-onset',
          type: 'date',
          extension: [
            {
              url: SDC_INITIAL_EXPR,
              valueExpression: {
                language: 'text/fhirpath',
                expression:
                  '%ConditionRepeat.onset.ofType(dateTime).toString().substring(0,10).toDate()'
              }
            }
          ]
        }
      ]
    }
  ]
};

describe('populate', () => {
  beforeAll(() => {
    jest.useFakeTimers(); // or 'legacy' depending on your Jest version
    jest.setSystemTime(new Date('2025-08-07T07:38:03.107Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('Populate CalculatedExpressionBMICalculatorPrepop', async () => {
    // Pre-pop resources
    const mockObsBodyHeight: Bundle = bundleObsBodyHeight;
    const mockObsBodyWeight: Bundle = bundleObsBodyWeight;

    // Input parameters
    const inputParameters: InputParameters = inputParamsCalculatedExpressionBMICalculatorPrepop;

    // Outputs
    const mockResponse: QuestionnaireResponse = QRCalculatedExpressionBMICalculatorPrepop;
    const mockContext = {
      resource: {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      },
      rootResource: {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress'
      },
      patient: mockPatient,
      ObsBodyHeight: mockObsBodyHeight,
      ObsBodyWeight: mockObsBodyWeight,
      height: [],
      weight: []
    };
    const mockContextBase64 = Base64.encode(JSON.stringify(mockContext));

    const mockOutputParameters: OutputParameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'response',
          resource: mockResponse
        },
        {
          name: 'contextResult-custom',
          valueAttachment: {
            contentType: 'application/json',
            data: mockContextBase64
          }
        }
      ]
    };

    (createFhirPathContext as jest.Mock).mockImplementation(async () => mockContext);

    const result = await populate(
      inputParameters,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig,
      mockTerminologyCallback,
      mockTerminologyCallbackConfig
    );

    const resultAsOutputParameters = result as OutputParameters;
    expect(resultAsOutputParameters.resourceType).toBe('Parameters');
    expect(resultAsOutputParameters).toStrictEqual(mockOutputParameters);
  });

  it('Populate AboriginalTorresStraitIslanderHealthCheck', async () => {
    // Input parameters
    const inputParameters: InputParameters = inputParamsAboriginalTorresStraitIslanderHealthCheck;

    // Outputs
    const mockResponse: QuestionnaireResponse = QRAboriginalTorresStraitIslanderHealthCheck;
    const mockContext: Record<string, any> = prepareContextForFhirpathV4(
      FhirPathContextAboriginalTorresStraitIslanderHealthCheck
    );

    (createFhirPathContext as jest.Mock).mockImplementation(async () => mockContext);
    (resolveLookupPromises as jest.Mock).mockImplementation(
      async () => resolvedLookupAboriginalTorresStraitIslanderHealthCheck
    );

    const result = await populate(
      inputParameters,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig,
      mockTerminologyCallback,
      mockTerminologyCallbackConfig
    );

    const resultAsOutputParameters = result as OutputParameters;
    expect(resultAsOutputParameters.resourceType).toBe('Parameters');

    const resultResponse = resultAsOutputParameters.parameter.find(
      (param) => param.name === 'response'
    )?.resource as QuestionnaireResponse;
    expect(resultResponse).toStrictEqual(mockResponse);

    const resultContext = resultAsOutputParameters.parameter.find(
      (param) => param.name === 'contextResult-custom'
    )?.valueAttachment?.data as string;
    const decodedResultContext = JSON.parse(Base64.decode(resultContext));
    expect(decodedResultContext).toStrictEqual(mockContext);
  });
});

describe('populate - fhirpath v4 __path__ requirement for nested BackboneElements', () => {
  /**
   * Reproduces the regression seen in aboriginalFormPopulation.test.tsx where
   * AllergyIntolerance.reaction.manifestation.select(...) returns empty even though the
   * data is present.
   *
   * Root cause: fhirpath v4 requires __path__ to be stamped on context variable items.
   * Resources fetched via fetchResourceCallback arrive as plain JSON (no __path__).
   * When fhirpath evaluates itemPopulationContext it returns top-level resources with __path__,
   * but nested BackboneElements (reaction[]) inside those resources still lack __path__.
   * Navigating through reaction.manifestation inside select() then silently returns empty.
   *
   * The fix is to stamp __path__ on every resource BEFORE it is used as a context variable.
   */
  it('reaction.manifestation.select() throws for a plain resource (no __path__)', () => {
    const allergyPlain = {
      resourceType: 'AllergyIntolerance',
      id: 'allergy-plain',
      reaction: [
        {
          manifestation: [
            {
              coding: [{ system: 'http://snomed.info/sct', code: '271807003', display: 'Rash' }]
            }
          ]
        }
      ]
    };

    // Without __path__, fhirpath v4 throws when navigating nested BackboneElements.
    // In constructRepeatGroupInstances this error is caught silently → field stays empty.
    expect(() =>
      fhirpath.evaluate(
        {},
        "%allergy.reaction.manifestation.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text).first())",
        { allergy: [allergyPlain] },
        fhirpath_r4_model
      )
    ).toThrow();
  });

  it('reaction.manifestation.select() returns Rash after __path__ is stamped via $this', () => {
    const allergyPlain = {
      resourceType: 'AllergyIntolerance',
      id: 'allergy-stamped',
      reaction: [
        {
          manifestation: [
            {
              coding: [{ system: 'http://snomed.info/sct', code: '271807003', display: 'Rash' }]
            }
          ]
        }
      ]
    };

    // Stamp __path__ by running through fhirpath.evaluate with $this
    const stamped = (fhirpath.evaluate(allergyPlain, '$this', {}, fhirpath_r4_model) as any[])[0];

    const result = fhirpath.evaluate(
      {},
      "%allergy.reaction.manifestation.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text).first())",
      { allergy: [stamped] },
      fhirpath_r4_model
    );

    // With __path__ stamped, the nested navigation works correctly
    expect(result).toHaveLength(1);
    expect((result[0] as any).display).toBe('Rash');
  });
});

describe('populate - repeat group with toString()', () => {
  it('should populate 2 repeat instances without issues when 2 resources are in the collection', async () => {
    const mockContext = {
      resource: { resourceType: 'QuestionnaireResponse', status: 'in-progress' },
      rootResource: { resourceType: 'QuestionnaireResponse', status: 'in-progress' },
      patient: { resourceType: 'Patient', id: 'test-patient' },
      ConditionInput: {
        resourceType: 'Bundle',
        type: 'searchset',
        entry: [
          { resource: { resourceType: 'Condition', id: 'cond-1', onsetDateTime: '2023-06-15' } },
          { resource: { resourceType: 'Condition', id: 'cond-2', onsetDateTime: '2022-03-20' } }
        ]
      }
    };

    (createFhirPathContext as jest.Mock).mockImplementation(async () => mockContext);
    (resolveLookupPromises as jest.Mock).mockImplementation(async () => ({}));

    const inputParameters: InputParameters = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'questionnaire', resource: qRepeatGroupWithToString as any },
        { name: 'subject', valueReference: { type: 'Patient', reference: 'Patient/test-patient' } }
      ]
    };

    const result = await populate(
      inputParameters,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig,
      mockTerminologyCallback,
      mockTerminologyCallbackConfig
    );

    const resultAsOutputParameters = result as OutputParameters;
    expect(resultAsOutputParameters.resourceType).toBe('Parameters');

    // No issues should be reported — before the fix, toString() on a multi-item collection
    // triggered a false-positive OperationOutcomeIssue warning
    const issuesParam = resultAsOutputParameters.parameter.find((p) => p.name === 'issues');
    expect(issuesParam).toBeUndefined();

    // Both conditions should appear as separate repeat group instances
    const response = resultAsOutputParameters.parameter.find((p) => p.name === 'response')
      ?.resource as QuestionnaireResponse;
    expect(response).toBeDefined();

    const repeatInstances = response.item?.filter((item) => item.linkId === 'conditions-group');
    expect(repeatInstances).toHaveLength(2);

    for (const instance of repeatInstances!) {
      const onsetItem = instance.item?.find((item) => item.linkId === 'condition-onset');
      expect(onsetItem).toBeDefined();
      expect(onsetItem?.answer?.length).toBeGreaterThan(0);
    }
  });
});

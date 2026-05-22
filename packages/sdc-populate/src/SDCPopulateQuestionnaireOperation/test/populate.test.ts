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

// fhirpath v4 requires array context variable items to have __path__ (attached non-enumerably
// when objects pass through fhirpath.evaluate). Plain static TS objects lack this, so we
// run each FHIR resource item through fhirpath's $this to stamp __path__ onto it.
function prepareContextForFhirpathV4(ctx: Record<string, any>): Record<string, any> {
  const prepared = { ...ctx };
  for (const [key, value] of Object.entries(prepared)) {
    if (Array.isArray(value) && value.some((i) => i?.resourceType)) {
      prepared[key] = value.map((item) => {
        if (!item?.resourceType) return item;
        const result = fhirpath.evaluate(item, '$this', {}, fhirpath_r4_model) as any[];
        return result[0] ?? item;
      });
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

import { describe } from '@jest/globals';
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

// Mock createFhirPathContext function
jest.mock('../utils/createFhirPathContext', () => {
  const actual = jest.requireActual('../utils/createFhirPathContext');
  return {
    ...actual,
    createFhirPathContext: jest.fn() // only createReferenceContextTuple is mocked
  };
});

// Mock resolveLookupPromises function
jest.mock('../utils/resolveLookupPromises');

const mockFetchResourceCallback = jest.fn();
const mockFetchResourceCallbackConfig = {
  sourceServerUrl: 'https://example.com/fhir'
};

const mockTerminologyCallback = jest.fn();
const mockTerminologyCallbackConfig = {
  terminologyServerUrl: 'https://example.com/terminology/fhir'
};

// Launch context resources
const mockPatient: Patient = patRepop;

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
    const mockContext: Record<string, any> =
      FhirPathContextAboriginalTorresStraitIslanderHealthCheck;

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
    ).valueAttachment.data as string;
    const decodedResultContext = JSON.parse(Base64.decode(resultContext));
    expect(decodedResultContext).toStrictEqual(mockContext);
  });
});

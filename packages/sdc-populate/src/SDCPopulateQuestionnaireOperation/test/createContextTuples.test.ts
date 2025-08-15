import { expect } from '@jest/globals';
import {
  createReferenceContextTuple,
  createResourceContextTuple
} from '../utils/createContextTuples';
import type { ReferenceContext, ResourceContext } from '../interfaces/inputParameters.interface';
import { createInvalidWarningIssue } from '../utils/operationOutcome';
import { ReferencedContextsTestFhirContext } from './resources/ReferencedContextsTestFhirContext';
import { ContainedBatchContextsTestFhirContext } from './resources/ContainedBatchContextsTestFhirContext';
import type { BundleEntry } from 'fhir/r4';

const mockFetchResourceCallback = jest.fn();
const mockFetchResourceCallbackConfig = {
  sourceServerUrl: 'https://example.com/fhir'
};

const referenceContexts: ReferenceContext[] = ReferencedContextsTestFhirContext;

const containedBatchContexts: ResourceContext[] = ContainedBatchContextsTestFhirContext;

describe('createReferenceContextTuple', () => {
  it('should return a fetch promise when query is present', () => {
    const referenceContext = referenceContexts[0];
    const expectedQuery = referenceContext.part[1].valueReference.reference;

    const [context, , result] = createReferenceContextTuple(
      referenceContext,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig
    );

    expect(context).toBe(referenceContext);
    expect(result).toBeNull();
    expect(mockFetchResourceCallback).toHaveBeenCalledWith(
      expectedQuery,
      mockFetchResourceCallbackConfig
    );
  });

  it('should return warning when reference is missing', async () => {
    const brokenReferenceContext: ReferenceContext = {
      name: 'context',
      part: [
        { name: 'name', valueString: 'BrokenRef' },
        {
          name: 'content',
          valueReference: {} // missing reference field
        }
      ]
    };

    const [context, promise, result] = createReferenceContextTuple(
      brokenReferenceContext,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig
    );

    expect(context).toBe(brokenReferenceContext);
    expect(result).toBeNull();

    const resolved = await promise;
    expect(resolved).toEqual(
      createInvalidWarningIssue('Reference Context BrokenRef does not contain a reference')
    );
  });
});

describe('createResourceContextTuple', () => {
  it('should return warning if bundleEntry has no request', async () => {
    const resourceContext = containedBatchContexts[0];
    const bundleEntry = {
      fullUrl: 'urn:uuid:test'
    };

    const [context, promise, result] = createResourceContextTuple(
      resourceContext,
      bundleEntry,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig
    );

    expect(context).toEqual(resourceContext);
    expect(result).toBeNull();

    const resolved = await promise;
    expect(resolved).toEqual(
      createInvalidWarningIssue('PrePopQuery bundle entry urn:uuid:test does not contain a request')
    );
  });

  it('should call fetchResourceCallback with query if request is present', () => {
    const resourceContext = containedBatchContexts[0];
    const bundleEntry: BundleEntry = {
      request: { url: 'AllergyIntolerance?patient=123', method: 'GET' }
    };

    const [context, , result] = createResourceContextTuple(
      resourceContext,
      bundleEntry,
      mockFetchResourceCallback,
      mockFetchResourceCallbackConfig
    );

    expect(context).toEqual(resourceContext);
    expect(result).toBeNull();
    expect(mockFetchResourceCallback).toHaveBeenCalledWith(
      'AllergyIntolerance?patient=123',
      mockFetchResourceCallbackConfig
    );
  });
});

/*
 * Copyright 2026 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference types="jest" />
import { validateExtractedBundle } from '../features/writeBack/utils/validateExtractedBundle';
import type { Bundle, BundleEntry, FhirResource, OperationOutcome, Parameters } from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';

function makeClient(requestFn: (opts: unknown) => Promise<unknown>): Client {
  return { request: requestFn } as unknown as Client;
}

type TestBundleEntry = Omit<BundleEntry, 'resource'> & { resource?: unknown };

function makeBundle(entries: TestBundleEntry[]): Bundle {
  return { resourceType: 'Bundle', type: 'transaction', entry: entries as Bundle['entry'] };
}

const errorOutcome: OperationOutcome = {
  resourceType: 'OperationOutcome',
  issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Missing required field' }]
};

const warningOutcome: OperationOutcome = {
  resourceType: 'OperationOutcome',
  issue: [{ severity: 'warning', code: 'incomplete', diagnostics: 'Recommended field missing' }]
};

const okOutcome: OperationOutcome = {
  resourceType: 'OperationOutcome',
  issue: [{ severity: 'information', code: 'informational', diagnostics: 'All OK' }]
};

describe('validateExtractedBundle', () => {
  it('returns empty map for bundle with no entries', async () => {
    const client = makeClient(jest.fn());
    const result = await validateExtractedBundle(makeBundle([]), client);
    expect(result.size).toBe(0);
  });

  it('returns empty map for bundle with undefined entries', async () => {
    const client = makeClient(jest.fn());
    const result = await validateExtractedBundle(
      { resourceType: 'Bundle', type: 'transaction' },
      client
    );
    expect(result.size).toBe(0);
  });

  it('skips entries with no resource', async () => {
    const requestFn = jest.fn();
    const client = makeClient(requestFn);
    const bundle = makeBundle([{ request: { method: 'POST', url: 'Condition' } }]);
    await validateExtractedBundle(bundle, client);
    expect(requestFn).not.toHaveBeenCalled();
  });

  it('skips entries with no request', async () => {
    const requestFn = jest.fn();
    const client = makeClient(requestFn);
    const bundle = makeBundle([{ resource: { resourceType: 'Condition' } }]);
    await validateExtractedBundle(bundle, client);
    expect(requestFn).not.toHaveBeenCalled();
  });

  it('wraps all entries in a $validate Parameters envelope', async () => {
    const requestFn = jest.fn().mockResolvedValue(okOutcome);
    const client = makeClient(requestFn);
    const resource = { resourceType: 'Condition', subject: { reference: 'Patient/1' } };
    const bundle = makeBundle([
      {
        resource: resource as unknown as FhirResource,
        request: { method: 'POST', url: 'Condition' }
      }
    ]);
    await validateExtractedBundle(bundle, client);
    const sentBody = JSON.parse(requestFn.mock.calls[0][0].body);
    expect(sentBody.resourceType).toBe('Parameters');
    expect(sentBody.parameter[0].name).toBe('resource');
    expect(sentBody.parameter[0].resource).toEqual(resource);
  });

  it('wraps FHIRPatch (Parameters) entries in a $validate Parameters envelope', async () => {
    const requestFn = jest.fn().mockResolvedValue(okOutcome);
    const client = makeClient(requestFn);
    const patchResource: Parameters = {
      resourceType: 'Parameters',
      parameter: [
        {
          name: 'operation',
          part: [
            { name: 'type', valueCode: 'add' },
            { name: 'path', valueString: 'Condition' },
            { name: 'value', resource: { resourceType: 'Condition' } as unknown as FhirResource }
          ]
        }
      ]
    };
    const bundle = makeBundle([
      { resource: patchResource, request: { method: 'PATCH', url: 'Condition/123' } }
    ]);
    await validateExtractedBundle(bundle, client);
    const sentBody = JSON.parse(requestFn.mock.calls[0][0].body);
    expect(sentBody.resourceType).toBe('Parameters');
    expect(sentBody.parameter[0].name).toBe('resource');
    expect(sentBody.parameter[0].resource).toEqual(patchResource);
  });

  it('treats server not supporting $validate as valid (catch)', async () => {
    const client = makeClient(jest.fn().mockRejectedValue(new Error('Not supported')));
    const bundle = makeBundle([
      { resource: { resourceType: 'Condition' }, request: { method: 'POST', url: 'Condition' } }
    ]);
    const result = await validateExtractedBundle(bundle, client);
    expect(result.size).toBe(0);
  });

  it('returns entry in map when $validate returns OperationOutcome with errors', async () => {
    const client = makeClient(jest.fn().mockResolvedValue(errorOutcome));
    const bundle = makeBundle([
      { resource: { resourceType: 'Condition' }, request: { method: 'POST', url: 'Condition' } }
    ]);
    const result = await validateExtractedBundle(bundle, client);
    expect(result.size).toBe(1);
    expect(result.has(0)).toBe(true);
  });

  it('does not include entry when $validate returns only warnings', async () => {
    const client = makeClient(jest.fn().mockResolvedValue(warningOutcome));
    const bundle = makeBundle([
      { resource: { resourceType: 'Condition' }, request: { method: 'POST', url: 'Condition' } }
    ]);
    const result = await validateExtractedBundle(bundle, client);
    expect(result.size).toBe(0);
  });

  it('does not include entry when $validate returns informational outcome', async () => {
    const client = makeClient(jest.fn().mockResolvedValue(okOutcome));
    const bundle = makeBundle([
      { resource: { resourceType: 'Condition' }, request: { method: 'POST', url: 'Condition' } }
    ]);
    const result = await validateExtractedBundle(bundle, client);
    expect(result.size).toBe(0);
  });

  it('returns correct index for second entry when first is valid', async () => {
    const requestFn = jest
      .fn()
      .mockResolvedValueOnce(okOutcome)
      .mockResolvedValueOnce(errorOutcome);
    const client = makeClient(requestFn);
    const bundle = makeBundle([
      { resource: { resourceType: 'Condition' }, request: { method: 'POST', url: 'Condition' } },
      {
        resource: { resourceType: 'MedicationStatement' },
        request: { method: 'POST', url: 'MedicationStatement' }
      }
    ]);
    const result = await validateExtractedBundle(bundle, client);
    expect(result.size).toBe(1);
    expect(result.has(0)).toBe(false);
    expect(result.has(1)).toBe(true);
  });

  it('validates entries in parallel — all requests fired before any resolves', async () => {
    const callOrder: number[] = [];
    const requestFn = jest.fn().mockImplementation(({ url }: { url: string }) => {
      const index = url.includes('Condition') ? 0 : 1;
      callOrder.push(index);
      return Promise.resolve(okOutcome);
    });
    const client = makeClient(requestFn);
    const bundle = makeBundle([
      { resource: { resourceType: 'Condition' }, request: { method: 'POST', url: 'Condition' } },
      {
        resource: { resourceType: 'MedicationStatement' },
        request: { method: 'POST', url: 'MedicationStatement' }
      }
    ]);
    await validateExtractedBundle(bundle, client);
    expect(requestFn).toHaveBeenCalledTimes(2);
  });

  it('handles mixed valid and invalid entries across multiple resources', async () => {
    const requestFn = jest
      .fn()
      .mockResolvedValueOnce(okOutcome)
      .mockResolvedValueOnce(errorOutcome)
      .mockResolvedValueOnce(errorOutcome);
    const client = makeClient(requestFn);
    const bundle = makeBundle([
      { resource: { resourceType: 'Condition' }, request: { method: 'POST', url: 'Condition' } },
      {
        resource: { resourceType: 'MedicationStatement' },
        request: { method: 'POST', url: 'MedicationStatement' }
      },
      { resource: { resourceType: 'Observation' }, request: { method: 'POST', url: 'Observation' } }
    ]);
    const result = await validateExtractedBundle(bundle, client);
    expect(result.size).toBe(2);
    expect(result.has(1)).toBe(true);
    expect(result.has(2)).toBe(true);
  });
});

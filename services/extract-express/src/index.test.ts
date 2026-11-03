/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import http from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApp } from './index';
import { allOutboundBases, loadConfig } from './config';
import type { ExtractConfig } from './config';

const EXTRACT_PATH = '/fhir/QuestionnaireResponse/$extract';
const CONVERT_PATH = '/fhir/StructureMap/$convert';
const FORGED_HEADERS = {
  Host: 'evil.example',
  'X-Forwarded-Proto': 'http',
  'X-Forwarded-Host': 'evil.example'
};
const FULL_ENV = {
  EHR_SERVER_URL: 'http://ehr.test/fhir',
  EHR_SERVER_AUTH_TOKEN: 'ehr-token',
  FORMS_SERVER_URL: 'https://forms.test/api/fhir'
};

const questionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  status: 'completed',
  questionnaire: 'http://example.org/Questionnaire/extract-test|1.0.0'
};

const questionnaire = {
  resourceType: 'Questionnaire',
  id: 'extract-test',
  status: 'active',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-targetStructureMap',
      valueCanonical: 'http://example.org/StructureMap/extract-test'
    }
  ]
};

const structureMap = { resourceType: 'StructureMap', id: 'extract-test', status: 'active' };

function searchset(resource: object) {
  return { resourceType: 'Bundle', type: 'searchset', entry: [{ resource }] };
}

function jsonResponse(body: object, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/fhir+json' }
  });
}

interface TestResponse {
  status: number;
  body: any;
}

/** Sends a request with node:http so that the Host header can be forged and fetch stays mocked. */
function post(
  server: Server,
  path: string,
  payload: string,
  contentType: string,
  headers: Record<string, string> = {}
): Promise<TestResponse> {
  const { port } = server.address() as AddressInfo;
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path,
        method: 'POST',
        headers: {
          'Content-Type': contentType,
          'Content-Length': Buffer.byteLength(payload).toString(),
          ...headers
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode ?? 0, body: JSON.parse(data) }));
      }
    );
    req.on('error', reject);
    req.end(payload);
  });
}

function postExtract(server: Server, headers: Record<string, string> = {}) {
  return post(
    server,
    EXTRACT_PATH,
    JSON.stringify(questionnaireResponse),
    'application/json',
    headers
  );
}

function postConvert(server: Server, headers: Record<string, string> = {}) {
  return post(server, CONVERT_PATH, 'map "http://example.org/map" = test', 'text/plain', headers);
}

function startServer(config: ExtractConfig): Promise<Server> {
  return new Promise((resolve) => {
    const server = createApp(config).listen(0, '127.0.0.1', () => resolve(server));
  });
}

function stopServer(server: Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

function requestedUrls(fetchMock: jest.Mock): string[] {
  return fetchMock.mock.calls.map(([input]) => String(input));
}

describe('extract-express outbound requests', () => {
  const originalFetch = globalThis.fetch;
  let fetchMock: jest.Mock;
  let server: Server | null = null;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    if (server) {
      await stopServer(server);
      server = null;
    }
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('refuses $convert without EHR_SERVER_URL instead of using the Host header', async () => {
    server = await startServer(loadConfig({}));

    const res = await postConvert(server, FORGED_HEADERS);

    expect(res.status).toBe(400);
    expect(res.body.issue[0].details.text).toContain('EHR_SERVER_URL environment variable');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses $extract without EHR_SERVER_URL instead of using the Host header', async () => {
    server = await startServer(loadConfig({ FORMS_SERVER_URL: FULL_ENV.FORMS_SERVER_URL }));

    const res = await postExtract(server, FORGED_HEADERS);

    expect(res.status).toBe(400);
    expect(res.body.issue[0].details.text).toContain('EHR_SERVER_URL environment variable');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('invokes $transform for $convert on EHR_SERVER_URL, not on the Host header', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ resourceType: 'Parameters', parameter: [] }));
    server = await startServer(loadConfig(FULL_ENV));

    await postConvert(server, FORGED_HEADERS);

    expect(requestedUrls(fetchMock)).toEqual([
      'http://ehr.test/fhir/StructureMap/$transform?debug=true&_format=json'
    ]);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(init.redirect).toBe('manual');
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer ehr-token');
  });

  it('reads from FORMS_SERVER_URL and transforms on EHR_SERVER_URL for $extract', async () => {
    fetchMock.mockImplementation(async (input: URL) => {
      if (input.pathname.endsWith('/Questionnaire')) {
        return jsonResponse(searchset(questionnaire));
      }
      if (input.pathname.endsWith('/StructureMap')) {
        return jsonResponse(searchset(structureMap));
      }
      return jsonResponse({ resourceType: 'Bundle', type: 'transaction', entry: [] });
    });
    server = await startServer(loadConfig(FULL_ENV));

    const res = await postExtract(server, FORGED_HEADERS);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ resourceType: 'Bundle', type: 'transaction', entry: [] });
    expect(requestedUrls(fetchMock)).toEqual([
      'https://forms.test/api/fhir/Questionnaire?url=http://example.org/Questionnaire/extract-test&version=1.0.0&_sort=_lastUpdated',
      'https://forms.test/api/fhir/StructureMap?url=http://example.org/StructureMap/extract-test&_sort=_lastUpdated',
      'http://ehr.test/fhir/StructureMap/$transform'
    ]);
    for (const [, init] of fetchMock.mock.calls as [URL, RequestInit][]) {
      expect(init.redirect).toBe('manual');
    }
    // The EHR token is not sent to the forms server
    const formsInit = fetchMock.mock.calls[0][1] as RequestInit;
    expect((formsInit.headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('does not echo a non-JSON response body from the forms server', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html>internal admin page</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      })
    );
    server = await startServer(loadConfig(FULL_ENV));

    const res = await postExtract(server);

    expect(res.status).toBe(502);
    expect(JSON.stringify(res.body)).not.toContain('internal admin page');
    expect(res.body.issue[0].details.text).toBe(
      'Response from https://forms.test/api/fhir/Questionnaire was not valid JSON. Status: 200'
    );
  });

  it('does not follow a redirect from the EHR server', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 308, headers: { Location: 'http://evil.example/' } })
    );
    server = await startServer(loadConfig(FULL_ENV));

    const res = await postConvert(server);

    expect(res.status).toBe(502);
    expect(res.body.issue[0].details.text).toContain('which is not followed');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('loadConfig', () => {
  it('treats unset and blank values as not configured', () => {
    const config = loadConfig({ EHR_SERVER_URL: '', FORMS_SERVER_URL: '' });
    expect(config).toEqual({ ehrServer: null, formsServer: null });
    expect(allOutboundBases(config)).toEqual([]);
  });

  it('reads both servers and their auth tokens', () => {
    const config = loadConfig({ ...FULL_ENV, FORMS_SERVER_AUTH_TOKEN: 'forms-token' });
    expect(config.ehrServer).toEqual({
      url: new URL('http://ehr.test/fhir/'),
      authToken: 'ehr-token'
    });
    expect(config.formsServer).toEqual({
      url: new URL('https://forms.test/api/fhir/'),
      authToken: 'forms-token'
    });
    expect(allOutboundBases(config).map((url) => url.href)).toEqual([
      'http://ehr.test/fhir/',
      'https://forms.test/api/fhir/'
    ]);
  });

  it('fails on a malformed server URL', () => {
    expect(() => loadConfig({ EHR_SERVER_URL: 'ftp://ehr.test/fhir' })).toThrow(
      'EHR_SERVER_URL must use http or https'
    );
  });
});

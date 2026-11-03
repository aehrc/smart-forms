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
import type { Questionnaire } from 'fhir/r4';
import { createApp } from './index';
import { allOutboundBases, loadConfig } from './config';
import type { AssembleConfig } from './config';

const ASSEMBLE_PATH = '/fhir/Questionnaire/$assemble';
const FORGED_HEADERS = {
  Host: 'evil.example',
  'X-Forwarded-Proto': 'http',
  'X-Forwarded-Host': 'evil.example'
};
const SUBQUESTIONNAIRE_CANONICAL = 'http://example.org/Questionnaire/child|1.0.0';

function rootQuestionnaire(subquestionnaireCanonical: string): Questionnaire {
  return {
    resourceType: 'Questionnaire',
    id: 'root',
    status: 'active',
    url: 'http://example.org/Questionnaire/root',
    version: '1.0.0',
    extension: [
      {
        url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation',
        valueCode: 'assemble-root'
      }
    ],
    item: [
      {
        linkId: 'container',
        type: 'group',
        item: [
          {
            linkId: 'child-placeholder',
            type: 'display',
            text: 'Unable to load subquestionnaire',
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-subQuestionnaire',
                valueCanonical: subquestionnaireCanonical
              }
            ]
          }
        ]
      }
    ]
  };
}

const childQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'child',
  status: 'active',
  url: 'http://example.org/Questionnaire/child',
  version: '1.0.0',
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation',
      valueCode: 'assemble-child'
    }
  ],
  item: [{ linkId: 'child-question', type: 'string', text: 'Child question' }]
};

interface TestResponse {
  status: number;
  body: any;
}

/** Sends a request with node:http so that the Host header can be forged and fetch stays mocked. */
function postJson(
  server: Server,
  body: object,
  headers: Record<string, string> = {}
): Promise<TestResponse> {
  const { port } = server.address() as AddressInfo;
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path: ASSEMBLE_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

function startServer(config: AssembleConfig): Promise<Server> {
  return new Promise((resolve) => {
    const server = createApp(config).listen(0, '127.0.0.1', () => resolve(server));
  });
}

function stopServer(server: Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

function allIssueText(body: any): string {
  const outcome =
    body.resourceType === 'OperationOutcome'
      ? body
      : body.parameter?.find((p: any) => p.name === 'outcome')?.resource;
  return (outcome?.issue ?? []).map((issue: any) => issue.details?.text ?? '').join('\n');
}

describe('assemble-express outbound requests', () => {
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

  it('ignores a forged Host header when FORMS_SERVER_URL is not set', async () => {
    server = await startServer(loadConfig({}));

    const res = await postJson(
      server,
      rootQuestionnaire(SUBQUESTIONNAIRE_CANONICAL),
      FORGED_HEADERS
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(allIssueText(res.body)).toContain('FORMS_SERVER_URL is not configured');
    expect(allIssueText(res.body)).not.toContain('evil.example');
  });

  it('fetches subquestionnaires from FORMS_SERVER_URL, not from the Host header', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          resourceType: 'Bundle',
          type: 'searchset',
          entry: [{ resource: childQuestionnaire }]
        }),
        { status: 200, headers: { 'Content-Type': 'application/fhir+json' } }
      )
    );
    server = await startServer(
      loadConfig({ FORMS_SERVER_URL: 'http://forms.test/fhir', FORMS_SERVER_AUTH_TOKEN: 'token' })
    );

    const res = await postJson(
      server,
      rootQuestionnaire(SUBQUESTIONNAIRE_CANONICAL),
      FORGED_HEADERS
    );

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [input, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(input.href).toBe(
      'http://forms.test/fhir/Questionnaire?url=http://example.org/Questionnaire/child&version=1.0.0'
    );
    expect(init.redirect).toBe('manual');
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer token');
    expect(JSON.stringify(res.body)).toContain('child-question');
  });

  it('does not echo a non-JSON response body from the forms server', async () => {
    fetchMock.mockResolvedValue(
      new Response('<html>internal admin page</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      })
    );
    server = await startServer(loadConfig({ FORMS_SERVER_URL: 'http://forms.test/fhir' }));

    const res = await postJson(server, rootQuestionnaire(SUBQUESTIONNAIRE_CANONICAL));

    expect(JSON.stringify(res.body)).not.toContain('internal admin page');
    expect(allIssueText(res.body)).toContain('was not valid JSON. Status: 200');
  });

  it('does not follow a redirect from the forms server', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 301, headers: { Location: 'http://evil.example/' } })
    );
    server = await startServer(loadConfig({ FORMS_SERVER_URL: 'http://forms.test/fhir' }));

    const res = await postJson(server, rootQuestionnaire(SUBQUESTIONNAIRE_CANONICAL));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(allIssueText(res.body)).toContain('which is not followed');
  });
});

describe('loadConfig', () => {
  it('treats an unset or blank FORMS_SERVER_URL as not configured', () => {
    expect(loadConfig({}).formsServer).toBeNull();
    expect(loadConfig({ FORMS_SERVER_URL: '' }).formsServer).toBeNull();
    expect(allOutboundBases(loadConfig({}))).toEqual([]);
  });

  it('reads FORMS_SERVER_URL and its auth token', () => {
    const config = loadConfig({
      FORMS_SERVER_URL: 'https://smartforms.example/api/fhir',
      FORMS_SERVER_AUTH_TOKEN: 'token'
    });
    expect(config.formsServer).toEqual({
      url: new URL('https://smartforms.example/api/fhir/'),
      authToken: 'token'
    });
  });

  it('fails on a malformed FORMS_SERVER_URL', () => {
    expect(() => loadConfig({ FORMS_SERVER_URL: 'https://user@forms.example/fhir' })).toThrow(
      'FORMS_SERVER_URL must not contain credentials'
    );
  });
});

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

import { readFileSync } from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import type { Server } from 'node:http';
import type { Questionnaire } from 'fhir/r4';
import { createApp } from './index';
import { allOutboundBases, DEFAULT_TERMINOLOGY_SERVER_URL, loadConfig } from './config';
import type { PopulateConfig } from './config';
import { installOutboundFetchGuard } from './outboundUrl';

const POPULATE_PATH = '/fhir/Questionnaire/$populate';
const FORGED_HEADERS = {
  Host: 'evil.example',
  'X-Forwarded-Proto': 'http',
  'X-Forwarded-Host': 'evil.example'
};

const launchContextExtension = {
  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
  extension: [
    {
      url: 'name',
      valueCoding: {
        system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
        code: 'patient'
      }
    },
    { url: 'type', valueCode: 'Patient' }
  ]
};

function initialExpression(expression: string) {
  return [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
      valueExpression: { language: 'text/fhirpath', expression }
    }
  ];
}

const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'unit-test',
  status: 'active',
  url: 'http://example.org/Questionnaire/unit-test',
  extension: [launchContextExtension],
  item: [
    {
      linkId: 'given',
      type: 'string',
      text: 'Given name',
      extension: initialExpression('%patient.name.first().given.first()')
    }
  ]
};

const patient = {
  resourceType: 'Patient',
  id: 'pat-1',
  name: [{ given: ['Alex'], family: 'Test' }]
};

function parametersWithQuestionnaireRef(reference: string) {
  return {
    resourceType: 'Parameters',
    parameter: [
      { name: 'questionnaireRef', valueReference: { reference } },
      { name: 'subject', valueReference: { reference: 'Patient/pat-1' } },
      {
        name: 'context',
        part: [
          { name: 'name', valueString: 'patient' },
          { name: 'content', resource: patient }
        ]
      }
    ]
  };
}

function parametersWithQuestionnaire(q: Questionnaire, patientContext: object) {
  return {
    resourceType: 'Parameters',
    parameter: [
      { name: 'questionnaire', resource: q },
      { name: 'subject', valueReference: { reference: 'Patient/pat-1' } },
      { name: 'context', part: [{ name: 'name', valueString: 'patient' }, patientContext] }
    ]
  };
}

function configFrom(env: Record<string, string>): PopulateConfig {
  return loadConfig(env);
}

function fhirJsonResponse(body: object, status = 200): Response {
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
        path: POPULATE_PATH,
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

function startServer(config: PopulateConfig): Promise<Server> {
  return new Promise((resolve) => {
    const server = createApp(config).listen(0, '127.0.0.1', () => resolve(server));
  });
}

function stopServer(server: Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

function requestedUrls(fetchMock: jest.Mock): string[] {
  return fetchMock.mock.calls.map(([input]) =>
    String(input instanceof Request ? input.url : input)
  );
}

function answersOf(body: any): Record<string, unknown> {
  const response = body.parameter.find((p: any) => p.name === 'response').resource;
  return Object.fromEntries(
    (response.item ?? []).map((item: any) => [item.linkId, item.answer?.[0]])
  );
}

describe('populate-express outbound requests', () => {
  const originalFetch = globalThis.fetch;
  let fetchMock: jest.Mock;
  let server: Server | null = null;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    if (server) {
      await stopServer(server);
      server = null;
    }
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('without EHR_SERVER_URL', () => {
    it('populates from a patient supplied as a context resource without any outbound request', async () => {
      server = await startServer(configFrom({}));

      const res = await postJson(
        server,
        parametersWithQuestionnaire(questionnaire, { name: 'content', resource: patient }),
        FORGED_HEADERS
      );

      expect(res.status).toBe(200);
      expect(answersOf(res.body)).toEqual({ given: { valueString: 'Alex' } });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('ignores a forged Host header and does not fetch a relative questionnaireRef', async () => {
      server = await startServer(configFrom({}));

      const res = await postJson(
        server,
        parametersWithQuestionnaireRef('Questionnaire/unit-test'),
        FORGED_HEADERS
      );

      expect(res.status).toBe(400);
      expect(res.body.resourceType).toBe('OperationOutcome');
      expect(res.body.issue[0].details.text).toContain('EHR_SERVER_URL is not configured');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('refuses an absolute questionnaireRef that is not allowlisted', async () => {
      server = await startServer(configFrom({}));

      const res = await postJson(
        server,
        parametersWithQuestionnaireRef('http://evil.example/fhir/Questionnaire/unit-test')
      );

      expect(res.status).toBe(400);
      expect(res.body.issue[0].details.text).toContain(
        'is not under EHR_SERVER_URL or ALLOWED_FETCH_ORIGINS'
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('reports a reference context as not resolvable instead of fetching it', async () => {
      server = await startServer(configFrom({}));

      const res = await postJson(
        server,
        parametersWithQuestionnaire(questionnaire, {
          name: 'content',
          valueReference: { reference: 'Patient/pat-1' }
        }),
        FORGED_HEADERS
      );

      expect(res.status).toBe(200);
      expect(fetchMock).not.toHaveBeenCalled();
      const issues = res.body.parameter.find((p: any) => p.name === 'issues').resource.issue;
      expect(
        issues.some((issue: any) =>
          issue.details.text.includes('because EHR_SERVER_URL is not configured')
        )
      ).toBe(true);
    });
  });

  describe('with EHR_SERVER_URL', () => {
    const env = {
      EHR_SERVER_URL: 'http://ehr.test/fhir',
      EHR_SERVER_AUTH_TOKEN: 'ehr-token',
      ALLOWED_FETCH_ORIGINS: 'https://forms.example/fhir'
    };

    it('fetches a relative questionnaireRef from EHR_SERVER_URL, not from the Host header', async () => {
      fetchMock.mockResolvedValue(fhirJsonResponse(questionnaire));
      server = await startServer(configFrom(env));

      const res = await postJson(
        server,
        parametersWithQuestionnaireRef('Questionnaire/unit-test'),
        FORGED_HEADERS
      );

      expect(res.status).toBe(200);
      expect(answersOf(res.body)).toEqual({ given: { valueString: 'Alex' } });
      expect(requestedUrls(fetchMock)).toEqual(['http://ehr.test/fhir/Questionnaire/unit-test']);
      const init = fetchMock.mock.calls[0][1] as RequestInit;
      expect(init.redirect).toBe('manual');
      expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer ehr-token');
    });

    it('fetches an allowlisted absolute questionnaireRef without the EHR auth token', async () => {
      fetchMock.mockResolvedValue(fhirJsonResponse(questionnaire));
      server = await startServer(configFrom(env));

      const res = await postJson(
        server,
        parametersWithQuestionnaireRef('https://forms.example/fhir/Questionnaire/unit-test')
      );

      expect(res.status).toBe(200);
      expect(requestedUrls(fetchMock)).toEqual([
        'https://forms.example/fhir/Questionnaire/unit-test'
      ]);
      const init = fetchMock.mock.calls[0][1] as RequestInit;
      expect((init.headers as Record<string, string>)['Authorization']).toBeUndefined();
    });

    it.each([
      'http://evil.example/fhir/Questionnaire/unit-test',
      'http://ehr.test@evil.example/fhir/Questionnaire/unit-test',
      'http://ehr.test:8080/fhir/Questionnaire/unit-test',
      'https://ehr.test/fhir/Questionnaire/unit-test',
      'http://ehr.test/fhirx/Questionnaire/unit-test'
    ])('refuses the absolute questionnaireRef %s', async (reference) => {
      server = await startServer(configFrom(env));

      const res = await postJson(server, parametersWithQuestionnaireRef(reference));

      expect(res.status).toBe(400);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns a generic error instead of echoing a non-JSON response body', async () => {
      fetchMock.mockResolvedValue(
        new Response('<html>internal admin page</html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        })
      );
      server = await startServer(configFrom(env));

      const res = await postJson(server, parametersWithQuestionnaireRef('Questionnaire/unit-test'));

      expect(res.status).toBe(502);
      expect(JSON.stringify(res.body)).not.toContain('internal admin page');
      expect(res.body.issue[0].details.text).toBe(
        'Response from http://ehr.test/fhir/Questionnaire/unit-test was not valid JSON. Status: 200'
      );
    });

    it('does not follow a redirect from the EHR server', async () => {
      fetchMock.mockResolvedValue(
        new Response(null, { status: 302, headers: { Location: 'http://evil.example/' } })
      );
      server = await startServer(configFrom(env));

      const res = await postJson(server, parametersWithQuestionnaireRef('Questionnaire/unit-test'));

      expect(res.status).toBe(502);
      expect(res.body.issue[0].details.text).toContain('which is not followed');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('with the global fetch guard installed', () => {
    const resolvingQuestionnaire: Questionnaire = {
      ...questionnaire,
      item: [
        {
          linkId: 'gp',
          type: 'string',
          text: 'GP family name',
          extension: initialExpression('%patient.generalPractitioner.first().resolve().name.family')
        }
      ]
    };

    function patientWithGp(reference: string) {
      return {
        name: 'content',
        resource: { ...patient, generalPractitioner: [{ reference }] }
      };
    }

    it('blocks fhirpath resolve() of an absolute reference outside the configured servers', async () => {
      const config = configFrom({});
      installOutboundFetchGuard(allOutboundBases(config));
      server = await startServer(config);

      const res = await postJson(
        server,
        parametersWithQuestionnaire(
          resolvingQuestionnaire,
          patientWithGp('http://evil.example/fhir/Practitioner/guard-blocked')
        )
      );

      expect(res.status).toBe(200);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(answersOf(res.body)['gp']).toBeUndefined();
    });

    it('lets fhirpath resolve() reach a configured server', async () => {
      fetchMock.mockResolvedValue(
        fhirJsonResponse({ resourceType: 'Practitioner', id: 'gp', name: [{ family: 'Smith' }] })
      );
      const config = configFrom({ EHR_SERVER_URL: 'http://ehr.test/fhir' });
      installOutboundFetchGuard(allOutboundBases(config));
      server = await startServer(config);

      const res = await postJson(
        server,
        parametersWithQuestionnaire(
          resolvingQuestionnaire,
          patientWithGp('http://ehr.test/fhir/Practitioner/guard-allowed')
        )
      );

      expect(res.status).toBe(200);
      expect(requestedUrls(fetchMock)).toEqual(['http://ehr.test/fhir/Practitioner/guard-allowed']);
      expect(answersOf(res.body)['gp']).toEqual({ valueString: 'Smith' });
    });
  });
});

describe('loadConfig', () => {
  it('uses the default terminology server, without an auth token, when none is configured', () => {
    const config = loadConfig({ TERMINOLOGY_SERVER_AUTH_TOKEN: 'tx-token' });
    expect(config.ehrServer).toBeNull();
    expect(config.terminologyServer.url.href).toBe(`${DEFAULT_TERMINOLOGY_SERVER_URL}/`);
    expect(config.terminologyServer.authToken).toBeUndefined();
    expect(config.allowedFetchBases).toEqual([]);
  });

  it('treats blank values (as in example.env) as not configured', () => {
    const config = loadConfig({ EHR_SERVER_URL: '', EHR_SERVER_AUTH_TOKEN: '' });
    expect(config.ehrServer).toBeNull();
  });

  it('reads configured servers and ALLOWED_FETCH_ORIGINS', () => {
    const config = loadConfig({
      EHR_SERVER_URL: 'https://ehr.example/fhir',
      EHR_SERVER_AUTH_TOKEN: 'ehr-token',
      TERMINOLOGY_SERVER_URL: 'https://tx.example/fhir',
      TERMINOLOGY_SERVER_AUTH_TOKEN: 'tx-token',
      ALLOWED_FETCH_ORIGINS: 'https://a.example/fhir,https://b.example'
    });
    expect(config.ehrServer).toEqual({
      url: new URL('https://ehr.example/fhir/'),
      authToken: 'ehr-token'
    });
    expect(config.terminologyServer).toEqual({
      url: new URL('https://tx.example/fhir/'),
      authToken: 'tx-token'
    });
    expect(allOutboundBases(config).map((url) => url.href)).toEqual([
      'https://ehr.example/fhir/',
      'https://tx.example/fhir/',
      'https://a.example/fhir/',
      'https://b.example/'
    ]);
  });

  it('fails on a malformed server URL', () => {
    expect(() => loadConfig({ EHR_SERVER_URL: 'ehr.example/fhir' })).toThrow('EHR_SERVER_URL');
    expect(() => loadConfig({ ALLOWED_FETCH_ORIGINS: 'gopher://x' })).toThrow(
      'ALLOWED_FETCH_ORIGINS'
    );
  });

  it('matches the default terminology server in @aehrc/sdc-populate', () => {
    const globals = readFileSync(
      path.resolve(__dirname, '../../../packages/sdc-populate/src/globals.ts'),
      'utf8'
    );
    const match = /TERMINOLOGY_SERVER_URL\s*=\s*'([^']+)'/.exec(globals);
    expect(match?.[1]).toBe(DEFAULT_TERMINOLOGY_SERVER_URL);
  });
});

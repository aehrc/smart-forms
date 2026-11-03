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

// This file is kept identical in populate-express, assemble-express and extract-express.

import {
  fetchJson,
  installOutboundFetchGuard,
  isAllowedOutboundUrl,
  isUnderBase,
  OutboundRequestError,
  parseBaseUrl,
  parseBaseUrlList,
  readBaseUrlSetting,
  resolveQueryUrl
} from './outboundUrl';

const base = parseBaseUrl('https://allowed.example/fhir', 'TEST_URL');

describe('parseBaseUrl', () => {
  it('normalises the path to end with a slash', () => {
    expect(parseBaseUrl('https://allowed.example/fhir', 'X').href).toBe(
      'https://allowed.example/fhir/'
    );
    expect(parseBaseUrl('https://allowed.example', 'X').pathname).toBe('/');
  });

  it('lowercases the host and drops the default port', () => {
    const url = parseBaseUrl('HTTPS://Allowed.EXAMPLE:443/fhir', 'X');
    expect(url.host).toBe('allowed.example');
    expect(url.href).toBe('https://allowed.example/fhir/');
  });

  it.each([
    ['not a url', 'not a URL'],
    ['ftp://allowed.example/fhir', 'must use http or https'],
    ['file:///etc/passwd', 'must use http or https'],
    ['https://user:pass@allowed.example/fhir', 'must not contain credentials'],
    ['https://user@allowed.example/fhir', 'must not contain credentials'],
    ['https://allowed.example/fhir?x=1', 'must not contain a query or fragment'],
    ['https://allowed.example/fhir#frag', 'must not contain a query or fragment']
  ])('rejects %s', (raw, message) => {
    expect(() => parseBaseUrl(raw, 'X')).toThrow(message);
  });
});

describe('readBaseUrlSetting and parseBaseUrlList', () => {
  it('treats unset and blank values as not configured', () => {
    expect(readBaseUrlSetting(undefined, 'X')).toBeNull();
    expect(readBaseUrlSetting('', 'X')).toBeNull();
    expect(readBaseUrlSetting('   ', 'X')).toBeNull();
  });

  it('parses a comma-separated list and skips empty entries', () => {
    const list = parseBaseUrlList(' https://a.example/fhir , ,http://b.example:8080 ', 'X');
    expect(list.map((url) => url.href)).toEqual([
      'https://a.example/fhir/',
      'http://b.example:8080/'
    ]);
    expect(parseBaseUrlList(undefined, 'X')).toEqual([]);
  });

  it('fails on an invalid list entry', () => {
    expect(() => parseBaseUrlList('https://a.example,javascript:alert(1)', 'X')).toThrow(
      'X must use http or https'
    );
  });
});

describe('isUnderBase', () => {
  const accepted = [
    'https://allowed.example/fhir/Patient/123',
    'https://allowed.example/fhir',
    'https://allowed.example/fhir/',
    'https://ALLOWED.Example/fhir/Patient/123',
    'HTTPS://allowed.example/fhir/Patient/123',
    'https://allowed.example:443/fhir/Patient/123',
    'https://allowed.example/fhir/Questionnaire?url=http://other.example/Q'
  ];

  const rejected = [
    ['different host', 'https://evil.example/fhir/Patient/123'],
    ['subdomain of the allowed host', 'https://sub.allowed.example/fhir/Patient/123'],
    ['allowed host as a subdomain of another host', 'https://allowed.example.evil.example/fhir'],
    ['different port', 'https://allowed.example:8443/fhir/Patient/123'],
    ['different scheme', 'http://allowed.example/fhir/Patient/123'],
    ['userinfo', 'https://user@allowed.example/fhir/Patient/123'],
    ['userinfo with password', 'https://user:pass@allowed.example/fhir/Patient/123'],
    ['allowed host as userinfo', 'https://allowed.example@evil.example/fhir/Patient/123'],
    ['path prefix escape', 'https://allowed.example/fhirx/Patient/123'],
    ['path outside the base', 'https://allowed.example/admin'],
    ['dot segments leaving the base', 'https://allowed.example/fhir/../admin'],
    ['encoded dot segments leaving the base', 'https://allowed.example/fhir/%2e%2e/admin'],
    ['encoded slash', 'https://allowed.example/fhir/..%2fadmin'],
    ['encoded backslash', 'https://allowed.example/fhir/..%5Cadmin'],
    ['non-http scheme', 'ftp://allowed.example/fhir/Patient/123']
  ];

  it.each(accepted)('accepts %s', (target) => {
    expect(isUnderBase(new URL(target), base)).toBe(true);
  });

  it.each(rejected)('rejects %s', (_, target) => {
    expect(isUnderBase(new URL(target), base)).toBe(false);
  });

  it('compares the effective port when the base uses a default port explicitly', () => {
    const httpBase = parseBaseUrl('http://allowed.example:80/fhir', 'X');
    expect(isUnderBase(new URL('http://allowed.example/fhir/Patient/1'), httpBase)).toBe(true);
    expect(isUnderBase(new URL('http://allowed.example:8080/fhir/Patient/1'), httpBase)).toBe(
      false
    );
  });

  it('handles IPv6 literals', () => {
    const ipv6Base = parseBaseUrl('http://[::1]:8080/fhir', 'X');
    expect(isUnderBase(new URL('http://[::1]:8080/fhir/Patient/1'), ipv6Base)).toBe(true);
    expect(isUnderBase(new URL('http://[0:0:0:0:0:0:0:1]:8080/fhir/Patient/1'), ipv6Base)).toBe(
      true
    );
    expect(isUnderBase(new URL('http://[::2]:8080/fhir/Patient/1'), ipv6Base)).toBe(false);
    expect(isUnderBase(new URL('http://[::1]:8081/fhir/Patient/1'), ipv6Base)).toBe(false);
    expect(isUnderBase(new URL('http://[::1]:8080/fhir/Patient/1'), base)).toBe(false);
  });

  it('accepts everything on the host when the base path is the root', () => {
    const rootBase = parseBaseUrl('https://allowed.example', 'X');
    expect(isUnderBase(new URL('https://allowed.example/anything/at/all'), rootBase)).toBe(true);
    expect(isUnderBase(new URL('https://evil.example/anything'), rootBase)).toBe(false);
  });
});

describe('isAllowedOutboundUrl', () => {
  it('accepts a URL under any of the allowed bases', () => {
    const other = parseBaseUrl('http://other.example:8080/r4', 'X');
    expect(isAllowedOutboundUrl('http://other.example:8080/r4/Patient', [base, other])).toBe(true);
    expect(isAllowedOutboundUrl('https://allowed.example/fhir/Patient', [base, other])).toBe(true);
    expect(isAllowedOutboundUrl('http://other.example/r4/Patient', [base, other])).toBe(false);
  });

  it('rejects anything that does not parse, and everything when nothing is allowed', () => {
    expect(isAllowedOutboundUrl('not a url', [base])).toBe(false);
    expect(isAllowedOutboundUrl('/fhir/Patient', [base])).toBe(false);
    expect(isAllowedOutboundUrl('https://allowed.example/fhir/Patient', [])).toBe(false);
  });
});

describe('resolveQueryUrl', () => {
  const extra = [parseBaseUrl('https://extra.example/fhir', 'ALLOWED_FETCH_ORIGINS')];

  it('appends a relative query to the configured base', () => {
    expect(resolveQueryUrl('Patient/123', base, [], 'TEST_URL').href).toBe(
      'https://allowed.example/fhir/Patient/123'
    );
    expect(resolveQueryUrl('/Patient/123', base, [], 'TEST_URL').href).toBe(
      'https://allowed.example/fhir/Patient/123'
    );
    expect(
      resolveQueryUrl('Questionnaire?url=http://example.org/Q|1.0', base, [], 'TEST_URL').href
    ).toBe('https://allowed.example/fhir/Questionnaire?url=http://example.org/Q|1.0');
  });

  it('keeps a protocol-relative query on the configured host', () => {
    const resolved = resolveQueryUrl('//evil.example/Patient/1', base, [], 'TEST_URL');
    expect(resolved.host).toBe('allowed.example');
    expect(resolved.pathname).toBe('/fhir/evil.example/Patient/1');
  });

  it('refuses a relative query that climbs out of the base path', () => {
    expect(() => resolveQueryUrl('../admin', base, [], 'TEST_URL')).toThrow(
      'it resolves outside TEST_URL'
    );
  });

  it('refuses a relative query when no base is configured', () => {
    expect(() => resolveQueryUrl('Patient/123', null, extra, 'TEST_URL')).toThrow(
      'TEST_URL is not configured, so "Patient/123" cannot be fetched.'
    );
  });

  it('accepts an absolute URL under the configured base or an additional base', () => {
    expect(resolveQueryUrl('https://allowed.example/fhir/Patient/1', base, [], 'T').href).toBe(
      'https://allowed.example/fhir/Patient/1'
    );
    expect(resolveQueryUrl('https://extra.example/fhir/Patient/1', base, extra, 'T').href).toBe(
      'https://extra.example/fhir/Patient/1'
    );
    expect(resolveQueryUrl('https://extra.example/fhir/Patient/1', null, extra, 'T').href).toBe(
      'https://extra.example/fhir/Patient/1'
    );
  });

  it.each([
    'http://evil.example/fhir/Patient/1',
    'https://allowed.example@evil.example/fhir/Patient/1',
    'https://allowed.example:8443/fhir/Patient/1',
    'http://allowed.example/fhir/Patient/1',
    'https://allowed.example/fhirx/Patient/1',
    'http://169.254.169.254/latest/meta-data/',
    'file:///etc/passwd',
    'urn:uuid:7f3e1b9a-0000-4000-8000-000000000000'
  ])('refuses the absolute URL %s', (query) => {
    let error: unknown;
    try {
      resolveQueryUrl(query, base, extra, 'TEST_URL');
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(OutboundRequestError);
    expect((error as OutboundRequestError).httpStatus).toBe(400);
    expect((error as OutboundRequestError).message).toContain(
      'is not under TEST_URL or ALLOWED_FETCH_ORIGINS'
    );
  });

  it('refuses an absolute URL when nothing is configured', () => {
    expect(() => resolveQueryUrl('https://allowed.example/fhir/Patient/1', null, [], 'T')).toThrow(
      OutboundRequestError
    );
  });
});

describe('fetchJson', () => {
  const originalFetch = globalThis.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('requests without following redirects and returns parsed JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"resourceType":"Patient","id":"1"}', { status: 200 })
    );

    const result = await fetchJson(new URL('https://allowed.example/fhir/Patient/1'), {
      headers: { Accept: 'application/json' }
    });

    expect(result).toEqual({ resourceType: 'Patient', id: '1' });
    expect(fetchMock).toHaveBeenCalledWith(new URL('https://allowed.example/fhir/Patient/1'), {
      headers: { Accept: 'application/json' },
      redirect: 'manual'
    });
  });

  it('treats a redirect as an error and does not follow it', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 302, headers: { Location: 'http://evil.example/' } })
    );

    await expect(fetchJson(new URL('https://allowed.example/fhir/Patient/1'))).rejects.toThrow(
      'responded with a redirect (status 302), which is not followed.'
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports a non-OK status without the response body', async () => {
    fetchMock.mockResolvedValue(new Response('secret internal page', { status: 404 }));

    const promise = fetchJson(new URL('https://allowed.example/fhir/Patient/1'));
    await expect(promise).rejects.toThrow(
      'HTTP error when performing https://allowed.example/fhir/Patient/1. Status: 404'
    );
    await expect(promise).rejects.not.toThrow('secret');
  });

  it('reports invalid JSON without echoing the response body', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    fetchMock.mockResolvedValue(
      new Response('<html>secret internal page</html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      })
    );

    let error: unknown;
    try {
      await fetchJson(new URL('https://allowed.example/fhir/Patient/1'));
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(OutboundRequestError);
    expect((error as Error).message).toBe(
      'Response from https://allowed.example/fhir/Patient/1 was not valid JSON. Status: 200'
    );
    expect(consoleError.mock.calls.join(' ')).not.toContain('secret');
    consoleError.mockRestore();
  });
});

describe('installOutboundFetchGuard', () => {
  const originalFetch = globalThis.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    installOutboundFetchGuard([base]);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('passes allowed requests through without following redirects', async () => {
    await fetch('https://allowed.example/fhir/Patient/1', { headers: { A: 'b' } });
    expect(fetchMock).toHaveBeenCalledWith('https://allowed.example/fhir/Patient/1', {
      headers: { A: 'b' },
      redirect: 'manual'
    });
  });

  it.each([
    'http://evil.example/fhir/Patient/1',
    'https://allowed.example@evil.example/fhir',
    'https://allowed.example:444/fhir',
    'https://allowed.example/fhirx',
    '/relative/path'
  ])('refuses %s without sending it', async (target) => {
    await expect(fetch(target)).rejects.toThrow(OutboundRequestError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('checks URL objects and Request objects as well as strings', async () => {
    await expect(fetch(new URL('http://evil.example/'))).rejects.toThrow(OutboundRequestError);
    await expect(fetch(new Request('http://evil.example/'))).rejects.toThrow(OutboundRequestError);
    expect(fetchMock).not.toHaveBeenCalled();

    await fetch(new Request('https://allowed.example/fhir/metadata'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('turns a redirect response into an error', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, { status: 307, headers: { Location: 'http://evil.example/' } })
    );
    await expect(fetch('https://allowed.example/fhir/Patient/1')).rejects.toThrow(
      'responded with a redirect (status 307), which is not followed.'
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('is installed only once', async () => {
    const guarded = globalThis.fetch;
    installOutboundFetchGuard([parseBaseUrl('http://evil.example', 'X')]);
    expect(globalThis.fetch).toBe(guarded);
    await expect(fetch('http://evil.example/')).rejects.toThrow(OutboundRequestError);
  });
});

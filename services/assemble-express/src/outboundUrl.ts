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

/**
 * Outbound request policy for the Express services.
 *
 * The services only send requests to FHIR servers that the operator configured through environment
 * variables. A URL is allowed when it has the same scheme, host and port as a configured base URL and
 * its path sits under the base URL's path. Request headers never contribute to an outbound URL, and
 * redirects are never followed.
 *
 * This file is kept identical in populate-express, assemble-express and extract-express, because
 * each service is built into its own Docker image from its own directory.
 */

const DEFAULT_PORTS: Readonly<Record<string, string>> = { 'http:': '80', 'https:': '443' };
const MAX_ECHOED_LENGTH = 200;

/**
 * An error raised by the outbound request policy or by a failed outbound request.
 * Its message is safe to return to the caller: it never contains a fetched response body.
 */
export class OutboundRequestError extends Error {
  readonly httpStatus: number;

  constructor(message: string, httpStatus: number) {
    super(message);
    this.name = 'OutboundRequestError';
    this.httpStatus = httpStatus;
  }
}

function isHttpUrl(url: URL): boolean {
  return url.protocol === 'http:' || url.protocol === 'https:';
}

function effectivePort(url: URL): string {
  return url.port || DEFAULT_PORTS[url.protocol] || '';
}

function truncateForMessage(value: string): string {
  return value.length > MAX_ECHOED_LENGTH ? `${value.slice(0, MAX_ECHOED_LENGTH)}...` : value;
}

/**
 * Parses an operator-configured server base URL. Throws when the value is not a plain http(s) URL,
 * contains credentials, or carries a query or fragment. The returned URL's path always ends in "/".
 */
export function parseBaseUrl(raw: string, settingName: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error(`${settingName} must be an absolute http(s) URL, but "${raw}" is not a URL.`);
  }

  if (!isHttpUrl(url)) {
    throw new Error(`${settingName} must use http or https, but "${raw}" uses ${url.protocol}`);
  }
  if (url.username || url.password) {
    throw new Error(`${settingName} must not contain credentials. Use the matching auth token.`);
  }
  if (url.search || url.hash) {
    throw new Error(`${settingName} must not contain a query or fragment, but "${raw}" does.`);
  }

  if (!url.pathname.endsWith('/')) {
    url.pathname += '/';
  }
  return url;
}

/**
 * Reads an optional base URL setting. An unset or blank value means "not configured".
 */
export function readBaseUrlSetting(value: string | undefined, settingName: string): URL | null {
  if (!value || value.trim() === '') {
    return null;
  }
  return parseBaseUrl(value, settingName);
}

/**
 * Parses a comma-separated list of base URLs, such as ALLOWED_FETCH_ORIGINS.
 */
export function parseBaseUrlList(value: string | undefined, settingName: string): URL[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '')
    .map((entry) => parseBaseUrl(entry, settingName));
}

/**
 * Returns true when the target URL is under the base URL: same scheme, host and port, no
 * credentials, and a path that starts with the base path on a segment boundary.
 */
export function isUnderBase(target: URL, base: URL): boolean {
  if (!isHttpUrl(target) || target.username !== '' || target.password !== '') {
    return false;
  }

  if (
    target.protocol !== base.protocol ||
    target.hostname.toLowerCase() !== base.hostname.toLowerCase() ||
    effectivePort(target) !== effectivePort(base)
  ) {
    return false;
  }

  // An encoded slash or backslash could be decoded by the server into a different path
  if (/%2f|%5c/i.test(target.pathname)) {
    return false;
  }

  const basePath = base.pathname.endsWith('/') ? base.pathname : `${base.pathname}/`;
  return target.pathname.startsWith(basePath) || `${target.pathname}/` === basePath;
}

/**
 * Returns true when the URL parses and falls under at least one of the allowed base URLs.
 */
export function isAllowedOutboundUrl(target: string | URL, allowedBases: readonly URL[]): boolean {
  let url: URL;
  try {
    url = typeof target === 'string' ? new URL(target) : target;
  } catch {
    return false;
  }

  return allowedBases.some((base) => isUnderBase(url, base));
}

function parseAbsoluteUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/**
 * Resolves the URL to fetch for a query string handed to a fetch callback.
 *
 * A relative query is appended to the configured base URL and must stay under it. An absolute URL is
 * fetched only when it falls under the configured base URL or one of the additionally allowed base
 * URLs. Anything else is refused with an OutboundRequestError.
 *
 * @param query - A relative FHIR query (e.g. "Patient/123") or an absolute URL
 * @param base - The configured server base URL, or null when it is not configured
 * @param additionalBases - Other base URLs that absolute URLs may point at (e.g. ALLOWED_FETCH_ORIGINS)
 * @param settingName - The environment variable that configures the base URL, used in messages
 */
export function resolveQueryUrl(
  query: string,
  base: URL | null,
  additionalBases: readonly URL[],
  settingName: string
): URL {
  const absoluteUrl = parseAbsoluteUrl(query);
  if (absoluteUrl) {
    const allowedBases = base ? [base, ...additionalBases] : additionalBases;
    if (isAllowedOutboundUrl(absoluteUrl, allowedBases)) {
      return absoluteUrl;
    }

    throw new OutboundRequestError(
      `Refusing to fetch "${truncateForMessage(query)}": the URL is not under ${settingName} or ALLOWED_FETCH_ORIGINS.`,
      400
    );
  }

  if (!base) {
    throw new OutboundRequestError(
      `${settingName} is not configured, so "${truncateForMessage(query)}" cannot be fetched.`,
      400
    );
  }

  const target = parseAbsoluteUrl(base.href + query.replace(/^\/+/, ''));
  if (!target || !isUnderBase(target, base)) {
    throw new OutboundRequestError(
      `Refusing to fetch "${truncateForMessage(query)}": it resolves outside ${settingName}.`,
      400
    );
  }

  return target;
}

function isRedirectStatus(status: number): boolean {
  return status >= 300 && status < 400;
}

function describeEndpoint(url: URL): string {
  return `${url.origin}${url.pathname}`;
}

async function discardBody(response: Response): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // The body is not needed, ignore failures to release it
  }
}

/**
 * Fetches a URL that has already passed the outbound policy, without following redirects.
 *
 * A redirect could point outside the configured servers, so a 3xx response is turned into an
 * OutboundRequestError instead of being followed.
 */
export async function fetchWithoutRedirects(url: URL, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, { ...init, redirect: 'manual' });

  if (isRedirectStatus(response.status) || response.type === 'opaqueredirect') {
    await discardBody(response);
    throw new OutboundRequestError(
      `${describeEndpoint(url)} responded with a redirect (status ${response.status}), which is not followed.`,
      502
    );
  }

  return response;
}

/**
 * Parses a response body as JSON. When the body is not JSON, the error carries the status code
 * only, so a fetched document cannot be echoed back to the caller through an error message.
 */
export async function readJson(response: Response, url: URL): Promise<unknown> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error(
      `Response from ${describeEndpoint(url)} was not valid JSON ` +
        `(status ${response.status}, content-type ${response.headers.get('content-type') ?? 'none'}, ${text.length} characters).`
    );
    throw new OutboundRequestError(
      `Response from ${describeEndpoint(url)} was not valid JSON. Status: ${response.status}`,
      502
    );
  }
}

/**
 * Fetches a URL that has already passed the outbound policy and parses the response as JSON.
 * Redirects are not followed, and errors never include the response body.
 */
export async function fetchJson(url: URL, init: RequestInit = {}): Promise<unknown> {
  const response = await fetchWithoutRedirects(url, init);

  if (!response.ok) {
    await discardBody(response);
    throw new OutboundRequestError(
      `HTTP error when performing ${url.href}. Status: ${response.status}`,
      502
    );
  }

  return readJson(response, url);
}

function requestUrlOf(input: string | URL | Request): URL | null {
  if (input instanceof URL) {
    return input;
  }
  return parseAbsoluteUrl(typeof input === 'string' ? input : input.url);
}

const GUARD_MARKER = Symbol.for('smart-forms.outboundFetchGuard');

/**
 * Wraps the global fetch so that every outbound request made in this process, including requests
 * made by libraries such as fhirpath.js, must fall under one of the allowed base URLs and is sent
 * without following redirects.
 *
 * @param allowedBases - Every server base URL this service is configured to call
 */
export function installOutboundFetchGuard(allowedBases: readonly URL[]): void {
  const currentFetch = globalThis.fetch as typeof fetch & { [GUARD_MARKER]?: true };
  if (currentFetch[GUARD_MARKER]) {
    return;
  }

  const originalFetch = currentFetch;
  const guardedFetch = async (
    input: string | URL | Request,
    init?: RequestInit
  ): Promise<Response> => {
    const target = requestUrlOf(input);
    if (!target || !isAllowedOutboundUrl(target, allowedBases)) {
      const described = target ? describeEndpoint(target) : 'an unparseable URL';
      throw new OutboundRequestError(
        `Outbound request to ${truncateForMessage(described)} refused: it is not under a configured server URL.`,
        400
      );
    }

    const response = await originalFetch(input, { ...init, redirect: 'manual' });
    if (isRedirectStatus(response.status) || response.type === 'opaqueredirect') {
      await discardBody(response);
      throw new OutboundRequestError(
        `${describeEndpoint(target)} responded with a redirect (status ${response.status}), which is not followed.`,
        502
      );
    }
    return response;
  };

  Object.defineProperty(guardedFetch, GUARD_MARKER, { value: true });
  globalThis.fetch = guardedFetch as typeof fetch;
}

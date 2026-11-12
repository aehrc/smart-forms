# SDC $populate ExpressJS service

An [ExpressJS](https://expressjs.com/) Typescript reference implementation of the [$populate](http://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-populate.html) operation from the [HL7 FHIR Structured Data Capture Specification](http://hl7.org/fhir/uv/sdc/ImplementationGuide/hl7.fhir.uv.sdc).
It builds on [@aehrc/sdc-populate](https://www.npmjs.com/package/@aehrc/sdc-populate), nicely packaging it into an ExpressJS app that can be deployed as a microservice.

## Configuration
Create a .env file (or copy from example.env) in the root of the project with the following:
```env
EHR_SERVER_URL=
EHR_SERVER_AUTH_TOKEN=

TERMINOLOGY_SERVER_URL=
TERMINOLOGY_SERVER_AUTH_TOKEN=

ALLOWED_FETCH_ORIGINS=
```

The service only sends requests to the servers configured here. It never derives a server from the incoming request (for example the `Host` or `X-Forwarded-*` headers).

`EHR_SERVER_URL` is the FHIR server used to resolve `questionnaireRef`, canonical and identifier lookups of the Questionnaire, and context passed as references. If it is left empty, the service does not fetch any of these: supply the Questionnaire and the context as resources in the request instead (this is how the sample implementation below runs). A request that needs the EHR server while none is configured returns an OperationOutcome explaining that `EHR_SERVER_URL` is not configured, and reference contexts are reported in the `issues` output parameter.

By default, the service uses https://tx.ontoserver.csiro.au/fhir (the default terminology server of sdc-populate) for ValueSet `$expand` and CodeSystem `$lookup`. To use a different terminology server, set `TERMINOLOGY_SERVER_URL` and `TERMINOLOGY_SERVER_AUTH_TOKEN`. The auth token is only sent to a terminology server you configure.

### Absolute URLs in requests
A request can contain absolute URLs, for example an absolute `questionnaireRef` or a reference that a FHIRPath expression resolves. The service fetches an absolute URL only when it falls under a configured base URL: same scheme, host and port, and a path that starts with the base path (`https://ehr.example/fhir` allows `https://ehr.example/fhir/Patient/1` but not `https://ehr.example/fhirx/...` or `https://ehr.example:8443/fhir/...`). URLs with credentials (`user@host`), non-http(s) URLs, and paths containing `;` or an encoded `.`, `/`, `\` or `%` are always refused, because a server may read such a path differently. Redirects are never followed, and a request that takes longer than 30 seconds is aborted. Responses must be FHIR resources (JSON with a `resourceType`).

To allow absolute URLs on other servers, set `ALLOWED_FETCH_ORIGINS` to a comma-separated list of base URLs, e.g. `ALLOWED_FETCH_ORIGINS=https://forms.example/fhir,https://registry.example/fhir`. Requests to these servers are sent without any auth token.

Each URL setting must be an absolute http(s) URL without credentials, query or fragment; the service refuses to start otherwise.

### Migrating from earlier versions
Earlier versions used the request's own endpoint as the EHR server when `EHR_SERVER_URL` was empty (i.e. a service deployed on http://localhost:3001 fetched from http://localhost:3001/fhir). That default has been removed. If you relied on it, set `EHR_SERVER_URL` to that FHIR server's base URL explicitly. If your requests contain absolute URLs to servers other than the configured ones, add those servers to `ALLOWED_FETCH_ORIGINS`.

## Docker Usage

Run `docker run -p 3001:3001 aehrc/smart-forms-populate`.

You can supply your `docker run` command environment variables. i.e.

```docker run -p 3001:3001 -e EHR_SERVER_URL=https://proxy.smartforms.io/fhir aehrc/smart-forms-populate```

```docker run -p 3001:3001 -e TERMINOLOGY_SERVER_URL=https://tx.ontoserver.csiro.au/fhir aehrc/smart-forms-populate```

Docker image: https://hub.docker.com/r/aehrc/smart-forms-populate

## Sample implementation
A sample implementation of this service is available at https://smartforms.csiro.au/api/fhir/Questionnaire/$populate.
https://smartforms.csiro.au/api/fhir only stores Questionnaire definitions and does not contain any clinical data. Therefore when using this sample implementation, contextual information for pre-population should be provided as actual FHIR resources, not references.

This service also allows you to specify a query parameter `debug=true` which returns a base64-encoded FHIRPath context object (useful for debugging!) as the `contextResult-custom` output parameter.

Note: The $populate service on https://smartforms.csiro.au/api/fhir only performs processing - it does not persist any data.

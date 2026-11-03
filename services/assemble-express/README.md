# SDC $assemble ExpressJS service

An [ExpressJS](https://expressjs.com/) Typescript reference implementation of the [$assemble](http://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-assemble) operation from the [HL7 FHIR Structured Data Capture Specification](http://hl7.org/fhir/uv/sdc/ImplementationGuide/hl7.fhir.uv.sdc).
It builds on [@aehrc/sdc-assemble](https://www.npmjs.com/package/@aehrc/sdc-assemble), nicely packaging it into an ExpressJS app that can be deployed as a microservice.

## Configuration
Create a .env file (or copy from example.env) in the root of the project with the following:
```env
FORMS_SERVER_URL=
FORMS_SERVER_AUTH_TOKEN=
```

`FORMS_SERVER_URL` is the FHIR server that subquestionnaires are fetched from, by canonical URL. The service only sends requests to this server and never derives a server from the incoming request (for example the `Host` or `X-Forwarded-*` headers). If it is left empty, a Questionnaire without subquestionnaires is still returned as is, and a Questionnaire with subquestionnaires is answered with an issue explaining that `FORMS_SERVER_URL` is not configured.

The value must be an absolute http(s) URL without credentials, query or fragment; the service refuses to start otherwise. Redirects from the forms server are not followed.

This service never fetches absolute URLs taken from a request, so it has no `ALLOWED_FETCH_ORIGINS` setting (see populate-express).

### Migrating from earlier versions
Earlier versions used the request's own endpoint as the forms server when `FORMS_SERVER_URL` was empty (i.e. a service deployed on http://localhost:3002 fetched from http://localhost:3002/fhir). That default has been removed. If you relied on it, set `FORMS_SERVER_URL` to that FHIR server's base URL explicitly.

## Docker Usage

Run `docker run -p 3002:3002 aehrc/smart-forms-assemble`.

You can supply your `docker run` command environment variables. i.e.

```docker run -p 3002:3002 -e FORMS_SERVER_URL=https://smartforms.csiro.au/api/fhir aehrc/smart-forms-assemble```

Docker image: https://hub.docker.com/r/aehrc/smart-forms-assemble

## Sample implementation
A sample implementation of this service is available at https://smartforms.csiro.au/api/fhir/Questionnaire/$assemble.

Note: The $assemble service on https://smartforms.csiro.au/api/fhir only performs processing - it does not persist any data.

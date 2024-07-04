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
```

If ```EHR_SERVER_URL``` is left empty, the service will use the request endpoint as the EHR server URL (recommended).
i.e. Deploying this service on http://localhost:3001/fhir will result in calls to fetch resources on the http://localhost:3001/fhir FHIR API during execution of the $populate operation.

By default, sdc-populate uses https://r4.ontoserver.csiro.au/fhir as the terminology server under the hood. If you want to use a different terminology server, you can set the `TERMINOLOGY_SERVER_URL` and `TERMINOLOGY_SERVER_AUTH_TOKEN` environment variables.

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

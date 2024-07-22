# SDC $assemble ExpressJS service

An [ExpressJS](https://expressjs.com/) Typescript reference implementation of the [$assemble](http://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-assemble) operation from the [HL7 FHIR Structured Data Capture Specification](http://hl7.org/fhir/uv/sdc/ImplementationGuide/hl7.fhir.uv.sdc).
It builds on [@aehrc/sdc-assemble](https://www.npmjs.com/package/@aehrc/sdc-assemble), nicely packaging it into an ExpressJS app that can be deployed as a microservice.

## Configuration
Create a .env file (or copy from example.env) in the root of the project with the following:
```env
FORMS_SERVER_URL=
FORMS_SERVER_AUTH_TOKEN=
```

If ```FORMS_SERVER_URL``` is left empty, the service will use the request endpoint as the forms server URL.
i.e. Deploying this service on http://localhost:3001/fhir will result in calls to fetch subquestionnaires on the http://localhost:3001/fhir FHIR API during execution of the $assemble operation.

## Docker Usage

Run `docker run -p 3002:3002 aehrc/smart-forms-assemble`.

You can supply your `docker run` command environment variables. i.e.

```docker run -p 3002:3002 -e FORMS_SERVER_URL=https://smartforms.csiro.au/api/fhir aehrc/smart-forms-assemble```

Docker image: https://hub.docker.com/r/aehrc/smart-forms-assemble

## Sample implementation
A sample implementation of this service is available at https://smartforms.csiro.au/api/fhir/Questionnaire/$assemble.

Note: The $assemble service on https://smartforms.csiro.au/api/fhir only performs processing - it does not persist any data.

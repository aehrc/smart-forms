# SDC StructureMap-based $extract ExpressJS service

A [ExpressJS](https://expressjs.com/) Typescript reference implementation of the [$extract](https://hl7.org/fhir/uv/sdc/OperationDefinition-QuestionnaireResponse-extract.html) operation from the [HL7 FHIR Structured Data Capture Specification](http://hl7.org/fhir/uv/sdc/ImplementationGuide/hl7.fhir.uv.sdc).
It is an abstraction on top of an existing StructureMap [$transform](https://hl7.org/fhir/r4/structuremap-operation-transform.html) operation to perform the extraction. 

A proof-of-concept StructureMap $transform is defined on https://proxy.smartforms.io/fhir/StructureMap/$transform, leveraging Brian's .NET mapping engine from https://github.com/brianpos/fhir-net-mappinglanguage/tree/main/demo-map-server.

A `StructureMap/$convert` operation is also defined in the POC implementation to convert a FHIR Mapping Language map to a StructureMap resource, using the same .NET mapping engine.

## Configuration
Create a .env file (or copy from example.env) in the root of the project with the following:
```env
EHR_SERVER_URL=
EHR_SERVER_AUTH_TOKEN=

# Change this to wherever your FHIR questionnaires are stored
FORMS_SERVER_URL=https://smartforms.csiro.au/api/fhir
FORMS_SERVER_AUTH_TOKEN=
```

If you are planning to deploy this as a microservice on your EHR server, it is required for your EHR server to have a StructureMap $transform operation defined.

If EHR_SERVER_URL is left empty, the service will use the request endpoint as the EHR server URL. i.e. Deploying this service on http://localhost:3003/fhir will result in a call to http://localhost:3003/fhir/StructureMap/$transform during execution of the $extract operation.

If your EHR server does not have a StructureMap $transform operation defined, you can set EHR_SERVER_URL to https://proxy.smartforms.io/fhir/StructureMap/$transform. 

Note: The $transform service on https://proxy.smartforms.io/fhir only performs processing - it does not persist any data.

## Docker Usage
Run `docker run -p 3003:3003 aehrc/smart-forms-extract`.

You can use `docker run -p 3003:3003 -e EHR_SERVER_URL=https://proxy.smartforms.io/fhir aehrc/smart-forms-extract` to use the POC $transform operation. 

Docker image: https://hub.docker.com/r/aehrc/smart-forms-extract

**By default, ```FORMS_SERVER_URL``` is set to https://smartforms.csiro.au/api/fhir in the Docker image.** This endpoint is used to resolve referenced FHIR Questionnaires and StructureMaps.

## Sample implementation
A sample implementation of the `$extract` service is available at https://proxy.smartforms.io/fhir/QuestionnaireResponse/$extract.
`StructureMap/$convert` is available at https://proxy.smartforms.io/fhir/StructureMap/$convert.

Note: The $extract and $convert service on https://proxy.smartforms.io/fhir only performs processing - it does not persist any data.

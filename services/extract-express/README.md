# SDC StructureMap-based $extract ExpressJS service

> [!WARNING]  
> Note: Starting from 1 July 2025, this image will not be maintained moving forward. Please refer to https://github.com/aehrc/smart-forms/tree/alpha/packages/sdc-template-extract for the template-based extraction NPM library. See https://github.com/aehrc/smart-forms/issues/1337.

A [ExpressJS](https://expressjs.com/) Typescript reference implementation of the [$extract](https://hl7.org/fhir/uv/sdc/OperationDefinition-QuestionnaireResponse-extract.html) operation from the [HL7 FHIR Structured Data Capture Specification](http://hl7.org/fhir/uv/sdc/ImplementationGuide/hl7.fhir.uv.sdc).
It is an abstraction on top of an existing StructureMap [$transform](https://hl7.org/fhir/r4/structuremap-operation-transform.html) operation to perform the extraction. 

Brian Postlethwaite has a .NET mapping engine containing a proof-of-concept StructureMap $transform from https://github.com/brianpos/fhir-net-mappinglanguage/tree/main/demo-map-server which be deployed as a $transform operation on a microservice.

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

## Docker Usage
Run `docker run -p 3003:3003 -e EHR_SERVER_URL=<insert your FHIR server base URL> aehrc/smart-forms-extract`.

(Ensure that your FHIR server has a StructureMap $transform operation!)

**By default, ```FORMS_SERVER_URL``` is set to https://smartforms.csiro.au/api/fhir in the Docker image.** This endpoint is used to resolve referenced FHIR Questionnaires and StructureMaps.

## Sample implementation
As of 1 July 2025, we have decommissioned the `$extract` sample implementation. Please visit https://dev.fhirpath-lab.com/Questionnaire/tester which provides a .NET implementation of the `$extract` operation when testing extractable questionnaires.

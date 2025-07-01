# Forms Server Architecture - AWS Deployment via Fargate

This folder contains the **forms-server** services architecture for deploying a plain HAPI server designed to host Questionnaire definitions with $assemble and $populate operations using AWS ECS and Fargate.

## Components
### forms-server-app
Runs on AWS Fargate as the main orchestrator application.

### hapi-endpoint
A microservice running in Docker that serves as the base HAPI FHIR server.  
From: https://github.com/hapifhir/hapi-fhir-jpaserver-starter

Base URL: `https://smartforms.csiro.au/api/fhir/`

### assemble-endpoint
A microservice in Docker for Questionnaire [$assemble](https://build.fhir.org/ig/HL7/sdc/OperationDefinition-Questionnaire-assemble.html) operation.

From: `services/assemble-express` directory

### populate-endpoint
A microservice in Docker for Questionnaire [$populate](https://build.fhir.org/ig/HL7/sdc/OperationDefinition-Questionnaire-populate.html)

From: `services/populate-express` directory

## Working example
Forms Server: `https://smartforms.csiro.au/api/fhir/`

Assemble Endpoint: `https://smartforms.csiro.au/api/fhir/Questionnaire/$assemble`

Populate Endpoint: `https://smartforms.csiro.au/api/fhir/Questionnaire/$populate`

NOTE: The usage of 'https://smartforms.csiro.au' requires CloudFront to be set up with the appropriate ACM certificate and DNS + CNAME from CSIRO.
Additionally, the routing is handled via `deployment/cloudfront/SmartFormsRedirectToCorrectRoute.js` as a Cloudfront function.

## Deployment steps
Run steps 1, 2, 3, and 4-7 in four separate terminal windows respectively.

1. `npm i` and `npm run watch` in hapi-endpoint.
2. `npm i` and `npm run watch` in assemble-endpoint.
3. `npm i` and `npm run watch` in populate-endpoint.
4. `npm i` and `npm run build` in forms-server-app.
5. `aws sso login --profile smart-forms`
6. `cdk diff --profile smart-forms`. Ensure the changes are as expected.
7. `cdk deploy --profile smart-forms`

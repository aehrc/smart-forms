# EHR Proxy Architecture - AWS Deployment via Fargate

This folder contains the **ehr-proxy** services architecture for deploying a FHIR proxy solution using AWS ECS.

## Components

### ehr-proxy-app
  Runs on AWS Fargate as the main orchestrator application.

### hapi-endpoint
  A microservice running in Docker that serves as the plain HAPI FHIR server.
  From: https://github.com/hapifhir/hapi-fhir-jpaserver-starter

  Base URL: `https://proxy.smartforms.io/fhir/`

### smart-proxy
  A microservice running in Docker that acts as a SMART on FHIR plugin layered on top of the HAPI server.
  It requires the `FHIR_SERVER_R4` environment variable pointing to the HAPI server.
  From: https://github.com/aehrc/smart-launcher-v2/

  The `smart-proxy` container expects the following environment variable:

  ```bash
  FHIR_SERVER_R4=https://proxy.smartforms.io/fhir
  ```

### Working example

SMART-enabled FHIR Server: `https://proxy.smartforms.io/v/r4/fhir/`

### Deployment steps
Run steps 1, 2, and 3-6 in three separate terminal windows respectively.

1. `npm i` and `npm run watch` in hapi-endpoint.
2. `npm i` and `npm run watch` in smart-proxy.
3. `npm i` and `npm run build` in ehr-proxy-app.
4. `aws sso login --profile smart-forms`
5. `cdk diff --profile smart-forms`. Ensure the changes are as expected.
6. `cdk deploy --profile smart-forms`

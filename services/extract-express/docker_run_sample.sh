#!/bin/sh
docker run \
  -p 3003:3003 \
  -d \
  -e EHR_SERVER_URL=https://proxy.smartforms.io/fhir \
  aehrc/smart-forms-extract:latest

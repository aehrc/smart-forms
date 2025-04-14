# SDC-Populate

A Typescript reference implementation of the [$populate](http://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-populate.html) operation from the [HL7 FHIR Structured Data Capture Specification](http://hl7.org/fhir/uv/sdc/ImplementationGuide/hl7.fhir.uv.sdc) designed for [Form Population](http://hl7.org/fhir/uv/sdc/populate.html).

Check out the [API Reference](https://smartforms.csiro.au/docs/api/sdc-populate) for technical specifications. 

## Usage
There are two ways to use this package:
1. Using it in a web app
2. Using it in a backend service e.g. ExpressJS

### Using it in a web app
It is recommended to use `populateQuestionnaire()`, which performs an in-app population. This means that the app is not sending data to an external server, but rather using the library to populate the questionnaire in the app itself.

```ts
const { populateSuccess, populateResult } = await populateQuestionnaire({
  questionnaire: yourQuestionnaireResource,
  fetchResourceCallback: yourFetchResourceCallbackFunction,
  fetchResourceRequestConfig: yourFetchResourceRequestConfig,
  patient: yourPatient,
});

// Pre-population is successful
if (populateSuccess && populateResult !== null) {
  const questionnaireResponse = populateResult.populatedResponse;
  
  // Do things with the pre-populated questionnaireResponse...
}
```

You will also need to define your own `fetchResourceCallback` function and `fetchResourceRequestConfig`. This function is responsible for fetching resources from your FHIR server. It should return a promise that resolves to the resource you want to fetch.

```ts
import { FetchResourceRequestConfig, FetchResourceCallback } from '@aehrc/sdc-populate';

const ABSOLUTE_URL_REGEX = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

export const yourFetchResourceRequestConfig: FetchResourceRequestConfig = {
  sourceServerUrl: 'https://proxy.smartforms.io/fhir',
  authToken: string | null
};

export const yourFetchResourceCallbackFunction: FetchResourceCallback = async (
  query: string,
  requestConfig: FetchResourceRequestConfig
) => {
  let { sourceServerUrl } = requestConfig;
  const { authToken } = requestConfig;

  const headers: Record<string, string> = {
    Accept: 'application/json;charset=utf-8'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (!sourceServerUrl.endsWith('/')) {
    sourceServerUrl += '/';
  }

  const requestUrl = ABSOLUTE_URL_REGEX.test(query) ? query : `${sourceServerUrl}${query}`;
  const response = await fetch(requestUrl, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error when performing ${requestUrl}. Status: ${response.status}`);
  }

  return response.json();
};
```


Available parameters for `populateQuestionnaire()`:

| Parameter                      | Description                                                                                      |
|-------------------------------|--------------------------------------------------------------------------------------------------|
| `questionnaire`               | Questionnaire to populate                                                                        |
| `fetchResourceCallback`       | A callback function to fetch resources from your FHIR server                                     |
| `fetchResourceRequestConfig`  | Any request configuration to be passed to the fetchResourceCallback (e.g., headers, auth, etc.)  |
| `patient`                     | Patient resource as patient in context                                                           |
| `user`                        | Practitioner resource as user in context (optional)                                              |
| `encounter`                   | Encounter resource as encounter in context (optional)                                            |
| `fetchTerminologyCallback`    | A callback function to fetch terminology resources (optional)                                    |
| `fetchTerminologyRequestConfig` | Any request configuration to be passed to the fetchTerminologyCallback (e.g., headers, auth, etc.) (optional) |



### Using it in a backend service
Using this library in a backend service requires more pre-configuration. 
Due to how the [$populate](https://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-populate.html) works, you will need to provide a bunch of input parameters to the `populate()` function.

There is a sample implementation of how to use the `populate()` function in https://github.com/aehrc/smart-forms/blob/main/services/populate-express/src/index.ts.


### Local development notes
It's recommended to run this library within a web app or a service if you're doing local development. 
This library compiles to both CommonJS and ES Modules, so there is no problems in using it across web frameworks and Node-based backends.

To compile the code, use `npm run compile`.
To watch for changes, use `npm run watch`.

Note: Do not use `tsc` or `tsc -w` as it will only compile to ES Modules, which means it will not work with CommonJS-based implementations.


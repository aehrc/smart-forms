# SDC-Template-based Extract

A Typescript reference implementation of the [$extract](https://build.fhir.org/ig/HL7/sdc/OperationDefinition-QuestionnaireResponse-extract.html) operation from the [HL7 FHIR Structured Data Capture Specification](http://hl7.org/fhir/uv/sdc/ImplementationGuide/hl7.fhir.uv.sdc) and is designed for [Modular Questionnaires](http://hl7.org/fhir/uv/sdc/modular.html#modular-questionnaires).

## Usage
There are two ways to use this package:
1. Using it in a web app
2. Using it in a backend service e.g. ExpressJS

### Using it in a web app
It is recommended to use `inAppExtraction()`, which performs an in-app extraction. This means that the app is not sending data to an external server, but rather using JavaScript to perform the extraction in the browser.

```ts
const responseToExtract = structuredClone(savedResponse); // Good practice to deep clone the response to prevent mutating the original response
const inAppExtractOutput = await inAppExtract(
  responseToExtract,
  sourceQuestionnaire
);

const { extractResult, extractSuccess } = inAppExtractOutput;

// Extraction is successful
if (extractSuccess && !extractResultIsOperationOutcome(extractResult)) {
  const extractedBundle = extractResult.extractedBundle;

  // Do things with the successfully extracted transaction bundle...
}
```

Available parameters for `inAppExtract()`:

| Parameter                      | Description                                                                                                                                                                                      |
|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `questionnaireResponse`               | QuestionnaireResponse to extract data from                                                                                                                                                       |
| `questionnaireOrCallback`       | Either a `Questionnaire` resource or a fetch/callback configuration for dynamic retrieval (if module making the inAppExtract() call does not have access to the Questionnaire resource).         |
| `comparisonSourceResponse`  | An optional `QuestionnaireResponse` used for comparison when extracting. If this is provided, only "modified" items will be extracted. In most cases, this likely is the pre-populated response. |


### Using it in a backend service
Using this library in a backend service requires more pre-configuration.
Due to how the [$extract](https://build.fhir.org/ig/HL7/sdc/OperationDefinition-QuestionnaireResponse-extract.html) works, you will need to provide a `Parameters` resource defining the input parameters conforming to the `extract()` function.

sdc-template-extract allows you to specify custom `questionnaire` and `comparison-source-response` parameters, allowing you to pass their respective resources directly to the `extract()` function.
A library function `createInputParameters()` is provided to help you create the `Parameters` resource.

There is no sample implementation of using the `extract()` function in a backend service as of now.


### Local development notes
It's recommended to run this library within a web app or a service if you're doing local development.
This library compiles to both CommonJS and ES Modules, so there is no problems in using it across web frameworks and Node-based backends.

To compile the code, use `npm run compile`.
To watch for changes, use `npm run watch`.

Note: Do not use `tsc` or `tsc -w` as it will only compile to ES Modules, which means it will not work with CommonJS-based implementations.




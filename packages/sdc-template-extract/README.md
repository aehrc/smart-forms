# SDC-Template-based Extract

A Typescript reference implementation of the [$extract](https://build.fhir.org/ig/HL7/sdc/OperationDefinition-QuestionnaireResponse-extract.html) operation from the [HL7 FHIR Structured Data Capture Specification](http://hl7.org/fhir/uv/sdc/ImplementationGuide/hl7.fhir.uv.sdc) and is designed for [Modular Questionnaires](http://hl7.org/fhir/uv/sdc/modular.html#modular-questionnaires).

### Local development notes
It's recommended to run this library within a web app or a service if you're doing local development.
This library compiles to both CommonJS and ES Modules, so there is no problems in using it across web frameworks and Node-based backends.

To compile the code, use `npm run compile`.
To watch for changes, use `npm run watch`.

Note: Do not use `tsc` or `tsc -w` as it will only compile to ES Modules, which means it will not work with CommonJS-based implementations.




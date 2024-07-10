---
sidebar_position: 1
---

# Overview

Smart Forms is a web application designed to render FHIR Questionnaires.

It is intended to demonstrate the use of [HL7 FHIR](https://hl7.org/fhir/) specifications such as the [Structured Data Capture (SDC)](http://hl7.org/fhir/uv/sdc) and [SMART App Launch](http://hl7.org/fhir/smart-app-launch).

### Getting Started

This documentation is intended to provide a guide on how to use Smart Forms. It is divided into the following sections:
- [Components](/docs/components): A showcase of supported Questionnaire form components.
- [SDC](/docs/sdc): A section around the conformance and usage of functionalities defined in the SDC specification.
- [Developer Usage](/docs/dev): A guide on how to use the form renderer in your own application.
- [FHIR Operations](/docs/operations): A guide on using the $populate, $assemble and $extract operations.

### Referenced FHIR Specifications 

#### Structured Data Capture (SDC)
Smart Forms is built as a reference implementation for the Structured Data Capture standard.

Structured Data Capture provided a way to define forms in a structured, standard-based format with enhanced capabilities. A few notable capabilities include complex conditional logic, terminology bindings, calculations and more.

#### SMART App Launch
SMART App Launch is a framework that allows the app to be integrated within a healthcare system in a secure and efficient manner to capture standardised, structured health information for healthcare clients.



### Features

| Functionality                    | Description                                                                                                                                                         |
|----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Form population                  | Populate FHIR clinical data into forms, removing the need to re-enter generic information every time a new form is created, allows reusability of data.             |
| Conditional rendering            | Render form items conditionally based on user decisions or pre-determined data.                                                                                     |
| Built-in calculations            | Perform calculations based on form item answers to produce a calculated result.                                                                                     |
| Terminology binding              | Allows terminology binding via ValueSet resources with the help of a terminology server's $expand operation API.                                                    |
| QuestionnaireResponse write-back | A form can either be saved as a draft or as final, which will compile the form answers into a QuestionnaireResponse resource and store it on the CMS's FHIR server. |
| Form preview                     | Generate a human-readable preview of the QuestionnaireResponse which can be viewed while filling in the form or after the form is saved.                            |
| Generic form implementation      | The app tries its best to render any Questionnaire as long as it conforms to the FHIR specification!                                                                |



### Licensing and attribution
Smart Forms is a product of the [Australian e-Health Research Centre, CSIRO](https://aehrc.csiro.au/), licensed under the [Apache License, version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
This means that you are free to use, modify and redistribute the software as you wish, even for commercial purposes.

**Smart Forms is experimental software, use it at your own risk!** You can get a full description of the current set of known issues over on our [GitHub page](https://github.com/aehrc/smart-forms/issues).

[//]: # (add notes around saving preview in text.div)

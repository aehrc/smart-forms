# Smart Health Check Prototype

This Smart Health Check prototype application was developed by CSIRO AEHRC as part of the Primary Care Data Quality project funded by the Australian Government Department of Health.

The prototype is intended to demonstrate the use of HL7 FHIR Specifications to provide a shared Smart Health Check application that can be launched by a primary care Practice Management System (PMS) and capture standardised health check information for healthcare client.

The Smart Health Check prototype demonstrates the following capability:

- Secure launch from PMS within user's current patient context
- Render form using questionnaire definition file
- Pre-population of health check form with patient demographic and clinical data from PMS
- Conditional questions/groups based on previously entered data
- Advanced rendering of questions and groups (e.g. group tabs and look ahead lists)
- Repeating questions and answers
- Value set look ups from external terminology service
- Store questionnaire response data
- Extract observation data from questionnaire responses
- Advanced risk score calculations from previously entered data (e.g. CVD risk calculator)

The Smart Health Check Prototype uses the following HL7 FHIR specifications:

- [Questionnaire Resource](https://hl7.org/fhir/questionnaire.html)
- [QuestionnaireResponse Resource](https://hl7.org/fhir/questionnaireresponse.html)
- [Bundle Resource](https://hl7.org/fhir/bundle.html) ([Batch query](https://hl7.org/fhir/http.html#transaction))
- [ValueSet Resource](https://www.hl7.org/fhir/valueset.html)
- [Structured Data Capture (SDC) Implementation Guide](https://hl7.org/fhir/uv/sdc/)
- [FHIRPath](http://www.hl7.org/fhir/fhirpath.html)

The Smart Health Check Prototype uses the following JavaScript libraries:

- Angular 9.1
- [SMART Health FHIR JS library](http://docs.smarthealthit.org/client-js/)
- [FHIRPath.js](https://github.com/hl7/fhirpath.js/)

The prototype also uses the [Telstra Health Smart Forms Server](http://smartqedit4.azurewebsites.net/) as the Health Check Forms (Questionnaire) repository including the SDC [Questionnaire $populate](https://hl7.org/fhir/uv/sdc/OperationDefinition-Questionnaire-populate.html) and [QuestionnaireResponse $extract](http://hl7.org/fhir/uv/sdc/OperationDefinition-QuestionnaireResponse-extract.html) operations.

## Apache 2.0 License

The Smart Health Check prototype licence is [here](LICENSE).

# Setup Development Environment

## Prerequisites

The project requires the following prerequisites:

- Download and install Node.js from [nodejs.org](https://nodejs.org/en/download/)

## Clone GIT Repository

Clone this GIT source repository onto your local machine from https://github.com/aehrc/smart-forms-poc.git.

## Initialise App Dependencies

Change directory into the cloned repository folder.

```sh
cd smart-forms-poc
```

Note, if you have previously installed a later version of Angular, you may need to remove this version first, verify the cache and then install the specified version above.

```sh
npm uninstall -g @angular/cli
npm cache verify
```

Install Angular CLI with the specified version.

```sh
npm install -g @angular/cli@9.1.15
```

Install the package dependencies.

```sh
npm install
```

## Run App in Development Server

Compile the Application project and start the development server.

```sh
ng serve
```

Navigate to http://localhost:4200/ in your browser.

The app will automatically reload if you change any of the source files.

### Frequently Known Issues

If you get an error when starting the development server such as the following, you may need to delete the node_modules folder, install the package dependencies and start the development server again.

```sh
ERROR in ./node_modules/fhirpath/src/fhirpath.js 339:29
Module parse failed: Unexpected token (339:29)
You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
|           for (let t of actualTypes) {
|             let field = key + t;
>             toAdd = res.data?.[field];
|             _toAdd = res.data?.['_' + field];
|             if (toAdd !== undefined || _toAdd !== undefined) {
```

## Build App for Deployment

Build the Application project for deployment to server.

```
ng build
```

The build artifacts to be deployed will be stored in the `dist/` directory.

Use the `--prod` flag for a production build.

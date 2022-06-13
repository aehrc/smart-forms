# Smart Health Check Prototype 

This Smart Health Check prototype application was developed by CSIRO AEHRC as part of the Primary Care Data Quality project funded by the Australian Government Department of Health.

The prototype is intended to demonstrate the use of HL7 FHIR Specifications to provide a shared Smart Health Check application that can be launched by a primary care Practice Management System (PMS) and capture standardised health check information for healthcare client.

The Smart Health Check prototype demonstrates the following capability:
* Secure launch from PMS within user's current patient context 
* Render form using questionnaire definition file
* Pre-population of health check form with patient demographic and clinical data from PMS
* Conditional questions/groups based on previously entered data
* Advanced rendering of questions and groups (e.g. group tabs and look ahead lists)
* Repeating questions and answers
* Value set look ups from external terminology service
* Store questionnaire response data
* Extract observation data from questionnaire responses 
* Advanced risk score calculations from previously entered data (e.g. CVD risk calculator)

The Smart Health Check Prototype uses the following HL7 FHIR specifications:
* Questionnaire Resource
* QuestionnaireResponse Resource
* Bundle Resource (Batch query)
* ValueSet Resource
* [Structured Data Capture Implementation Guide](http://build.fhir.org/ig/HL7/sdc/)
* FHIRPath

The Smart Health Check Prototype uses the following JavaScript libraries:
* JavaScript and Angular 
* [SMART Health FHIR JS library](http://docs.smarthealthit.org/client-js/)
* [Telstra Health Smart Forms Server](http://smartqedit4.azurewebsites.net/) 


## Apache 2.0 License
The Smart Health Check prototype licence is [here](LICENSE).

## Prerequisites
The project requires the following prerequisites:
* Node.js (downloaded from [nodejs.org](https://nodejs.org/en/download/))

All other dependencies, including Angular, should be installed automatically.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.


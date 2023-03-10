# Smart Forms

Smart Forms is a Typescript-based [React](https://reactjs.org/) web application currently ongoing development by CSIRO AEHRC as part of the Primary Care Data Quality project funded by the Australian Government Department of Health.

The prototype is intended to demonstrate the use of HL7 FHIR Specifications to provide a shared Smart Health Check application that can be launched by a primary care Practice Management System (PMS) and capture standardised health check information for healthcare clients.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

---

**This repository contains:**

1. The Smart Forms React app
2. Two modules containing functionalities from the [Structured Data Capture (SDC) Specification of HL7 FHIR](http://hl7.org/fhir/uv/sdc/):

- [$populate](https://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-populate)
- [$assemble](https://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-assemble)

3. A [Questionnaire](https://hl7.org/fhir/questionnaire.html)-hosting Forms Server as part of our Common Services architecture which supports the $assemble operation. It is built on top of the [HAPI FHIR JPA Server](https://github.com/hapifhir/hapi-fhir-jpaserver-starter).

**This project is still ongoing development and should be used for testing purposes only.**

## Try it out here:

- Smart Forms React app: https://www.smartforms.io/
- Forms server: https://api.smartforms.io/

### Configuration

If you would like to use a different server for hosting questionnaire resources, you can edit the
**REACT_APP_FORMS_SERVER_URL** variable in the environment files.

It will be necessary to configure the REACT_APP_LAUNCH_* variables if you are connecting the app to your own client CMS.

### Running on a SMART CMS client (the preferred way)

1. Open https://launch.smarthealthit.org/ in a browser.
2. Set the **App Launch URL** at the bottom of the page as `https://www.smartforms.io/launch` and launch app.

![image](https://user-images.githubusercontent.com/52597778/223016492-882abdaf-33e9-4039-8c32-301c4cf58e91.png)

3. Alternatively, launch a specified questionnaire directly with `https://www.smartforms.io/launch?questionnaireUrl={questionnaire.url}`, with questionnaire.url being the absolute URI of the questionnaire: https://hl7.org/FHIR/questionnaire-definitions.html#Questionnaire.url. The questionnaire has to be stored in the forms server before you can launch it directly. You can use [Postman](https://www.postman.com/) to do so.

![image](https://user-images.githubusercontent.com/52597778/223016795-1b7b66d9-70c5-4a00-9fe6-b8e873a62c5b.png)

### Running in an unlaunched state

This method of running the app does not allow you to save responses as it is not connected to a CMS client.

1. Open https://www.smartforms.io/ in a browser.

**If you are keen on setting it up locally instead, follow the instructions below.**

## Setup Development Environment

### Prerequisites

The project requires the following prerequisites:

- Download and install Node.js from [nodejs.org](https://nodejs.org/en/download/)

### Clone Git Repository

Clone this Git source repository onto your local machine from https://github.com/aehrc/smart-forms.

### Initialise App dependencies

Install dependencies.

```sh
npm install
```

## Run app

Change directory into the directory containing the React app.

```sh
cd apps/smart-forms-react-app
```

Start the local server.

```sh
npm start
```

To run the app, follow the instructions [here](https://github.com/aehrc/smart-forms/edit/main/README.md#running-on-a-smart-cms-client-the-preferred-way) but replace https://www.smartforms.io/launch with http://localhost:3000/launch

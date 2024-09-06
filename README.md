<h1>Smart Forms</h1>
<h3>An open source FHIR powered forms app built in React</h3>
<h4>
Powered by SMART on FHIR and Structured Data Capture, Smart Forms allow you to easily integrate forms into your existing healthcare system.
</h4>

[![NPM](https://badge.fury.io/js/@aehrc%2Fsmart-forms-renderer.svg)](https://www.npmjs.com/package/@aehrc/smart-forms-renderer)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/aehrc/smart-forms?tab=Apache-2.0-1-ov-file#readme)

<h4><a href="https://smartforms.csiro.au">Show me the app ➡️</a></h4>

<h4><a href="https://smartforms.csiro.au/docs">Check out the documentation 📚</a></h4>

---
Smart Forms is a Typescript-based [React](https://reactjs.org/) forms web application currently ongoing development by [CSIRO's Australian e-Health Research Centre](https://aehrc.csiro.au/) as part of the Primary Care Data Quality project funded by the Australian Government Department of Health.

The web app is intended to demonstrate the use of [HL7 FHIR](https://hl7.org/fhir/) specifications, such as the [Questionnaire](https://hl7.org/fhir/questionnaire.html) and [QuestionnaireResponse](https://hl7.org/fhir/questionnaireresponse.html) resources, the Structured Data Capture (SDC) implementation guide, and most notably it leverages [SMART on FHIR capabilities](https://hl7.org/fhir/smart-app-launch/index.html) that allows the app to be launched by a primary care Clinical Management System (CMS) and capture standardised health check information for healthcare clients.

This project was bootstrapped with [Vite](https://vitejs.dev/).
<br/>

**If you are interested in using the form renderer in your React app, a standalone package is published on NPM as [@aehrc/smart-forms-renderer](https://www.npmjs.com/package/@aehrc/smart-forms-renderer).**

## Functionalities

**Smart Forms app**

| Functionality                    | Description                                                                                                                                                                    | Resources                                                                                                                                                            | Showcase 🖼️ (Right click -> Open link in new tab)                                                                                                        |
|----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| Form population                  | Populate FHIR clinical data into forms, removing the need to re-enter generic information every time a new form is created, allows reusability of data.                        | [SDC Populate](https://hl7.org/fhir/uv/sdc/populate.html)                                                                                                            | [Population of patient details](assets/population-patient-details.png)<br/>[Population of patient medical history](assets/population-medical-history.png) |
| Conditional rendering            | Render form items conditionally based on user decisions or pre-determined data.                                                                                                | [Questionnaire EnableWhen](https://hl7.org/fhir/questionnaire-definitions.html#Questionnaire.item.enableWhen)                                                        | [Form tabs and items presented differently for patients of different age groups](assets/enablewhen-age-groups.png)                                        |
| Built-in calculations            | Perform calculations based on form item answers to produce a calculated result, e.g. BMI, CVD Risk Score.                                                                      | [SDC Calculations](https://hl7.org/fhir/uv/sdc/behavior.html#calculations)                                                                                           | [Calculated BMI based on height and weight values](assets/calculation.png)                                                                                |
| ValueSet expansion               | Perform expansion of ValueSet resources via the Ontoserver $expand operation API within autocomplete, dropdown, radio button and checkbox fields.                              | [ValueSet expand](https://hl7.org/fhir/OperationDefinition/ValueSet-expand)<br/>[Ontoserver ValueSet API](https://ontoserver.csiro.au/docs/6/api-fhir-valueset.html) | [Ontoserver ValueSet Expansion in an Autocomplete component](assets/ontoserver-expand.png)                                                                |
| QuestionnaireResponse write-back | A form can either be saved as a draft or as final, which will compile the form answers into a QuestionnaireResponse resource and store it on the CMS's FHIR server via REST API. | [FHIR RESTful API](https://hl7.org/fhir/http.html)                                                                                                                                      | [List of responses in context of a patient](assets/responses.png)                                                                                         |
| Form preview                     | Generate a human-readable preview of the QuestionnaireResponse which can be viewed while filling in the form or after the form is saved.                                       | <div align="center">-</div>                                                                                                                                          | [Human-readable form preview](assets/preview.png)                                                                                                         |                                                      |
| Generic form implementation      | The app tries its best to render any Questionnaire as long as it conforms to the FHIR specification!                                                                           | [Questionnaire](https://hl7.org/fhir/questionnaire.html)<br/>[SDC](https://hl7.org/fhir/uv/sdc)                                                                                                                                          | [Rendering of an Australian absolute CVD Risk calculator questionnaire](assets/generic-form.png)                                                          |

NOTE: The patients featured in the screenshots are synthetic and do not represent any real people.

**Forms Server API**


| Functionality          | Description                                                                                                                                                                                                                                                                      | Resources                                                                                     |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| Modular questionnaires | Allows a questionnaire to be composed of sub-questionnaires which allows for reusability of questionnaire components i.e. a single tab within a form with multiple tabs. Subquestionnaires can be "assembled" to form a complete questionnaire with the **$assemble** operation. | [SDC Modular questionnaires](https://hl7.org/fhir/uv/sdc/modular.html#modular-questionnaires) |


## Contents

1. The Smart Forms web app. Try it out here: smartforms.csiro.au
2. Implemented operations from the [Structured Data Capture (SDC)](http://hl7.org/fhir/uv/sdc/) specification:
 - [$populate](https://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-populate)
 - [$assemble](https://hl7.org/fhir/uv/sdc/OperationDefinition/Questionnaire-assemble)
3. A standalone component of the questionnaire renderer published on NPM as [@aehrc/smart-forms-renderer](https://www.npmjs.com/package/@aehrc/smart-forms-renderer).

## Conformance

Here's the Structured Data Capture (SDC) conformance sheet for the Smart Forms app:
https://github.com/aehrc/smart-forms/blob/main/Conformance.md


## Usage

### Running on a SMART CMS client (the preferred way)

1. Open https://launch.smarthealthit.org/ (or your own SMART on FHIR enabled CMS) in a browser.
2. Set the **App Launch URL** at the bottom of the page as `https://smartforms.csiro.au/launch` and launch app.
   
![image](https://github.com/aehrc/smart-forms/assets/52597778/daa3b1be-e245-4d75-a766-a095dc81d8fc)


### Running in an unlaunched state

This method of running the app does not allow you to save responses as it is not connected to a CMS client.

1. Open https://smartforms.csiro.au in a browser.
2. You would have access to some pre-defined local questionnaires

NOTE: The app will not be able to view or save responses as it is not connected to a CMS client.

## Configuration

### Environment

The default configuration is set to:
```
# Ontoserver endpoint for $expand operations
# To run your own Ontoserver instance, contact us at https://ontoserver.csiro.au/site/contact-us/ontoserver-contact-form/
VITE_ONTOSERVER_URL=https://tx.ontoserver.csiro.au/fhir

# Questionnaire-hosting FHIR server
VITE_FORMS_SERVER_URL=https://smartforms.csiro.au/api/fhir

# Debug mode - set to true in dev mode
VITE_SHOW_DEBUG_MODE=false

# SMART App Launch scopes and launch contexts
# It will be necessary to tweak these variables if you are connecting the app to your own SMART on FHIR enabled CMS/EHR
VITE_LAUNCH_SCOPE=launch/patient patient/*.read offline_access openid fhirUser
VITE_LAUNCH_CLIENT_ID=smart-forms

```

In development mode, create a `.env.local` file in the `apps/smart-forms-app` directory and tweak the environment variables as needed.



### Run app locally

1. Clone this Git source repository onto your local machine from https://github.com/aehrc/smart-forms.

2. Install dependencies.

```sh
npm install
```

3. Change directory into the directory containing the Smart Forms app.

```sh
cd apps/smart-forms-app
```

4. Start the local server.

```sh
npm start
```

5. Follow the instructions [here](https://github.com/aehrc/smart-forms#usage) but replace https://smartforms.csiro.au/launch with http://localhost:5173/launch

## Feature requests and bug reports

If you find any bugs, feel free to [create an issue](https://github.com/aehrc/smart-forms/issues/new) and we will try our best to get it fixed.

If you have any feature suggestions, feel free to also create an issue. However, we will try to prioritise more general rather than use-case specific features due to resourcing constraints.

We are also accepting contributions to make the product better! Please read [CONTRIBUTING](CONTRIBUTING.md) or discuss on [zulip](https://chat.fhir.org/#narrow/stream/425534-smart-forms).

## Discussions

We encourage having discussions on [chat.fhir.org](https://chat.fhir.org/).

Smart Forms-related discussions can be raised in the Smart Forms's stream: https://chat.fhir.org/#narrow/stream/425534-smart-forms.

Any questionnnaire/SDC-related discussion can be raised in the questionnaire stream: https://chat.fhir.org/#narrow/stream/179255-questionnaire.

## Licensing and attribution

Smart Forms is copyright © 2022-2023, Commonwealth Scientific and Industrial
Research Organisation
(CSIRO) ABN 41 687 119 230. Licensed under
the [Apache License, version 2.0](https://www.apache.org/licenses/LICENSE-2.0).

This means that you are free to use, modify and redistribute the software as
you wish, even for commercial purposes.

**Smart Forms is experimental software at the moment, use it at your own risk!**

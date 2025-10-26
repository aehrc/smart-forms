<h1>Smart Forms</h1>
<h3>An open source FHIR powered forms app built in React</h3>
<h4>
Powered by SMART on FHIR and Structured Data Capture, Smart Forms allow you to easily integrate forms into your existing healthcare system.
</h4>

[![NPM](https://badge.fury.io/js/@aehrc%2Fsmart-forms-renderer.svg)](https://www.npmjs.com/package/@aehrc/smart-forms-renderer)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/aehrc/smart-forms?tab=Apache-2.0-1-ov-file#readme)

<h4><a href="https://smartforms.csiro.au">Show me the app ➡️</a></h4>

<h4><a href="https://smartforms.csiro.au/docs">Check out the documentation 📚</a></h4>

<h4><a href="https://smartforms.csiro.au/docs">Check out Questionnaire examples in Storybook 📚</a></h4>

---
Smart Forms is a Typescript-based [React](https://reactjs.org/) forms web application currently ongoing development by [CSIRO's Australian e-Health Research Centre](https://aehrc.csiro.au/) as part of the Primary Care Data Quality project funded by the Australian Government Department of Health.

The web app is intended to demonstrate the use of [HL7 FHIR](https://hl7.org/fhir/) specifications, such as the [Questionnaire](https://hl7.org/fhir/questionnaire.html) and [QuestionnaireResponse](https://hl7.org/fhir/questionnaireresponse.html) resources, the Structured Data Capture (SDC) implementation guide, and most notably it leverages [SMART on FHIR capabilities](https://hl7.org/fhir/smart-app-launch/index.html) that allows the app to be launched by a primary care Clinical Management System (CMS) and capture standardised health check information for healthcare clients.

This project was bootstrapped with [Vite](https://vitejs.dev/).
<br/>

**If you are interested in using the form renderer in your React app, an NPM library is published at [@aehrc/smart-forms-renderer](https://www.npmjs.com/package/@aehrc/smart-forms-renderer).**

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

## Local Development
Refer to [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for instructions on local development and running.


## Feature requests and bug reports

If you find any bugs, feel free to [create an issue](https://github.com/aehrc/smart-forms/issues/new) and we will try our best to get it fixed.

If you have any feature suggestions, feel free to also create an issue. However, we will try to prioritise more general rather than use-case specific features due to resourcing constraints.

We are also accepting contributions to make the product better! Please read [CONTRIBUTING](CONTRIBUTING.md) or discuss on [zulip](https://chat.fhir.org/#narrow/stream/425534-smart-forms).

## Discussions

We encourage having discussions on [chat.fhir.org](https://chat.fhir.org/).

Smart Forms-related discussions can be raised in the Smart Forms's stream: https://chat.fhir.org/#narrow/stream/425534-smart-forms.

Any questionnnaire/SDC-related discussion can be raised in the questionnaire stream: https://chat.fhir.org/#narrow/stream/179255-questionnaire.

## Licensing and attribution

Smart Forms is copyright © 2022-2025, Commonwealth Scientific and Industrial
Research Organisation
(CSIRO) ABN 41 687 119 230. Licensed under
the [Apache License, version 2.0](https://www.apache.org/licenses/LICENSE-2.0).

This means that you are free to use, modify and redistribute the software as
you wish, even for commercial purposes.

**Smart Forms is experimental software at the moment, use it at your own risk!**

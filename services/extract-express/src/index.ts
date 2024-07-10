/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import express from 'express';
import cors from 'cors';
import { getQuestionnaireResponse } from './questionnaireResponse';
import {
  createFailStructureMapConversionOutcome,
  createInvalidFhirMappingLanguageMap,
  createInvalidParametersOutcome,
  createInvalidQuestionnaireCanonicalOutcome,
  createNoFormsServerUrlSetOutcome,
  createNoQuestionnairesFoundOutcome,
  createNoTargetStructureMapCanonicalFoundOutcome,
  createNoTargetStructureMapFoundOutcome,
  createOperationOutcome
} from './operationOutcome';
import { getQuestionnaire } from './questionnaire';
import { getTargetStructureMap, getTargetStructureMapCanonical } from './structureMap';
import {
  createTransformInputParametersForConvert,
  createTransformInputParametersForExtract,
  invokeTransform
} from './transform';
import dotenv from 'dotenv';
import { getFhirMappingLanguageMap } from './fhirMappingLanguage';
import { getStructureMapFromDebugOutputParameters } from './debug';

const app = express();
const port = 3003;

// Configuring environment variables
dotenv.config();
const EHR_SERVER_URL = process.env['EHR_SERVER_URL'];
const EHR_SERVER_AUTH_TOKEN = process.env['EHR_SERVER_AUTH_TOKEN'];

const FORMS_SERVER_URL = process.env['FORMS_SERVER_URL'];
const FORMS_SERVER_AUTH_TOKEN = process.env['FORMS_SERVER_AUTH_TOKEN'];

app.use(
  cors({
    origin: '*'
  })
);

// Allows the app to accept JSON and URL encoded data up to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

// Allows the app to work behind reverse proxies, forwarding the correct req.protocol to the /StructureMap/$transform call
// Without this, doing a HTTPS $extract call will result in a HTTP $transform call
app.set('trust proxy', true);

app.get('/fhir/QuestionnaireResponse/\\$extract', (_, res) => {
  res.send(
    'This service is healthy!\nPerform a POST request to the same path for QuestionnaireResponse $extract.'
  );
});

app.post('/fhir/QuestionnaireResponse/\\$extract', async (req, res) => {
  let ehrServerUrl = req.protocol + '://' + req.get('host') + '/fhir';
  let ehrServerAuthToken: string | null = null;

  // Set EHR server URL and auth token if provided in env variables
  if (EHR_SERVER_URL) {
    ehrServerUrl = EHR_SERVER_URL;
    ehrServerAuthToken = EHR_SERVER_AUTH_TOKEN ?? null;
  }

  try {
    // Ensure forms server URL is set
    if (!FORMS_SERVER_URL) {
      const outcome = createNoFormsServerUrlSetOutcome();
      res.status(400).json(outcome);
      return;
    }

    const body = req.body;
    const questionnaireResponse = getQuestionnaireResponse(body);

    // Get QR resource from input parameters
    if (!questionnaireResponse) {
      const outcome = createInvalidParametersOutcome();
      res.status(400).json(outcome);
      return;
    }

    // Get Questionnaire canonical URL from QR resource
    const questionnaireCanonical = questionnaireResponse.questionnaire;
    if (!questionnaireCanonical) {
      const outcome = createInvalidQuestionnaireCanonicalOutcome();
      res.status(400).json(outcome);
      return;
    }

    // Get Questionnaire resource from it's canonical URL
    const questionnaire = await getQuestionnaire(
      questionnaireCanonical,
      FORMS_SERVER_URL,
      FORMS_SERVER_AUTH_TOKEN
    );
    if (!questionnaire) {
      const outcome = createNoQuestionnairesFoundOutcome(questionnaireCanonical, FORMS_SERVER_URL);
      res.status(400).json(outcome);
      return;
    }

    // Get target StructureMap canonical URL from Questionnaire resource
    const targetStructureMapCanonical = getTargetStructureMapCanonical(questionnaire);
    if (!targetStructureMapCanonical) {
      const outcome = createNoTargetStructureMapCanonicalFoundOutcome(
        questionnaire.id ?? questionnaireCanonical
      );
      res.status(400).json(outcome);
      return;
    }

    // Get target StructureMap resource from it's canonical URL
    const targetStructureMap = await getTargetStructureMap(
      targetStructureMapCanonical,
      FORMS_SERVER_URL,
      FORMS_SERVER_AUTH_TOKEN
    );
    if (!targetStructureMap) {
      const outcome = createNoTargetStructureMapFoundOutcome(
        questionnaireCanonical,
        FORMS_SERVER_URL
      );
      res.status(400).json(outcome);
      return;
    }

    const transformInputParameters = createTransformInputParametersForExtract(
      targetStructureMap,
      questionnaireResponse
    );

    const outputParameters = await invokeTransform(
      transformInputParameters,
      ehrServerUrl,
      ehrServerAuthToken ?? undefined
    );
    res.json(outputParameters); // Forwarding the JSON response to the client
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json(createOperationOutcome(error?.message)); // Sending the error message as an OperationOutcome
      return;
    }

    // If the error is not an instance of Error, send a generic error message
    res
      .status(500)
      .json(
        createOperationOutcome(
          'Something went wrong here. Please raise a GitHub issue at https://github.com/aehrc/smart-forms/issues/new'
        )
      );
  }
});

app.get('/fhir/\\$convert', (_, res) => {
  res.send(
    'This service is healthy!\nHowever, this server only supports StructureMap/$convert.\nPerform a POST request to /fhir/StructureMap/$convert to convert a FHIR Mapping Language map to a StructureMap resource.'
  );
});

app.get('/fhir/StructureMap/\\$convert', (_, res) => {
  res.send(
    'This service is healthy!\nPerform a POST request to the same path to convert a FHIR Mapping Language map to a StructureMap resource.'
  );
});

app.post('/fhir/StructureMap/\\$convert', async (req, res) => {
  let ehrServerUrl = req.protocol + '://' + req.get('host') + '/fhir';
  let ehrServerAuthToken: string | null = null;

  // Set EHR server URL and auth token if provided in env variables
  if (EHR_SERVER_URL) {
    ehrServerUrl = EHR_SERVER_URL;
    ehrServerAuthToken = EHR_SERVER_AUTH_TOKEN ?? null;
  }

  try {
    // Get FHIR Mapping Language map from the request body
    const body = req.body;
    const fhirMappingLanguageMap = getFhirMappingLanguageMap(body);

    if (!fhirMappingLanguageMap) {
      const outcome = createInvalidFhirMappingLanguageMap();
      res.status(400).json(outcome);
      return;
    }

    const transformInputParameters =
      createTransformInputParametersForConvert(fhirMappingLanguageMap);

    const outputParameters = await invokeTransform(
      transformInputParameters,
      ehrServerUrl,
      ehrServerAuthToken ?? undefined,
      true
    );

    // Get StructureMap resource from the output parameters
    const structureMap = getStructureMapFromDebugOutputParameters(outputParameters);
    if (!structureMap) {
      const outcome = createFailStructureMapConversionOutcome();
      res.status(400).json(outcome);
      return;
    }

    res.json(structureMap);
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json(createOperationOutcome(error?.message)); // Sending the error message as an OperationOutcome
      return;
    }

    // If the error is not an instance of Error, send a generic error message
    res
      .status(500)
      .json(
        createOperationOutcome(
          'Something went wrong here. Please raise a GitHub issue at https://github.com/aehrc/smart-forms/issues/new'
        )
      );
  }
});

app.listen(port, () => {
  console.log(`Transform Express app listening on port ${port}`);
});

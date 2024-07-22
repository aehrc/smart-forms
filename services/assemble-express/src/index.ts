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
import type { OutcomeParameter } from '@aehrc/sdc-assemble';
import { assemble, isInputParameters } from '@aehrc/sdc-assemble';
import type { RequestConfig } from './callback';
import { fetchQuestionnaireCallback } from './callback';
import dotenv from 'dotenv';
import {
  addEndpointToNotFoundIssues,
  createInvalidParametersOutcome,
  createOperationOutcome
} from './operationOutcome';
import { createInputParameters, isQuestionnaire } from './questionnaire';

const app = express();
const port = 3002;

// Configuring environment variables
dotenv.config();
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

// Allows the app to work behind reverse proxies, forwarding the correct req.protocol to the /StructureMap/$transform call
// Without this, doing a HTTPS $extract call will result in a HTTP $transform call
app.set('trust proxy', true);

app.get('/fhir/Questionnaire/\\$assemble', (_, res) => {
  res.send(
    'This service is healthy!\nPerform a POST request to the same path for Questionnaire $assemble.'
  );
});

app.post('/fhir/Questionnaire/\\$assemble', async (req, res) => {
  const formsServerRequestConfig: RequestConfig = {
    url: req.protocol + '://' + req.get('host') + '/fhir'
  };

  // Set Forms server URL and auth token if provided in env variables
  if (FORMS_SERVER_URL) {
    formsServerRequestConfig.url = FORMS_SERVER_URL;
    if (FORMS_SERVER_AUTH_TOKEN) {
      formsServerRequestConfig.authToken = FORMS_SERVER_AUTH_TOKEN;
    }
  }

  try {
    let body = req.body;

    // Request body is a Questionnaire resource, wrap it with $assemble's input parameters
    if (isQuestionnaire(body)) {
      body = createInputParameters(body);
    }

    if (!isInputParameters(body)) {
      const outcome = createInvalidParametersOutcome();
      res.status(400).json(outcome);
      return;
    }

    const outputParameters = await assemble(
      body,
      fetchQuestionnaireCallback,
      formsServerRequestConfig
    );

    // Return OperationOutcome as 400
    if (outputParameters.resourceType === 'OperationOutcome') {
      addEndpointToNotFoundIssues(outputParameters.issue, formsServerRequestConfig.url);
      res.status(400).json(outputParameters);
      return;
    }

    // Output parameters is a Parameters resource, add endpoint to "not-found" issues
    if (outputParameters.resourceType === 'Parameters') {
      const outcomeParameter = outputParameters.parameter.find(
        (param) => param.name === 'outcome'
      ) as OutcomeParameter | undefined;
      if (outcomeParameter && outcomeParameter?.resource?.issue) {
        addEndpointToNotFoundIssues(outcomeParameter.resource.issue, formsServerRequestConfig.url);
      }
    }

    // Return output parameters - could a Questionnaire or Parameters resource
    res.json(outputParameters);
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
  console.log(`Assemble Express app listening on port ${port}`);
});

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
import { isInputParameters, populate } from '@aehrc/sdc-populate';
import { fetchResourceCallback } from './callback';
import cors from 'cors';
import dotenv from 'dotenv';
import { createInvalidParametersOutcome, createOperationOutcome } from './operationOutcome';

const app = express();
const port = 3001;

// Configuring environment variables
dotenv.config();
const EHR_SERVER_URL = process.env['EHR_SERVER_URL'];
const EHR_SERVER_AUTH_TOKEN = process.env['EHR_SERVER_AUTH_TOKEN'];

app.use(
  cors({
    origin: '*'
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/fhir/Questionnaire/\\$populate', (_, res) => {
  res.send(
    'This service is healthy!\nPerform a POST request to the same path for Questionnaire $populate.'
  );
});

app.post('/fhir/Questionnaire/\\$populate', async (req, res) => {
  const requestConfig: {
    ehrServerUrl: string;
    ehrServerAuthToken: string | null;
  } = {
    ehrServerUrl: req.protocol + '://' + req.get('host') + '/fhir',
    ehrServerAuthToken: null
  };

  // Set EHR server URL and auth token if provided in env variables
  if (EHR_SERVER_URL) {
    requestConfig.ehrServerUrl = EHR_SERVER_URL;
    requestConfig.ehrServerAuthToken = EHR_SERVER_AUTH_TOKEN ?? null;
  }

  try {
    const body = req.body;

    // Check validity of input parameters
    if (!isInputParameters(body)) {
      const outcome = createInvalidParametersOutcome();
      res.status(400).json(outcome);
      return;
    }

    // Invoke sdc-populate
    const outputParameters = await populate(body, fetchResourceCallback, requestConfig);
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
  console.log(`Populate Express app listening on port ${port}`);
});

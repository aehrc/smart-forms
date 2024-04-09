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
import { assemble, isInputParameters } from '@aehrc/sdc-assemble';
import { fetchQuestionnaireCallback } from './callback';

const app = express();
const port = 3002;

app.use(
  cors({
    origin: '*'
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/fhir/Questionnaire/\\$assemble', (_, res) => {
  res.send(
    'This service is healthy!\nPerform a POST request to the same path for questionnaire assembly.'
  );
});

app.post('/fhir/Questionnaire/\\$assemble', (req, res) => {
  const parameters = req.body;

  if (isInputParameters(parameters)) {
    assemble(parameters, fetchQuestionnaireCallback)
      .then((output) => {
        res.json(output);
      })
      .catch((e) => res.status(400).json(e));
  } else {
    const operationOutcome = {
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'invalid',
          details: { text: 'Parameters provided is invalid against the $assemble specification.' }
        }
      ]
    };

    res.status(400).json(operationOutcome);
  }
});

app.listen(port, () => {
  console.log(`Assemble Express app listening on port ${port}`);
});

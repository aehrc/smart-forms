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
  createInvalidParametersOutcome,
  createInvalidQuestionnaireCanonicalOutcome,
  createNoQuestionnairesFoundOutcome,
  createNoTargetStructureMapCanonicalFoundOutcome,
  createNoTargetStructureMapFoundOutcome,
  createOperationOutcome
} from './operationOutcome';
import { getQuestionnaire } from './questionnaire';
import { getTargetStructureMap, getTargetStructureMapCanonical } from './structureMap';
import { createTransformInputParameters, invokeTransform } from './transform';

const app = express();
const port = 3003;

app.use(
  cors({
    origin: '*'
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/fhir/QuestionnaireResponse/\\$extract', (_, res) => {
  res.send(
    'This service is healthy!\nPerform a POST request to the same path for QuestionnaireResponse $extract.'
  );
});

// This $extract operation is hardcoded to use resources and $transform operations from fixed endpoints
const EHR_SERVER_URL = 'https://proxy.smartforms.io/fhir';
const FORMS_SERVER_URL = 'https://smartforms.csiro.au/api/fhir';
app.post('/fhir/QuestionnaireResponse/\\$extract', async (req, res) => {
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
  const questionnaire = await getQuestionnaire(questionnaireCanonical, FORMS_SERVER_URL);
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
    FORMS_SERVER_URL
  );
  if (!targetStructureMap) {
    const outcome = createNoTargetStructureMapFoundOutcome(
      questionnaireCanonical,
      FORMS_SERVER_URL
    );
    res.status(400).json(outcome);
    return;
  }

  //
  const transformInputParameters = createTransformInputParameters(
    targetStructureMap,
    questionnaireResponse
  );

  try {
    const outputParameters = await invokeTransform(transformInputParameters, EHR_SERVER_URL);
    res.json(outputParameters); // Forwarding the JSON response to the client
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json(createOperationOutcome(error?.message)); // Sending the error message as JSON response
    } else {
      res
        .status(500)
        .json(
          createOperationOutcome(
            'Something went wrong here. Please raise a GitHub issue at https://github.com/aehrc/smart-forms/issues/new'
          )
        );
    }
  }
});

app.listen(port, () => {
  console.log(`Transform Express app listening on port ${port}`);
});

/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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
  createNoEhrServerUrlSetOutcome,
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
import type { ExtractConfig } from './config';
import { allOutboundBases, displayBaseUrl, loadConfig } from './config';
import { installOutboundFetchGuard, OutboundRequestError } from './outboundUrl';

const port = 3003;

function sendError(res: express.Response, error: unknown) {
  console.error(error);
  if (error instanceof OutboundRequestError) {
    res.status(error.httpStatus).json(createOperationOutcome(error.message));
    return;
  }

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

/**
 * Creates the $extract and $convert Express app. StructureMap/$transform is invoked only on
 * EHR_SERVER_URL, and Questionnaires and StructureMaps are read only from FORMS_SERVER_URL; nothing
 * in the incoming request (such as the Host or X-Forwarded-* headers) selects a server.
 */
export function createApp(config: ExtractConfig): express.Express {
  const app = express();
  const { ehrServer, formsServer } = config;

  app.use(
    cors({
      origin: '*'
    })
  );

  // Allows the app to accept JSON and URL encoded data up to 50MB
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.text());

  // Allows the app to work behind reverse proxies. Proxy headers are not used to choose outbound servers.
  app.set('trust proxy', true);

  app.get('/fhir/QuestionnaireResponse/\\$extract', (_, res) => {
    res.send(
      'This service is healthy!\nPerform a POST request to the same path for QuestionnaireResponse $extract.'
    );
  });

  app.post('/fhir/QuestionnaireResponse/\\$extract', async (req, res) => {
    try {
      // Ensure forms server URL is set
      if (!formsServer) {
        const outcome = createNoFormsServerUrlSetOutcome();
        res.status(400).json(outcome);
        return;
      }

      // Ensure EHR server URL is set, it provides StructureMap/$transform
      if (!ehrServer) {
        const outcome = createNoEhrServerUrlSetOutcome();
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
      const questionnaire = await getQuestionnaire(questionnaireCanonical, formsServer);
      if (!questionnaire) {
        const outcome = createNoQuestionnairesFoundOutcome(
          questionnaireCanonical,
          displayBaseUrl(formsServer)
        );
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
        formsServer
      );
      if (!targetStructureMap) {
        const outcome = createNoTargetStructureMapFoundOutcome(
          questionnaireCanonical,
          displayBaseUrl(formsServer)
        );
        res.status(400).json(outcome);
        return;
      }

      const transformInputParameters = createTransformInputParametersForExtract(
        targetStructureMap,
        questionnaireResponse
      );

      const outputParameters = await invokeTransform(transformInputParameters, ehrServer);
      res.json(outputParameters); // Forwarding the JSON response to the client
    } catch (error) {
      sendError(res, error);
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
    try {
      // Ensure EHR server URL is set, it provides StructureMap/$transform
      if (!ehrServer) {
        const outcome = createNoEhrServerUrlSetOutcome();
        res.status(400).json(outcome);
        return;
      }

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

      const outputParameters = await invokeTransform(transformInputParameters, ehrServer, true);

      // Get StructureMap resource from the output parameters
      const structureMap = getStructureMapFromDebugOutputParameters(outputParameters);
      if (!structureMap) {
        const outcome = createFailStructureMapConversionOutcome();
        res.status(400).json(outcome);
        return;
      }

      res.json(structureMap);
    } catch (error) {
      sendError(res, error);
    }
  });

  return app;
}

function main() {
  // Configuring environment variables
  dotenv.config();
  const config = loadConfig(process.env);

  // Every outbound request in this process must go to a configured server
  installOutboundFetchGuard(allOutboundBases(config));

  const app = createApp(config);
  app.listen(port, () => {
    console.log(`Transform Express app listening on port ${port}`);
    if (!config.ehrServer) {
      console.log('EHR_SERVER_URL is not set: $extract and $convert will return an error.');
    }
  });
}

if (require.main === module) {
  main();
}

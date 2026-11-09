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
import type {
  FetchResourceRequestConfig,
  FetchTerminologyRequestConfig,
  IssuesParameter,
  ResponseParameter
} from '@aehrc/sdc-populate';
import { isInputParameters, populate } from '@aehrc/sdc-populate';
import { createFetchResourceCallback, createFetchTerminologyCallback } from './callback';
import dotenv from 'dotenv';
import {
  addEndpointToNotFoundIssues,
  createInvalidParametersOutcome,
  createOperationOutcome
} from './operationOutcome';
import type { PopulateConfig } from './config';
import { allOutboundBases, loadConfig, toLibraryBaseUrl } from './config';
import { installOutboundFetchGuard, OutboundRequestError } from './outboundUrl';

const port = 3001;

/**
 * Creates the $populate Express app. Every outbound server URL comes from the supplied configuration;
 * nothing in the incoming request (such as the Host or X-Forwarded-* headers) selects a server.
 */
export function createApp(config: PopulateConfig): express.Express {
  const app = express();

  const fetchResourceCallback = createFetchResourceCallback(config);
  const fetchTerminologyCallback = createFetchTerminologyCallback(config);

  // An empty sourceServerUrl tells sdc-populate (and fhirpath.js) that no EHR server is available
  const ehrServerUrl = config.ehrServer ? toLibraryBaseUrl(config.ehrServer.url) : null;
  const terminologyServerUrl = toLibraryBaseUrl(config.terminologyServer.url);

  app.use(
    cors({
      origin: '*'
    })
  );

  // Allows the app to accept JSON and URL encoded data up to 50MB
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Allows the app to work behind reverse proxies. Proxy headers are not used to choose outbound servers.
  app.set('trust proxy', true);

  app.get('/fhir/Questionnaire/\\$populate', (_, res) => {
    res.send(
      'This service is healthy!\nPerform a POST request to the same path for Questionnaire $populate.'
    );
  });

  app.post('/fhir/Questionnaire/\\$populate', async (req, res) => {
    const debugMode = req.query['debug'] === 'true';
    const ehrServerRequestConfig: FetchResourceRequestConfig = {
      sourceServerUrl: ehrServerUrl ?? ''
    };

    const terminologyServerRequestConfig: FetchTerminologyRequestConfig = {
      terminologyServerUrl: terminologyServerUrl
    };

    try {
      const body = req.body;

      // Check validity of input parameters
      if (!isInputParameters(body)) {
        const outcome = createInvalidParametersOutcome();
        res.status(400).json(outcome);
        return;
      }

      // Terminology requests always go through the guarded callback, using TERMINOLOGY_SERVER_URL
      // or the default terminology server
      const outputParameters = await populate(
        body,
        fetchResourceCallback,
        ehrServerRequestConfig,
        fetchTerminologyCallback,
        terminologyServerRequestConfig
      );

      // Return OperationOutcome as 400
      if (outputParameters.resourceType === 'OperationOutcome') {
        res.status(400).json(outputParameters);
        return;
      }

      // Filter contextResult-custom based on debug=true query parameter
      if (!debugMode) {
        const filtered = outputParameters.parameter.filter(
          (param) => param.name !== 'contextResult-custom'
        ) as [ResponseParameter, IssuesParameter] | [ResponseParameter];
        outputParameters.parameter = filtered;
      }

      // Return valid output params
      const issuesParameter = outputParameters.parameter.find(
        (param): param is IssuesParameter => param.name === 'issues'
      ) as IssuesParameter | undefined;
      if (issuesParameter) {
        addEndpointToNotFoundIssues(issuesParameter, ehrServerUrl);
      }
      res.json(outputParameters);
    } catch (error) {
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
  });

  return app;
}

function main() {
  // Configuring environment variables
  dotenv.config();
  const config = loadConfig(process.env);

  // Every outbound request in this process, including those made inside libraries, must go to a
  // configured server
  installOutboundFetchGuard(allOutboundBases(config));

  const app = createApp(config);
  app.listen(port, () => {
    console.log(
      `Populate Express app listening on port ${port}. ` +
        `If you're running this in Docker, remember to map your host port to ${port}.`
    );
    console.log(
      config.ehrServer
        ? `EHR server: ${config.ehrServer.url.href}`
        : 'EHR_SERVER_URL is not set: context must be supplied as resources, not references.'
    );
  });
}

if (require.main === module) {
  main();
}

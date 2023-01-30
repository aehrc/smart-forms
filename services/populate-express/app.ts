/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import populate, { isPopulateInputParameters } from 'sdc-populate';
import type { OperationOutcome } from 'fhir/r5';

const express = require('express');

const app = express();
const port = 3001;

app.use(express.json({ limit: '50mb' }));

app.post('/api', (req, res) => {
  const parameters = req.body;
  const operationOutcome: OperationOutcome = { issue: [], resourceType: 'OperationOutcome' };

  if (isPopulateInputParameters(parameters)) {
    try {
      const outputPopParams = populate(parameters);
      res.json(outputPopParams);
    } catch (err: unknown) {
      if (err instanceof Error) {
        operationOutcome.issue = [
          {
            severity: 'error',
            code: 'exception',
            details: {
              text: err.message
            }
          }
        ];
      }
      res.status(406).send(operationOutcome);
    }
  } else {
    operationOutcome.issue = [
      {
        severity: 'error',
        code: 'invalid',
        details: {
          text: 'Parameters provided is in an invalid format.'
        }
      }
    ];
    res.status(406).send(operationOutcome);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

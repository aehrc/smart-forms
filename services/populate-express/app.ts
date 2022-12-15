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

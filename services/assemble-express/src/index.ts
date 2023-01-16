import express from 'express';
import bodyParser from 'body-parser';
import assemble, { isAssembleInputParameters } from 'sdc-assemble';
import { createOperationOutcome } from 'sdc-assemble/lib/CreateOutcomes';

const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded());

const jsonParser = bodyParser.json();

app.get('/healthcheck', (_, res) => {
  res.send('This service is healthy!');
});

app.post('/fhir/\\$assemble', jsonParser, (req, res) => {
  const parameters = req.body;
  if (isAssembleInputParameters(req.body)) {
    assemble(parameters)
      .then((outputParams) => {
        res.json(outputParams.parameter[0].resource);
      })
      .catch((err) => res.status(400).json(err));
  } else {
    const operationOutcome = createOperationOutcome(
      'Parameters provided is invalid against the $assemble specification.'
    );
    res.status(400).json(operationOutcome);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

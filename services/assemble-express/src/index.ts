import express from 'express';
import assemble, { createOperationOutcome, isAssembleInputParameters } from 'sdc-assemble';

const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/fhir/\\$assemble', (_, res) => {
  res.send(
    'This service is healthy!\nPerform a POST request to the same path for questionnaire assembly.'
  );
});

app.post('/fhir/\\$assemble', (req, res) => {
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
  console.log(`Assemble Express app listening on port ${port}`);
});

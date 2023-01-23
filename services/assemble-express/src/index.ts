import express from 'express';
import assemble, { createOperationOutcome, isAssembleInputParameters } from 'sdc-assemble';
import { createLightship } from 'lightship';

const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/healthcheck', (_, res) => {
  res.send('This service is healthy!');
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

// @ts-ignore
const lightship = await createLightship();

const server = app
  .listen(port, () => {
    // Lightship default state is "SERVER_IS_NOT_READY". Therefore, you must signal
    // that the server is now ready to accept connections.
    lightship.signalReady();
    console.log(`Assemble express app listening on port ${port}`);
  })
  .on('error', () => {
    lightship.shutdown();
  });

lightship.registerShutdownHandler(() => {
  server.close();
});

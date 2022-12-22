import express from 'express';

const app = express();
const port = 3002;

app.get('/fhir/\\$assemble', (_, res) => {
  res.send('Hello world from assemble-express!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

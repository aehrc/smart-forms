const express = require('express');
const populate = require('sdc-populate');
const app = express();
const port = 3001;

app.use(express.json({ limit: '50mb' }));

app.post('/api', (req, res) => {
  const parameters = req.body;
  if (populate.isPopulateInputParameters(parameters)) {
    const outputPopParams = populate.default(parameters);
    res.json(outputPopParams.parameter[0].resource);
  } else {
    res.status(406).send({
      message: 'Parameters provided is in an invalid format.'
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

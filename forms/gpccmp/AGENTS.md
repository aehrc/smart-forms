# Local questionnaire server

To serve the GPCCMP questionnaires locally, run the following commands from this directory:

```bash
cd questionnaire
docker run -p 8002:8000 -e CORS_ALLOW_ALL=true -v ./:/app/resources/Questionnaire bedasoftware/fhirsnake
```

The questionnaire server will be available at `http://localhost:8002`.

# Viewing the questionnaire

Before starting the app, set `formsServerUrl` in
`../../apps/smart-forms-app/public/config.json` to the local questionnaire server:

```json
"formsServerUrl": "http://localhost:8002"
```

Then keep the questionnaire server running and start `smart-forms-app` in a second terminal:

```bash
cd ../../apps/smart-forms-app
npm start
```

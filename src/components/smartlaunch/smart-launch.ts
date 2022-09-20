import * as FHIR from 'fhirclient';

export function launch() {
  // SMART.init({
  //   iss: process.env.REACT_APP_ISSUER ?? 'https:///launch.smarthealthit.org/v/r4/fhir',
  //   redirectUri: 'index.html',
  //   clientId: process.env.REACT_APP_CLIENT_ID ?? 'a2317248-5ee1-44f5-9098-73e1c5db4b32',
  //   scope:
  //     process.env.REACT_APP_SCOPE ??
  //     'launch/patient patient/*.read patient/Observation.write offline_access openid fhirUser'
  // }).then((client) => console.log(client));
  const client = FHIR.client('https://r4.smarthealthit.org');
  client.request('Patient').then(console.log).catch(console.error);

  client
    .request('Patient/87a339d0-8cae-418e-89c7-8651e6aab3c6')
    .then(console.log)
    .catch(console.error);
}

export function launchTest() {
  const client = FHIR.client({
    serverUrl: 'https://r4.smarthealthit.org',
    tokenResponse: {
      patient: '87a339d0-8cae-418e-89c7-8651e6aab3c6'
    }
  });

  client.request(`Patient/${client.patient.id}`).then(console.log).catch(console.error);
}

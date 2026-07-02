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

import { GenericContainer, Network, Wait } from 'testcontainers';

const HAPI_PORT = 8080;
const LAUNCHER_PORT = 80;

// Minimal FHIR resources — only fields needed for SMART launch context and pre-pop queries.
const SEED_RESOURCES = [
  {
    resourceType: 'Patient',
    id: 'pat-sf',
    name: [
      {
        use: 'official',
        text: 'Mrs. Smart Form',
        family: 'Form',
        given: ['Smart'],
        prefix: ['Mrs']
      }
    ],
    gender: 'female',
    birthDate: '1968-10-11'
  },
  {
    resourceType: 'Practitioner',
    id: 'primary-peter',
    name: [{ family: 'Primary', given: ['Peter'], prefix: ['Dr'] }]
  },
  {
    resourceType: 'Encounter',
    id: 'health-check-pat-sf',
    status: 'in-progress',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory'
    },
    subject: { reference: 'Patient/pat-sf' }
  }
];

export default async function globalSetup() {
  const network = await new Network().start();

  // HAPI FHIR — wait for metadata endpoint to confirm readiness (can take ~60s on first boot).
  const hapiContainer = await new GenericContainer('hapiproject/hapi:latest')
    .withNetwork(network)
    .withNetworkAliases('hapi-fhir')
    .withExposedPorts(HAPI_PORT)
    .withWaitStrategy(
      Wait.forHttp('/fhir/metadata', HAPI_PORT).forStatusCode(200).withStartupTimeout(180_000)
    )
    .start();

  const hapiHostPort = hapiContainer.getMappedPort(HAPI_PORT);
  const hapiHostBaseUrl = `http://localhost:${hapiHostPort}/fhir`;

  await seedFhirResources(hapiHostBaseUrl);

  // smart-launcher-v2 proxies FHIR requests to HAPI via the shared Docker network.
  const launcherContainer = await new GenericContainer('aehrc/smart-launcher-v2:latest')
    .withNetwork(network)
    .withExposedPorts(LAUNCHER_PORT)
    .withEnvironment({ FHIR_SERVER_R4: 'http://hapi-fhir:8080/fhir' })
    .withWaitStrategy(
      Wait.forHttp('/v/r4/fhir/metadata', LAUNCHER_PORT)
        .forStatusCode(200)
        .withStartupTimeout(60_000)
    )
    .start();

  const launcherHostPort = launcherContainer.getMappedPort(LAUNCHER_PORT);
  process.env.PLAYWRIGHT_LOCAL_EHR_URL = `http://localhost:${launcherHostPort}/v/r4/fhir`;

  return async () => {
    await launcherContainer.stop();
    await hapiContainer.stop();
    await network.stop();
  };
}

async function seedFhirResources(baseUrl: string) {
  for (const resource of SEED_RESOURCES) {
    const response = await fetch(`${baseUrl}/${resource.resourceType}/${resource.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/fhir+json' },
      body: JSON.stringify(resource)
    });
    if (!response.ok) {
      throw new Error(
        `Failed to seed ${resource.resourceType}/${resource.id}: ${response.status} ${await response.text()}`
      );
    }
  }
}

/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import type Client from 'fhirclient/lib/Client';
import type { Encounter, Patient, Practitioner } from 'fhir/r4';

export async function readPatient(client: Client): Promise<Patient> {
  return await client.patient.read();
}

export async function readUser(client: Client): Promise<Practitioner> {
  return (await client.user.read()) as Practitioner;
}

export async function readEncounter(client: Client): Promise<Encounter> {
  return (await client.encounter.read()) as Encounter;
}

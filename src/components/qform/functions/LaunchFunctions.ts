import Client from 'fhirclient/lib/Client';
import { Patient, Practitioner } from 'fhir/r5';

export async function getPatient(client: Client): Promise<Patient> {
  return await client.patient.read();
}

export async function getUser(client: Client): Promise<Practitioner> {
  return (await client.user.read()) as Practitioner;
}

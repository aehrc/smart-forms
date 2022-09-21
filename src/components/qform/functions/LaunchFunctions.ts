import Client from 'fhirclient/lib/Client';
import { fhirclient } from 'fhirclient/lib/types';

export async function getPatient(client: Client): Promise<fhirclient.FHIR.Patient> {
  return await client.patient.read();
}

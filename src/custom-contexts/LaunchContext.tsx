import * as React from 'react';
import { LaunchContextType } from '../interfaces/ContextTypes';
import Client from 'fhirclient/lib/Client';
import { Patient, Practitioner } from 'fhir/r5';

export const LaunchContext = React.createContext<LaunchContextType>({
  fhirClient: null,
  patient: null,
  user: null,
  setFhirClient: () => void 0,
  setPatient: () => void 0,
  setUser: () => void 0
});

function LaunchContextProvider(props: { children: any }) {
  const { children } = props;
  const [client, setClient] = React.useState<Client | null>(null);
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [user, setUser] = React.useState<Practitioner | null>(null);

  const launchContext: LaunchContextType = {
    fhirClient: client,
    patient: patient,
    user: user,
    setFhirClient: (client: Client) => {
      setClient(client);
    },
    setPatient: (patient: Patient) => {
      setPatient(patient);
    },
    setUser: (user: Practitioner) => {
      setUser(user);
    }
  };
  return <LaunchContext.Provider value={launchContext}>{children}</LaunchContext.Provider>;
}

export default LaunchContextProvider;

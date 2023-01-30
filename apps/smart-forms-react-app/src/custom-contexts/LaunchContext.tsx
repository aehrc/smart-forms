/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import React, { useState } from 'react';
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

function LaunchContextProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const [client, setClient] = useState<Client | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [user, setUser] = useState<Practitioner | null>(null);

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

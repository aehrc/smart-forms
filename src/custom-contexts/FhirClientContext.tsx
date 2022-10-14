import * as React from 'react';
import { FhirClientContextType } from '../interfaces/Interfaces';
import Client from 'fhirclient/lib/Client';

export const FhirClientContext = React.createContext<FhirClientContextType>({
  fhirClient: null,
  setFhirClient: () => void 0
});

function FhirClientProvider(props: { children: any }) {
  const { children } = props;
  const [client, setClient] = React.useState<Client | null>(null);

  const fhirClientContext: FhirClientContextType = {
    fhirClient: client,
    setFhirClient: (client: Client) => {
      setClient(client);
    }
  };
  return (
    <FhirClientContext.Provider value={fhirClientContext}>{children}</FhirClientContext.Provider>
  );
}

export default FhirClientProvider;

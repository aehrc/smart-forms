import * as React from 'react';
import { getPatient } from './functions/LaunchFunctions';
import Client from 'fhirclient/lib/Client';
import { useState } from 'react';
import QForm from './QForm';
import ProgressSpinner from './ProgressSpinner';

interface Props {
  client: Client;
}

function QPage(props: Props) {
  const { client } = props;

  const patient = getPatient(client);
  patient
    .then((patientName) => {
      setLoading(false);
      console.log(patientName);
    })
    .catch((error) => {
      setLoading(false);
      console.log(error);
    });

  const [loading, setLoading] = useState(true);

  const renderQPage = loading ? <ProgressSpinner /> : <QForm />;

  return <div>{renderQPage}</div>;
}

export default QPage;

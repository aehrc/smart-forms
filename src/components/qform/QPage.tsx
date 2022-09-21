import React, { useContext, useState } from 'react';
import QForm from './QForm';
import ProgressSpinner from './ProgressSpinner';
import { PatientContext } from '../../App';

function QPage() {
  const patient = useContext(PatientContext);

  const [loading, setLoading] = useState(true);

  const renderQPage = loading ? <ProgressSpinner /> : <QForm />;

  return <div>{renderQPage}</div>;
}

export default QPage;

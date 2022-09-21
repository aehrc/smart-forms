import React, { useContext, useEffect, useState } from 'react';
import QForm from './QForm';
import ProgressSpinner from './ProgressSpinner';
import { PatientContext } from '../../App';

function QPage() {
  const [loading, setLoading] = useState(true);

  const patient = useContext(PatientContext);

  useEffect(() => {
    if (patient) {
      setLoading(false);
    }
  }, [patient]);

  const renderQPage = loading ? <ProgressSpinner /> : <QForm />;

  return <div>{renderQPage}</div>;
}

export default QPage;

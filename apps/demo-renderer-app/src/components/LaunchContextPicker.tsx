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

import type { Patient, Practitioner } from 'fhir/r4';
import type { ChangeEvent } from 'react';
import useLaunchContext from '../hooks/useLaunchContext.ts';
import { patientIsValid, practitionerIsValid } from '../utils/fetchResource.ts';
import { Button } from '@/components/ui/button.tsx';

interface LaunchContextPickerProps {
  patient: Patient | null;
  practitioner: Practitioner | null;
  bearerToken: string | null;
  onPatientChange: (newPatient: Patient | null) => void;
  onPractitionerChange: (newPractitioner: Practitioner | null) => void;
}

function LaunchContextPicker(props: LaunchContextPickerProps) {
  const { patient, practitioner, bearerToken, onPatientChange, onPractitionerChange } = props;

  const { patientBundle, practitionerBundle, isFetchingPatient, isFetchingPractitioner } =
    useLaunchContext(bearerToken);

  function handleSelectPatient(e: ChangeEvent<HTMLSelectElement>) {
    const patientId = e.target.value;

    if (!patientId || patientId.length === 0 || !patientBundle) {
      onPatientChange(null);
      return;
    }

    const patient = patientBundle.entry?.find((entry) => entry.resource?.id === patientId)
      ?.resource as Patient;

    if (!patient) {
      onPatientChange(null);
      return;
    }

    onPatientChange(patient);
  }

  function handleSelectPractitioner(e: ChangeEvent<HTMLSelectElement>) {
    const practitionerId = e.target.value;

    if (!practitionerId || practitionerId.length === 0 || !practitionerBundle) {
      onPractitionerChange(null);
      return;
    }

    const practitioner = practitionerBundle.entry?.find(
      (entry) => entry.resource?.id === practitionerId
    )?.resource as Practitioner;

    if (!practitioner) {
      onPractitionerChange(null);
      return;
    }

    onPractitionerChange(practitioner);
  }

  if (!bearerToken) {
    return <p>Bearer token not provided. Pre-population not available.</p>;
  }

  if (isFetchingPatient || isFetchingPractitioner) {
    return (
      <p>
        Loading patient and practitioner dropdowns...
        <span>If it takes longer than usual, token might be expired.</span>
      </p>
    );
  }

  if (!patientBundle || !practitionerBundle) {
    return (
      <>
        <p>Could not load patient and practitioner dropdowns. Pre-population not available.</p>
        <p>Possible due to expired bearer token. Request a new token above.</p>
      </>
    );
  }

  return (
    <div>
      <div className="flex gap-3 items-center">
        <label htmlFor="dropdownPatient">Select a patient: </label>
        <select
          id="dropdownPatient"
          name="patient"
          value={patient?.id ?? ''}
          className="cursor-pointer"
          onChange={handleSelectPatient}>
          <option value="">No patient selected</option>
          {patientBundle.entry?.map((entry) => {
            const resource = entry.resource;

            if (!resource || !patientIsValid(resource)) {
              return null;
            }

            const patient = resource as Patient;

            return (
              <option key={patient.id} value={patient.id}>
                {patient.name?.[0].given?.[0]} {patient.name?.[0].family}
              </option>
            );
          })}
        </select>

        <br />

        <label htmlFor="dropdownPractitioner">Select a practitioner: </label>
        <select
          id="dropdownPractitioner"
          name="practitioner"
          value={practitioner?.id ?? ''}
          className="cursor-pointer"
          onChange={handleSelectPractitioner}>
          <option value="">No practitioner selected</option>
          {practitionerBundle.entry?.map((entry) => {
            const resource = entry.resource;

            if (!resource || !practitionerIsValid(resource)) {
              return null;
            }

            const practitioner = resource as Practitioner;

            return (
              <option key={practitioner.id} value={practitioner.id}>
                {practitioner.name?.[0].given?.[0]} {practitioner.name?.[0].family}
              </option>
            );
          })}
        </select>

        <Button
          size="sm"
          variant="secondary"
          className="increase-button-hitbox"
          onClick={() => {
            if (patientBundle.entry?.[0].resource) {
              onPatientChange(patientBundle.entry?.[0].resource as Patient);
            }

            if (practitionerBundle.entry?.[0].resource) {
              onPractitionerChange(practitionerBundle.entry?.[0].resource as Practitioner);
            }
          }}>
          Select first item from dropdowns
        </Button>
      </div>
    </div>
  );
}

export default LaunchContextPicker;

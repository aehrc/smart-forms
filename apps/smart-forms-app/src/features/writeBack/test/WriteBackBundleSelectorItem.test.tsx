/*
 * Copyright 2026 Commonwealth Scientific and Industrial Research
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

import { fireEvent, render, screen } from '@testing-library/react';
import type { BundleEntry, OperationOutcomeIssue } from 'fhir/r4';
import WriteBackBundleSelectorItem from '../components/WriteBackBundleSelectorItem';

const bundleEntry: BundleEntry = {
  resource: { resourceType: 'Bundle', type: 'document' },
  request: { method: 'POST', url: 'Bundle' }
};

function renderItem(validationIssues?: OperationOutcomeIssue[]) {
  return render(
    <WriteBackBundleSelectorItem
      bundleEntry={bundleEntry}
      bundleEntryIndex={0}
      selectedKeys={new Set()}
      allValidKeys={new Set(['bundle-0'])}
      populatedResourceMap={new Map()}
      validationIssues={validationIssues}
      isEntrySelected={() => false}
      onToggleCheckbox={jest.fn()}
    />
  );
}

describe('WriteBackBundleSelectorItem', () => {
  it('has an enabled checkbox and no issue list when the entry is valid', () => {
    renderItem();

    expect(screen.getByRole('checkbox')).toBeEnabled();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('disables the checkbox and lists the validation issues when the entry is invalid', () => {
    renderItem([
      {
        severity: 'error',
        code: 'invariant',
        diagnostics: 'Constraint failed: ch-ekm-patient-birthdate',
        expression: ['Bundle']
      },
      { severity: 'error', code: 'required', details: { text: 'Composition is missing' } }
    ]);

    expect(screen.getByRole('checkbox')).toBeDisabled();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Constraint failed: ch-ekm-patient-birthdate')).toBeInTheDocument();
    expect(screen.getByText('Composition is missing')).toBeInTheDocument();
  });

  it('copies the resource of an invalid entry to the clipboard', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderItem([{ severity: 'error', code: 'invalid', diagnostics: 'Invalid' }]);
    fireEvent.click(screen.getByRole('button', { name: 'Copy JSON' }));

    expect(writeText).toHaveBeenCalledWith(JSON.stringify(bundleEntry.resource, null, 2));
    expect(await screen.findByRole('button', { name: 'Copied to clipboard' })).toBeInTheDocument();
  });
});

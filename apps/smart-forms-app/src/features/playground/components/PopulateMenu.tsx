/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
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

import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';
import { CircularProgress, Tooltip } from '@mui/material';
import type { Patient, Practitioner } from 'fhir/r4';
import PrePopulateMenuItem from './PrePopulateMenuItem.tsx';
import RePopulateMenuItem from './RePopulateMenuItem.tsx';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';
import RepopulateDialog from '../../repopulate/components/RepopulateDialog.tsx';

interface PopulateMenuProps {
  sourceFhirServerUrl: string | null;
  patient: Patient | null;
  user: Practitioner | null;
  terminologyServerUrl: string;
  spinner: RendererSpinner;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
}

function PopulateMenu(props: PopulateMenuProps) {
  const { sourceFhirServerUrl, patient, user, terminologyServerUrl, spinner, onSpinnerChange } =
    props;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [repopulatedContext, setRepopulatedContext] = useState<Record<string, any>>({});

  const open = Boolean(anchorEl);

  const populateEnabled = sourceFhirServerUrl !== null && patient !== null;

  const isPrePopulating = spinner.isSpinning && spinner.status === 'prepopulate';
  const isRePopulating = spinner.isSpinning && spinner.status === 'repopulate-fetch';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const repopulateFetchEnded = !spinner.isSpinning && spinner.status === 'repopulate-fetch';

  return (
    <>
      <Tooltip
        title={
          populateEnabled
            ? 'Pre-populate form'
            : 'Please select a patient in the Launch Context settings (located on the top right) to enable pre-population'
        }>
        <span>
          <Button
            id="populate-button"
            aria-controls={open ? 'populate-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            sx={{ my: 0.5 }}
            endIcon={
              isPrePopulating || isRePopulating ? (
                <CircularProgress size={16} color="inherit" sx={{ ml: 0.25 }} />
              ) : (
                <KeyboardArrowDown />
              )
            }
            disabled={isPrePopulating || isRePopulating || !populateEnabled}
            onClick={handleClick}>
            {isPrePopulating ? 'Pre-populating...' : isRePopulating ? 'Re-populating' : 'Populate'}
          </Button>
        </span>
      </Tooltip>

      <Menu
        id="populate-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          list: {
            'aria-labelledby': 'populate-button'
          }
        }}>
        <PrePopulateMenuItem
          sourceFhirServerUrl={sourceFhirServerUrl}
          patient={patient}
          user={user}
          terminologyServerUrl={terminologyServerUrl}
          onSpinnerChange={onSpinnerChange}
          onCloseMenu={handleClose}
        />

        <RePopulateMenuItem
          sourceFhirServerUrl={sourceFhirServerUrl}
          patient={patient}
          user={user}
          terminologyServerUrl={terminologyServerUrl}
          onSpinnerChange={onSpinnerChange}
          onCloseMenu={handleClose}
          onSetRepopulatedContext={(newRepopulatedContext) =>
            setRepopulatedContext(newRepopulatedContext)
          }
        />
      </Menu>

      <RepopulateDialog
        repopulatedContext={repopulatedContext}
        repopulateFetchingEnded={repopulateFetchEnded}
        onCloseDialog={() => onSpinnerChange({ isSpinning: false, status: null, message: '' })}
        onSpinnerChange={onSpinnerChange}
      />
    </>
  );
}

export default PopulateMenu;

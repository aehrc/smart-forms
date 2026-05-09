import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { fetchResourceCallback } from './PrePopCallbackForPlayground.tsx';
import { rendererConfigStore, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import type { Encounter, Patient, Practitioner, PractitionerRole } from 'fhir/r4';
import { ListItemIcon, ListItemText } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';
import { resetAndBuildForm } from '../../../utils/manageForm.ts';
import { useSnackbar } from 'notistack';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';
import {
  extractWarningLinkIds,
  formatPopulateIssuesForUser
} from '../../prepopulate/utils/prepopulateIssues.ts';

interface PrePopulateMenuItemProps {
  sourceFhirServerUrl: string | null;
  patient: Patient | null;
  user: Practitioner | null;
  encounter: Encounter | null;
  practitionerRole: PractitionerRole | null;
  terminologyServerUrl: string;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
  onCloseMenu: () => void;
}

function PrePopulateMenuItem(props: PrePopulateMenuItemProps) {
  const {
    sourceFhirServerUrl,
    patient,
    user,
    encounter,
    practitionerRole,
    terminologyServerUrl,
    onSpinnerChange,
    onCloseMenu
  } = props;

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const { enqueueSnackbar } = useSnackbar();

  const populateEnabled = sourceFhirServerUrl !== null && patient !== null;

  // Event handler for pre-populate
  function handlePrepopulate() {
    onCloseMenu();

    if (!populateEnabled) {
      return;
    }

    onSpinnerChange({
      isSpinning: true,
      status: 'prepopulate',
      message: ''
    });

    populateQuestionnaire({
      questionnaire: sourceQuestionnaire,
      fetchResourceCallback: fetchResourceCallback,
      fetchResourceRequestConfig: {
        sourceServerUrl: sourceFhirServerUrl,
        authToken: null
      },
      patient: patient,
      user: user ?? undefined,
      encounter: encounter ?? undefined,
      fhirContext: practitionerRole
        ? [{ reference: `PractitionerRole/${practitionerRole.id}` }]
        : undefined
    })
      .then(async ({ populateSuccess, populateResult }) => {
        if (!populateSuccess || !populateResult) {
          onSpinnerChange({ isSpinning: false, status: null, message: '' });
          enqueueSnackbar('Form could not be pre-populated.', {
            variant: 'warning',
            action: <CloseSnackbar variant="warning" />
          });
          return;
        }

        const { populatedResponse, issues, populatedContext } = populateResult;

        // Call to buildForm to pre-populate the QR which repaints the entire BaseRenderer view
        // Also passes the populatedContext to the FhirPathContext
        await resetAndBuildForm({
          questionnaire: sourceQuestionnaire,
          questionnaireResponse: populatedResponse,
          terminologyServerUrl,
          additionalContext: populatedContext
        });

        onSpinnerChange({ isSpinning: false, status: null, message: '' });

        if (issues) {
          rendererConfigStore
            .getState()
            .setRendererConfig({ prepopulationWarningLinkIds: extractWarningLinkIds(issues) });
          enqueueSnackbar(formatPopulateIssuesForUser(issues), {
            variant: 'warning',
            persist: true,
            action: <CloseSnackbar variant="warning" />
          });
          console.warn('Pre-population issues:', issues);
        } else {
          rendererConfigStore
            .getState()
            .setRendererConfig({ prepopulationWarningLinkIds: new Set() });
          enqueueSnackbar('Form pre-populated.', { action: <CloseSnackbar /> });
        }
      })
      .catch(() => {
        onSpinnerChange({ isSpinning: false, status: null, message: '' });
        enqueueSnackbar('Form could not be pre-populated.', {
          variant: 'warning',
          action: <CloseSnackbar variant="warning" />
        });
      });
  }

  return (
    <MenuItem onClick={handlePrepopulate}>
      <ListItemIcon>
        <CloudDownloadIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Pre-populate (Replace whole form) [{POPULATE_VERSION}]</ListItemText>
    </MenuItem>
  );
}

export default PrePopulateMenuItem;

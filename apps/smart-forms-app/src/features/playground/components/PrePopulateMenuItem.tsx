import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { fetchResourceCallback } from './PrePopCallbackForPlayground.tsx';
import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import type { Patient, Practitioner } from 'fhir/r4';
import { ListItemIcon, ListItemText } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';
import { resetAndBuildForm } from '../../../utils/manageForm.ts';

interface PrePopulateMenuItemProps {
  sourceFhirServerUrl: string | null;
  patient: Patient | null;
  user: Practitioner | null;
  terminologyServerUrl: string;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
  onCloseMenu: () => void;
}

function PrePopulateMenuItem(props: PrePopulateMenuItemProps) {
  const { sourceFhirServerUrl, patient, user, terminologyServerUrl, onSpinnerChange, onCloseMenu } =
    props;

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();

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
      user: user ?? undefined
    }).then(async ({ populateSuccess, populateResult }) => {
      if (!populateSuccess || !populateResult) {
        onSpinnerChange({
          isSpinning: false,
          status: null,
          message: ''
        });
        return;
      }

      const { populatedResponse, populatedContext } = populateResult;

      // Call to buildForm to pre-populate the QR which repaints the entire BaseRenderer view
      // Also passes the populatedContext to the FhirPathContext
      await resetAndBuildForm({
        questionnaire: sourceQuestionnaire,
        questionnaireResponse: populatedResponse,
        terminologyServerUrl,
        additionalVariables: populatedContext
      });

      onSpinnerChange({
        isSpinning: false,
        status: null,
        message: ''
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

import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { fetchResourceCallback } from './PrePopCallbackForPlayground.tsx';
import { buildFormWrapper } from '../../../utils/manageForm.ts';
import type { Patient, Practitioner } from 'fhir/r4';
import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import { ListItemIcon, ListItemText } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';

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
  const setPopulatedContext = useQuestionnaireStore.use.setPopulatedContext();

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
      await buildFormWrapper(
        sourceQuestionnaire,
        populatedResponse,
        undefined,
        terminologyServerUrl,
        populatedContext
      );

      // TODO eventually we want to deprecate this in 1.0.0, populatedContext is now passed to buildFormWrapper and is automatically added to the FhirPathContext
      if (populatedContext) {
        setPopulatedContext(populatedContext, true);
      }

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

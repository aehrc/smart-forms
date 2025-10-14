import { populateQuestionnaire } from '@aehrc/sdc-populate';
import { fetchResourceCallback } from './PrePopCallbackForPlayground.tsx';
import type { Patient, Practitioner } from 'fhir/r4';
import { generateItemsToRepopulate, useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import { ListItemIcon, ListItemText } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import { useRepopulationStore } from '../../repopulate/stores/RepopulationStore.ts';
import type { RendererSpinner } from '../../renderer/types/rendererSpinner.ts';
import CloudSyncIcon from '@mui/icons-material/CloudSync';

interface RePopulateMenuItemProps {
  sourceFhirServerUrl: string | null;
  patient: Patient | null;
  user: Practitioner | null;
  terminologyServerUrl: string;
  onSpinnerChange: (newSpinner: RendererSpinner) => void;
  onCloseMenu: () => void;
  onSetRepopulatedContext: (context: Record<string, any>) => void;
}

function RePopulateMenuItem(props: RePopulateMenuItemProps) {
  const {
    sourceFhirServerUrl,
    patient,
    user,
    onSpinnerChange,
    onCloseMenu,
    onSetRepopulatedContext
  } = props;

  const setItemsToRepopulate = useRepopulationStore.use.setItemsToRepopulate();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();

  const populateEnabled = sourceFhirServerUrl !== null && patient !== null;

  // Event handler for pre-populate
  function handleRepopulate() {
    onCloseMenu();

    if (!populateEnabled) {
      return;
    }

    onSpinnerChange({
      isSpinning: true,
      status: 'repopulate-fetch',
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
        onSpinnerChange({ isSpinning: false, status: null, message: '' });
        return;
      }

      const { populatedResponse, populatedContext } = populateResult;

      // If populatedContext is provided, save it into repopulatedContext state to add it to additionalContext later when buildForm is called
      if (populatedContext) {
        onSetRepopulatedContext(populatedContext);
      }

      // Determine items to repopulate to let the user select
      const itemToRepopulate = generateItemsToRepopulate(populatedResponse);
      setItemsToRepopulate(itemToRepopulate);

      onSpinnerChange({ isSpinning: false, status: 'repopulate-fetch', message: '' });
    });
  }

  return (
    <MenuItem onClick={handleRepopulate}>
      <ListItemIcon>
        <CloudSyncIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>Re-populate form (Update selected fields) [{POPULATE_VERSION}]</ListItemText>
    </MenuItem>
  );
}

export default RePopulateMenuItem;

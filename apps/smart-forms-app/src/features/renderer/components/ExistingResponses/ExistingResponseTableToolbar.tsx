import {
  getExistingResponsesToolBarColors,
  StyledRoot
} from '../../../dashboard/components/DashboardPages/QuestionnairePage/TableComponents/QuestionnaireListToolbar.styles.ts';
import { Box, LinearProgress } from '@mui/material';
import type { QuestionnaireResponse } from 'fhir/r4';
import ExistingResponsesTableToolbarButtons from './ExistingResponsesTableToolbarButtons.tsx';
import ExistingResponsesTableToolbarLeftSection from './ExistingResponsesTableToolbarLeftSection.tsx';

interface ExistingResponseTableToolbarProps {
  selectedResponse: QuestionnaireResponse | null;
  isFetching: boolean;
  onClearSelection: () => void;
}

function ExistingResponseTableToolbar(props: ExistingResponseTableToolbarProps) {
  const { selectedResponse, isFetching, onClearSelection } = props;

  const toolBarColors = getExistingResponsesToolBarColors(selectedResponse);

  return (
    <>
      <StyledRoot sx={{ ...toolBarColors }}>
        <ExistingResponsesTableToolbarLeftSection selectedResponse={selectedResponse} />
        <ExistingResponsesTableToolbarButtons
          selectedResponse={selectedResponse}
          onClearSelection={onClearSelection}
        />
      </StyledRoot>
      {isFetching ? <LinearProgress /> : <Box pt={0.5} sx={{ ...toolBarColors }} />}
    </>
  );
}

export default ExistingResponseTableToolbar;

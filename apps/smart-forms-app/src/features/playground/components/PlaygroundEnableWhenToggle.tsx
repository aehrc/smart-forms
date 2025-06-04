import { useQuestionnaireStore } from '@aehrc/smart-forms-renderer';
import ToggleButton from '@mui/material/ToggleButton';
import DisabledVisibleIcon from '@mui/icons-material/DisabledVisible';
import { Tooltip } from '@mui/material';

function PlaygroundEnableWhenToggle() {
  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const toggleEnableWhenActivation = useQuestionnaireStore.use.toggleEnableWhenActivation();

  return (
    <Tooltip title="Show all items regardless of enableWhen">
      <span>
        <ToggleButton
          value={enableWhenIsActivated}
          color="primary"
          size="small"
          selected={!enableWhenIsActivated}
          sx={{ height: 32 }}
          onChange={() => toggleEnableWhenActivation(!enableWhenIsActivated)}>
          <DisabledVisibleIcon />
        </ToggleButton>
      </span>
    </Tooltip>
  );
}

export default PlaygroundEnableWhenToggle;

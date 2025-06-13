import { useQuestionnaireStore, useRendererStylingStore } from '@aehrc/smart-forms-renderer';
import ToggleButton from '@mui/material/ToggleButton';
import DisabledVisibleIcon from '@mui/icons-material/DisabledVisible';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import { Tooltip } from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

function PlaygroundCustomisationToggles() {
  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const toggleEnableWhenActivation = useQuestionnaireStore.use.toggleEnableWhenActivation();
  const quantityComparatorFieldHidden = useRendererStylingStore.use.hideQuantityComparatorField();
  const setRendererStyling = useRendererStylingStore.use.setRendererStyling();

  return (
    <ToggleButtonGroup aria-label="Renderer customisation toggles">
      <Tooltip title="Show quantity comparator field">
        <ToggleButton
          value={quantityComparatorFieldHidden}
          color="primary"
          size="small"
          selected={!quantityComparatorFieldHidden}
          sx={{ height: 32 }}
          onChange={() =>
            setRendererStyling({
              hideQuantityComparatorField: !quantityComparatorFieldHidden
            })
          }>
          <SquareFootIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Show all items regardless of enableWhen/enableWhenExpression">
        <ToggleButton
          value={enableWhenIsActivated}
          color="primary"
          size="small"
          selected={!enableWhenIsActivated}
          sx={{ height: 32 }}
          onChange={() => toggleEnableWhenActivation(!enableWhenIsActivated)}>
          <DisabledVisibleIcon />
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
}

export default PlaygroundCustomisationToggles;

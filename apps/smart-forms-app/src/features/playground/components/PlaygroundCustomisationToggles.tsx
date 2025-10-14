import { useQuestionnaireStore, useRendererConfigStore } from '@aehrc/smart-forms-renderer';
import ToggleButton from '@mui/material/ToggleButton';
import DisabledVisibleIcon from '@mui/icons-material/DisabledVisible';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import EditOffIcon from '@mui/icons-material/EditOff';
import { Tooltip } from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

function PlaygroundCustomisationToggles() {
  const enableWhenIsActivated = useQuestionnaireStore.use.enableWhenIsActivated();
  const toggleEnableWhenActivation = useQuestionnaireStore.use.toggleEnableWhenActivation();

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const quantityComparatorFieldHidden = useRendererConfigStore.use.hideQuantityComparatorField();
  const setRendererConfig = useRendererConfigStore.use.setRendererConfig();

  return (
    <ToggleButtonGroup aria-label="Renderer customisation toggles">
      <Tooltip
        title={`Toggle item.readOnly=true items as HTML attribute 'disabled' or 'readonly'. Current setting: ${readOnlyVisualStyle}`}>
        <ToggleButton
          value={readOnlyVisualStyle === 'disabled'}
          color="primary"
          size="small"
          selected={readOnlyVisualStyle === 'disabled'}
          sx={{ height: 32 }}
          onChange={() =>
            setRendererConfig({
              readOnlyVisualStyle: readOnlyVisualStyle === 'disabled' ? 'readonly' : 'disabled'
            })
          }>
          <EditOffIcon />
        </ToggleButton>
      </Tooltip>
      <Tooltip title="Show quantity comparator field">
        <ToggleButton
          value={quantityComparatorFieldHidden}
          color="primary"
          size="small"
          selected={!quantityComparatorFieldHidden}
          sx={{ height: 32 }}
          onChange={() =>
            setRendererConfig({
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

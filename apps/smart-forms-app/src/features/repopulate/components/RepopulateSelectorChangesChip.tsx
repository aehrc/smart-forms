import type { SxProps } from '@mui/material';
import { Chip } from '@mui/material';
import type { ValueChangeMode } from '../utils/itemsToRepopulateSelector.ts';
import { getChipColorByValueChangeMode } from '../utils/itemsToRepopulateSelector.ts';

interface RepopulateSelectorChangesViewerChipProps {
  valueChangeMode: ValueChangeMode;
  sx?: SxProps;
}

function RepopulateSelectorChangesChip(props: RepopulateSelectorChangesViewerChipProps) {
  const { valueChangeMode, sx } = props;

  const color = getChipColorByValueChangeMode(valueChangeMode);

  return (
    <Chip
      label={valueChangeMode}
      color={color}
      size="small"
      sx={{ height: '18px', fontSize: '11px', ...sx }}
    />
  );
}

export default RepopulateSelectorChangesChip;

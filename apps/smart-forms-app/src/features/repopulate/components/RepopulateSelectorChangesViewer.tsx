import { Typography } from '@mui/material';
import { RepopulateSelectorChangesGrid } from './RepopulateSelectorChangesGrid.tsx';
import type {
  ItemToRepopulateAnswers,
  ValueChangeMode
} from '../utils/itemsToRepopulateSelector.ts';
import { getDiffBackgroundColor } from '../utils/itemsToRepopulateSelector.ts';

interface RepopulateSelectorItemChangeViewerProps {
  itemToRepopulateAnswers: ItemToRepopulateAnswers;
  valueChangeMode: ValueChangeMode;
  isRepeatGroup: boolean;
}

function RepopulateSelectorChangesViewer(props: RepopulateSelectorItemChangeViewerProps) {
  const { itemToRepopulateAnswers, valueChangeMode, isRepeatGroup } = props;

  // Only one answer row, renderer it in a simplified format
  if (itemToRepopulateAnswers.length === 1) {
    const { currentValue, serverValue } = itemToRepopulateAnswers[0];

    // New value added to patient record
    if (!currentValue && serverValue) {
      return (
        <>
          <Typography component="span" color="text.secondary">
            Patient record value:
          </Typography>{' '}
          <Typography
            component="span"
            fontWeight={700}
            sx={{ backgroundColor: getDiffBackgroundColor('server', false) }}>
            {serverValue ?? '-'}
          </Typography>
        </>
      );
    }

    // Current value removed from patient record
    if (currentValue && !serverValue) {
      return (
        <>
          <Typography component="span" color="text.secondary">
            Current value:
          </Typography>{' '}
          <Typography
            component="span"
            fontWeight={700}
            sx={{ backgroundColor: getDiffBackgroundColor('current', false) }}>
            {currentValue ?? '-'}
          </Typography>
        </>
      );
    }

    return (
      <>
        <Typography component="span" color="text.secondary">
          Current value:
        </Typography>{' '}
        <Typography
          component="span"
          fontWeight={700}
          sx={{ backgroundColor: getDiffBackgroundColor('current', false) }}>
          {currentValue ?? '-'}
        </Typography>{' '}
        <Typography component="span" color="text.secondary" sx={{ mx: 0.5 }}>
          &rarr;
        </Typography>{' '}
        <Typography component="span" color="text.secondary">
          Patient record value:
        </Typography>{' '}
        <Typography
          component="span"
          fontWeight={700}
          sx={{ backgroundColor: getDiffBackgroundColor('server', false) }}>
          {serverValue ?? '-'}
        </Typography>
      </>
    );
  }

  // From this point there are multiple answer rows, render as a grid
  return (
    <RepopulateSelectorChangesGrid
      itemToRepopulateAnswers={itemToRepopulateAnswers}
      valueChangeMode={valueChangeMode}
      isRepeatGroup={isRepeatGroup}
    />
  );
}

export default RepopulateSelectorChangesViewer;

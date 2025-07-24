import { Box, Checkbox, Typography } from '@mui/material';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import RepopulateSelectorChangesViewer from './RepopulateSelectorChangesViewer.tsx';
import { useMemo } from 'react';
import { getAnswerValueAsString } from '../utils/answerFormatters.ts';
import type { ItemToRepopulateAnswers } from '../utils/itemsToRepopulateSelector.ts';
import { getValueChangeMode } from '../utils/itemsToRepopulateSelector.ts';
import RepopulateSelectorChangesChip from './RepopulateSelectorChangesChip.tsx';

interface RepopulateSelectorNonRepeatGroupProps {
  itemToRepopulate: ItemToRepopulate;
  headingIndex: number;
  parentItemIndex: number;
  isEntrySelected: (
    headingIndex: number,
    parentItemIndex: number,
    childItemIndex?: number
  ) => boolean | 'indeterminate';
  onToggleCheckbox: (
    headingIndex: number,
    parentItemIndex: number,
    childItemIndex?: number
  ) => void;
}

function RepopulateSelectorNonRepeatGroup(props: RepopulateSelectorNonRepeatGroupProps) {
  const { itemToRepopulate, headingIndex, parentItemIndex, isEntrySelected, onToggleCheckbox } =
    props;

  // Pair up current and server answers for table display
  const itemToRepopulateAnswers: ItemToRepopulateAnswers = useMemo(() => {
    const itemText = itemToRepopulate.qItem?.text ?? null;
    const currentAnswers = itemToRepopulate.currentQRItem?.answer ?? [];
    const serverAnswers = itemToRepopulate.serverQRItem?.answer ?? [];
    const maxNumOfAnswers = Math.max(currentAnswers.length, serverAnswers.length);

    return Array.from({ length: maxNumOfAnswers }).map((_, i) => ({
      itemText: itemText,
      currentValue: currentAnswers[i] ? getAnswerValueAsString(currentAnswers[i]) : null,
      serverValue: serverAnswers[i] ? getAnswerValueAsString(serverAnswers[i]) : null
    }));
  }, [itemToRepopulate]);

  // Determine the value changes mode for the item
  const valueChangeMode = useMemo(() => {
    return getValueChangeMode(itemToRepopulateAnswers);
  }, [itemToRepopulateAnswers]);

  // Determine if checkbox is checked
  const checkedState = isEntrySelected(headingIndex, parentItemIndex);
  const checkboxIsChecked = typeof checkedState === 'boolean' ? checkedState : false;
  const checkboxIsIndeterminate = typeof checkedState !== 'boolean';

  // Compute item display name
  let itemDisplay = itemToRepopulate.qItem?.text || 'Unnamed item';
  if (itemToRepopulate.isInGrid && itemToRepopulate.parentItemText) {
    itemDisplay = `${itemToRepopulate.parentItemText} - ${itemDisplay}`;
  }

  return (
    <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Checkbox
          checked={checkboxIsChecked}
          indeterminate={checkboxIsIndeterminate}
          onChange={() => onToggleCheckbox(headingIndex, parentItemIndex)}
        />
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
          {/* Show resource display name (e.g. Condition code.display) and resourceType */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center'
              }}>
              <Typography
                variant="h6"
                component="span"
                sx={{
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere'
                }}>
                {itemDisplay}
              </Typography>
              <RepopulateSelectorChangesChip valueChangeMode={valueChangeMode} sx={{ ml: 1 }} />
            </Box>

            {/* Value comparison viewer */}
            <Box sx={{ mt: 1 }}>
              <RepopulateSelectorChangesViewer
                itemToRepopulateAnswers={itemToRepopulateAnswers}
                valueChangeMode={valueChangeMode}
                isRepeatGroup={false}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default RepopulateSelectorNonRepeatGroup;

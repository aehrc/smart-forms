import { Box, Checkbox, Typography } from '@mui/material';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import RepopulateSelectorChangesViewer from './RepopulateSelectorChangesViewer.tsx';
import { useMemo } from 'react';
import { getAnswerValueAsString } from '../utils/answerFormatters.ts';
import {
  getValueChangeMode,
  type ItemToRepopulateAnswers
} from '../utils/itemsToRepopulateSelector.ts';
import RepopulateSelectorChangesChip from './RepopulateSelectorChangesChip.tsx';
import { structuredDataCapture } from 'fhir-sdc-helpers';
import { deepEqual } from 'fast-equals';

interface RepopulateSelectorRepeatGroupItemProps {
  itemToRepopulate: ItemToRepopulate;
  headingIndex: number;
  parentItemIndex: number;
  childItemIndex: number;
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

function RepopulateSelectorRepeatGroupItem(props: RepopulateSelectorRepeatGroupItemProps) {
  const {
    itemToRepopulate,
    headingIndex,
    parentItemIndex,
    childItemIndex,
    isEntrySelected,
    onToggleCheckbox
  } = props;

  // Get current and server items
  const childQRItem = itemToRepopulate.currentQRItems?.[childItemIndex];
  const serverQRItem = itemToRepopulate.serverQRItems?.[childItemIndex];

  // Pair up current and server answers for grid display
  const childItemAnswers: ItemToRepopulateAnswers = useMemo(() => {
    // Create maps for current and server items by linkId
    const currentItemMap = new Map(childQRItem?.item?.map((item) => [item.linkId, item]) ?? []);
    const serverItemMap = new Map(serverQRItem?.item?.map((item) => [item.linkId, item]) ?? []);

    // Iterate over childQItems to create combined answers
    const childQItems = itemToRepopulate.qItem?.item ?? [];
    return (
      childQItems
        // Filter out items with http://hl7.org/fhir/StructureDefinition/questionnaire-hidden extension
        .filter((qItem) => !structuredDataCapture.getHidden(qItem))
        // Get answers for each item
        .map((qItem) => {
          const itemText = qItem.text ?? null;
          const currentAnswers = currentItemMap.get(qItem.linkId)?.answer ?? [];
          const serverAnswers = serverItemMap.get(qItem.linkId)?.answer ?? [];

          return {
            itemText: itemText,
            currentValue: currentAnswers.map(getAnswerValueAsString).join(', ') || null,
            serverValue: serverAnswers.map(getAnswerValueAsString).join(', ') || null
          };
        })
    );
  }, [childQRItem?.item, itemToRepopulate.qItem?.item, serverQRItem?.item]);

  // Determine value change mode for this child
  const childValueChangeMode = useMemo(() => {
    return getValueChangeMode(childItemAnswers);
  }, [childItemAnswers]);

  // Skip rendering if both items are identical
  if (childQRItem && serverQRItem) {
    const currentAndServerEqual = deepEqual(childQRItem, serverQRItem);
    if (currentAndServerEqual) {
      return null;
    }
  }

  // Determine child checkbox state
  const childCheckedState = isEntrySelected(headingIndex, parentItemIndex, childItemIndex);
  const childCheckboxIsChecked = typeof childCheckedState === 'boolean' ? childCheckedState : false;
  const childCheckboxIsIndeterminate = typeof childCheckedState !== 'boolean';

  return (
    <Box
      key={childItemIndex}
      sx={{
        ml: 0.5,
        mt: 1,
        p: 1.5,
        pl: 1,
        backgroundColor: 'grey.50',
        borderRadius: 1,
        borderLeft: 3,
        borderLeftColor: 'primary.main'
      }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Checkbox
          checked={childCheckboxIsChecked}
          indeterminate={childCheckboxIsIndeterminate}
          onChange={() => onToggleCheckbox(headingIndex, parentItemIndex, childItemIndex)}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography>Item {childItemIndex + 1}</Typography>
            <RepopulateSelectorChangesChip valueChangeMode={childValueChangeMode} />
          </Box>

          {/* Value comparison viewer for child */}
          <RepopulateSelectorChangesViewer
            itemToRepopulateAnswers={childItemAnswers}
            valueChangeMode={childValueChangeMode}
            isRepeatGroup={true}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default RepopulateSelectorRepeatGroupItem;

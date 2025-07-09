import { Box, Checkbox, Typography } from '@mui/material';
import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import RepopulateSelectorRepeatGroupItem from './RepopulateSelectorRepeatGroupItem.tsx';
import { getChildItemEntryCounts } from '../utils/itemsToRepopulateSelector.ts';

interface RepopulateSelectorRepeatGroupProps {
  itemToRepopulate: ItemToRepopulate;
  headingIndex: number;
  parentItemIndex: number;
  selectedKeys: Set<string>;
  allValidKeys: Set<string>;
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

function RepopulateSelectorRepeatGroup(props: RepopulateSelectorRepeatGroupProps) {
  const {
    itemToRepopulate,
    headingIndex,
    parentItemIndex,
    selectedKeys,
    allValidKeys,
    isEntrySelected,
    onToggleCheckbox
  } = props;

  // Determine parent checkbox state
  const parentCheckedState = isEntrySelected(headingIndex, parentItemIndex);
  const parentCheckboxIsChecked = parentCheckedState === true;
  const parentCheckboxIsIndeterminate = parentCheckedState === 'indeterminate';

  // Determine the number of items to show
  const currentItemsCount = itemToRepopulate.currentQRItems?.length ?? 0;
  const serverItemsCount = itemToRepopulate.serverQRItems?.length ?? 0;
  const maxItemsCount = Math.max(currentItemsCount, serverItemsCount);

  // Get number of selected operations and valid operations
  const { numOfSelectedChildItems, numOfValidChildItems } = getChildItemEntryCounts(
    headingIndex,
    parentItemIndex,
    selectedKeys,
    allValidKeys
  );

  // Compute item display name
  let itemDisplay = itemToRepopulate.qItem?.text || 'Unnamed item';
  if (itemToRepopulate.isInGrid && itemToRepopulate.parentItemText) {
    itemDisplay = `${itemToRepopulate.parentItemText} - ${itemDisplay}`;
  }

  return (
    <Box sx={{ border: 1, borderColor: 'grey.300', borderRadius: 1, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Parent group checkbox */}
        <Checkbox
          checked={parentCheckboxIsChecked}
          indeterminate={parentCheckboxIsIndeterminate}
          onChange={() => onToggleCheckbox(headingIndex, parentItemIndex)}
        />
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
          {/* Show item.text as display */}
          <Box>
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
          </Box>
        </Box>
      </Box>

      {/* Render each child item */}
      <Box mt={1} ml={1}>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          {numOfSelectedChildItems} of {numOfValidChildItems} items selected
        </Typography>
        {Array.from({ length: maxItemsCount }).map((_, childItemIndex) => (
          <RepopulateSelectorRepeatGroupItem
            key={childItemIndex}
            itemToRepopulate={itemToRepopulate}
            headingIndex={headingIndex}
            parentItemIndex={parentItemIndex}
            childItemIndex={childItemIndex}
            isEntrySelected={isEntrySelected}
            onToggleCheckbox={onToggleCheckbox}
          />
        ))}
      </Box>
    </Box>
  );
}

export default RepopulateSelectorRepeatGroup;

import type { ItemToRepopulate } from '@aehrc/smart-forms-renderer';
import RepopulateSelectorNonRepeatGroup from './RepopulateSelectorNonRepeatGroup.tsx';
import RepopulateSelectorRepeatGroup from './RepopulateSelectorRepeatGroup.tsx';

interface RepopulateSelectorItemProps {
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

function RepopulateSelectorItem(props: RepopulateSelectorItemProps) {
  const {
    itemToRepopulate,
    headingIndex,
    parentItemIndex,
    selectedKeys,
    allValidKeys,
    isEntrySelected,
    onToggleCheckbox
  } = props;

  // Determine if this is a repeat group
  const isRepeatGroup =
    Array.isArray(itemToRepopulate.currentQRItems) && itemToRepopulate.currentQRItems.length > 0;

  // For non-repeat groups
  if (!isRepeatGroup) {
    return (
      <RepopulateSelectorNonRepeatGroup
        itemToRepopulate={itemToRepopulate}
        headingIndex={headingIndex}
        parentItemIndex={parentItemIndex}
        isEntrySelected={isEntrySelected}
        onToggleCheckbox={onToggleCheckbox}
      />
    );
  }

  // For repeating groups
  return (
    <RepopulateSelectorRepeatGroup
      itemToRepopulate={itemToRepopulate}
      headingIndex={headingIndex}
      parentItemIndex={parentItemIndex}
      selectedKeys={selectedKeys}
      allValidKeys={allValidKeys}
      isEntrySelected={isEntrySelected}
      onToggleCheckbox={onToggleCheckbox}
    />
  );
}

export default RepopulateSelectorItem;

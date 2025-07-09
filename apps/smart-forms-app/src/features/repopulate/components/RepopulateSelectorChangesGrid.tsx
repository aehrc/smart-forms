import type { SxProps } from '@mui/material';
import { Box, Typography } from '@mui/material';
import type {
  ItemToRepopulateAnswers,
  ValueChangeMode
} from '../utils/itemsToRepopulateSelector.ts';
import {
  getDiffBackgroundColor,
  getGridColumnHeadersByValueChangeMode,
  getGridTemplateColumnsByValueChangeMode
} from '../utils/itemsToRepopulateSelector.ts';

interface RepopulateSelectorChangesGridProps {
  itemToRepopulateAnswers: ItemToRepopulateAnswers;
  valueChangeMode: ValueChangeMode;
  isRepeatGroup: boolean;
}

export function RepopulateSelectorChangesGrid(props: RepopulateSelectorChangesGridProps) {
  const { itemToRepopulateAnswers, valueChangeMode, isRepeatGroup } = props;

  // Determine columns headers based on mode
  const columnHeaders = getGridColumnHeadersByValueChangeMode(valueChangeMode, isRepeatGroup);

  // Adjust grid columns depending on mode
  const gridLayoutSx: SxProps = {
    display: 'grid',
    gridTemplateColumns: getGridTemplateColumnsByValueChangeMode(valueChangeMode, isRepeatGroup),
    gap: 1.5,
    justifyItems: 'center',
    alignItems: 'center'
  };

  return (
    <Box
      sx={{
        borderRadius: 1,
        border: 1,
        borderColor: 'grey.300',
        overflow: 'auto'
      }}>
      {/* Table Header */}
      <Box sx={{ ...gridLayoutSx, backgroundColor: 'grey.200' }}>
        {columnHeaders.map(({ key, label }) => (
          <Box key={key} p={1}>
            <Typography fontWeight="bold">{label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Grid Rows */}
      {itemToRepopulateAnswers.map((answers, rowIndex) => {
        const { itemText, currentValue, serverValue } = answers;

        // Check if values are changed to determine whether to bold the text
        const valuesMatch = currentValue === serverValue;

        return (
          <Box
            key={rowIndex}
            sx={{
              ...gridLayoutSx,
              borderTop: 1,
              borderColor: 'grey.300',
              backgroundColor: rowIndex % 2 === 0 ? 'background.paper' : 'grey.50'
            }}>
            {columnHeaders.map(({ key: columnKey, label: columnLabel }) => {
              // Render itemText column (only if this is a repeat group)
              if (columnKey === 'itemText') {
                if (isRepeatGroup) {
                  return (
                    <Box
                      sx={{
                        width: '100%',
                        borderRight: 1,
                        borderColor: 'grey.300'
                      }}
                      key={columnKey}>
                      <Box p={1}>
                        <Typography
                          fontWeight="bold"
                          title={itemText ?? undefined}
                          sx={{
                            justifySelf: 'start'
                          }}>
                          {itemText ?? '-'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }

                return null;
              }

              // Render arrow column
              if (columnKey === 'arrow') {
                return (
                  <Box key={columnKey} p={1}>
                    <Typography
                      color={valuesMatch ? 'text.secondary' : 'text.primary'}
                      fontWeight={valuesMatch ? 500 : 'bold'}>
                      {columnLabel}
                    </Typography>
                  </Box>
                );
              }

              // Render currentValue or serverValue column
              const columnKeyIndexable = (columnKey + 'Value') as 'currentValue' | 'serverValue';
              const value = answers[columnKeyIndexable];

              // Determine diff background color based on value match
              const diffBackgroundColor = getDiffBackgroundColor(
                columnKey as 'current' | 'server',
                valuesMatch
              );

              return (
                <Box key={columnKey} p={1}>
                  <Typography
                    fontWeight={valuesMatch ? 500 : 'bold'}
                    color={valuesMatch ? 'text.secondary' : 'text.primary'}
                    sx={{
                      backgroundColor: diffBackgroundColor ?? undefined
                    }}>
                    {value ?? '-'}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
}

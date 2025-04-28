import React from 'react';
import Box from '@mui/material/Box';
import { StyledRadioGroup, StyledRequiredTypography } from '../Item.styles';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import RadioOptionList from '../ItemParts/RadioOptionList';
import FadingCheckIcon from '../ItemParts/FadingCheckIcon';
import ClearInputButton from '../ItemParts/ClearInputButton';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { useRendererStylingStore } from '../../../stores';
import { getChoiceOrientation } from '../../../utils/choice';

interface ChoiceRadioGroupProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueRadio: string | null;
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  onCheckedChange: (newValue: string) => void;
  onClear: () => void;
}

function ChoiceRadioGroup(props: ChoiceRadioGroupProps) {
  const {
    qItem,
    options,
    valueRadio,
    feedback,
    readOnly,
    expressionUpdated,
    answerOptionsToggleExpressionsMap,
    onCheckedChange,
    onClear
  } = props;

  const inputsFlexGrow = useRendererStylingStore.use.inputsFlexGrow();
  const hideClearButton = useRendererStylingStore.use.hideClearButton();

  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Vertical;

  return (
    <>
      <Box
        display="flex"
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
        <Box
          display="flex"
          alignItems="center"
          sx={inputsFlexGrow ? { width: '100%', flexWrap: 'nowrap' } : {}}>
          <StyledRadioGroup
            id={qItem.type + '-' + qItem.linkId}
            row={orientation === ChoiceItemOrientation.Horizontal}
            sx={inputsFlexGrow ? { width: '100%', flexWrap: 'nowrap' } : {}}
            onChange={(e) => {
              // If item.readOnly=true, do not allow any changes
              if (readOnly) {
                return;
              }

              onCheckedChange(e.target.value);
            }}
            value={valueRadio}
            data-test="q-item-radio-group">
            <RadioOptionList
              options={options}
              readOnly={readOnly}
              fullWidth={inputsFlexGrow}
              answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
            />
          </StyledRadioGroup>

          <Box flexGrow={1} />

          <FadingCheckIcon fadeIn={expressionUpdated} disabled={readOnly} />
        </Box>

        {hideClearButton ? null : (
          <ClearInputButton buttonShown={!!valueRadio} readOnly={readOnly} onClear={onClear} />
        )}
      </Box>

      {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
    </>
  );
}

export default ChoiceRadioGroup;

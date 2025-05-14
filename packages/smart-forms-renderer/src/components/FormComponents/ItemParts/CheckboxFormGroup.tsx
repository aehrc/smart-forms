import type { ReactNode } from 'react';
import React from 'react';
import { Box } from '@mui/material';
import { StyledFormGroup, StyledRequiredTypography } from '../Item.styles';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import FadingCheckIcon from './FadingCheckIcon';
import ClearInputButton from './ClearInputButton';
import type {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import { useRendererStylingStore } from '../../../stores';
import { getChoiceOrientation } from '../../../utils/choice';
import CheckboxOptionList from '../ChoiceItems/CheckboxOptionList';

interface ChoiceCheckboxFormGroupProps {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  answers: QuestionnaireResponseItemAnswer[];
  feedback: string;
  readOnly: boolean;
  expressionUpdated: boolean;
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  isTabled: boolean;
  onCheckedChange: (newValue: string) => void;
  onClear: () => void;
  children?: ReactNode; // Mainly used for open-choice openLabel field
}

function CheckboxFormGroup(props: ChoiceCheckboxFormGroupProps) {
  const {
    qItem,
    options,
    answers,
    feedback,
    readOnly,
    expressionUpdated,
    answerOptionsToggleExpressionsMap,
    isTabled,
    onCheckedChange,
    onClear,
    children
  } = props;

  const readOnlyVisualStyle = useRendererStylingStore.use.readOnlyVisualStyle();
  const inputsFlexGrow = useRendererStylingStore.use.inputsFlexGrow();
  const hideClearButton = useRendererStylingStore.use.hideClearButton();

  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Vertical;

  const answersEmpty = answers.length === 0;

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
          <StyledFormGroup
            id={qItem.type + '-' + qItem.linkId}
            {...(!isTabled
              ? { 'aria-labelledby': 'label-' + qItem.linkId }
              : { 'aria-label': qItem.text })}
            role="group"
            row={orientation === ChoiceItemOrientation.Horizontal}
            sx={inputsFlexGrow ? { width: '100%', flexWrap: 'nowrap' } : {}}>
            <CheckboxOptionList
              aria-readonly={readOnly && readOnlyVisualStyle === 'readonly'}
              options={options}
              answers={answers}
              readOnly={readOnly}
              fullWidth={inputsFlexGrow}
              answerOptionsToggleExpressionsMap={answerOptionsToggleExpressionsMap}
              onCheckedChange={onCheckedChange}
            />
            {children}
          </StyledFormGroup>

          <Box flexGrow={1} />

          <FadingCheckIcon fadeIn={expressionUpdated} disabled={readOnly} />
        </Box>

        {hideClearButton ? null : (
          <ClearInputButton buttonShown={!answersEmpty} readOnly={readOnly} onClear={onClear} />
        )}
      </Box>

      {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
    </>
  );
}

export default CheckboxFormGroup;

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { StyledRadioGroup, StyledRequiredTypography } from '../Item.styles';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import RadioOptionList from './RadioOptionList';
import ExpressionUpdateFadingIcon from './ExpressionUpdateFadingIcon';
import ClearInputButton from './ClearInputButton';
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
  isTabled: boolean;
  onCheckedChange: (newValue: string) => void;
  onClear: () => void;
  children?: ReactNode; // Mainly used for open-choice openLabel field
}

function RadioFormGroup(props: ChoiceRadioGroupProps) {
  const {
    qItem,
    options,
    valueRadio,
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

  const orientation = getChoiceOrientation(qItem) ?? ChoiceItemOrientation.Vertical;

  return (
    <>
      <Box
        display="flex"
        width="100%"
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
            {...(!isTabled
              ? { 'aria-labelledby': 'label-' + qItem.linkId }
              : { 'aria-label': qItem.text ?? 'Unnamed radio group' })}
            aria-readonly={readOnly && readOnlyVisualStyle === 'readonly'}
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
            {children}
          </StyledRadioGroup>

          <Box flexGrow={1} />

          <ExpressionUpdateFadingIcon fadeIn={expressionUpdated} disabled={readOnly} />
        </Box>

        <ClearInputButton buttonShown={!!valueRadio} readOnly={readOnly} onClear={onClear} />
      </Box>

      {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
    </>
  );
}

export default RadioFormGroup;

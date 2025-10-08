import { Box } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import type {
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type { ReactNode } from 'react';
import { ChoiceItemOrientation } from '../../../interfaces/choice.enum';
import { useRendererConfigStore } from '../../../stores';
import { getChoiceOrientation } from '../../../utils/choice';
import CheckboxOptionList from '../ChoiceItems/CheckboxOptionList';
import { StyledRequiredTypography } from '../Item.styles';
import ClearInputButton from './ClearInputButton';
import ExpressionUpdateFadingIcon from './ExpressionUpdateFadingIcon';

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

  const readOnlyVisualStyle = useRendererConfigStore.use.readOnlyVisualStyle();
  const inputsFlexGrow = useRendererConfigStore.use.inputsFlexGrow();

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
          <FormGroup
            id={qItem.type + '-' + qItem.linkId}
            {...(!isTabled
              ? { 'aria-labelledby': 'label-' + qItem.linkId }
              : { 'aria-label': qItem.text ?? 'Unnamed checkbox list' })}
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
          </FormGroup>

          <Box flexGrow={1} />

          <ExpressionUpdateFadingIcon fadeIn={expressionUpdated} disabled={readOnly} />
        </Box>

        <ClearInputButton buttonShown={!answersEmpty} readOnly={readOnly} onClear={onClear} />
      </Box>

      {feedback ? <StyledRequiredTypography>{feedback}</StyledRequiredTypography> : null}
    </>
  );
}

export default CheckboxFormGroup;

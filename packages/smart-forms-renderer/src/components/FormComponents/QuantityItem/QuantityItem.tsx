import React, { useCallback, useState } from 'react';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type {
  Extension,
  Quantity,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem
} from 'fhir/r4';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import { FullWidthFormComponentBox } from '../../Box.styles';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import debounce from 'lodash.debounce';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import { createEmptyQrItem } from '../../../utils/qrItem';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import {
  parseDecimalStringToFloat,
  parseDecimalStringWithPrecision
} from '../../../utils/parseInputs';
import { getDecimalPrecision } from '../../../utils/itemControl';
import useDecimalCalculatedExpression from '../../../hooks/useDecimalCalculatedExpression';
import useStringInput from '../../../hooks/useStringInput';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import Box from '@mui/material/Box';
import QuantityField from './QuantityField';
import QuantityUnitField from './QuantityUnitField';
import Grid from '@mui/material/Grid';

interface QuantityItemProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function QuantityItem(props: QuantityItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, parentIsReadOnly, onQrItemChange } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const precision = getDecimalPrecision(qItem);
  const { displayUnit, displayPrompt, entryFormat } = useRenderingExtensions(qItem);

  // Init input value
  let valueQuantity: Quantity = {};
  let initialInput = '';
  if (qrItem?.answer) {
    if (qrItem?.answer[0].valueQuantity) {
      valueQuantity = qrItem.answer[0].valueQuantity;
    }

    initialInput =
      (precision ? valueQuantity.value?.toFixed(precision) : valueQuantity.value?.toString()) || '';
  }
  const [input, setInput] = useStringInput(initialInput);

  // Init unit input value
  const answerOptions = qItem.extension?.filter(
    (f) => f.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption'
  );
  const isShowAnswerOptions = answerOptions?.length || false;
  const [unitInput, setUnitInput] = useState<QuestionnaireItemAnswerOption | null>(
    (answerOptions?.at(0) ?? null) as Extension | null
  );

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, input);

  // Process calculated expressions
  const { calcExpUpdated } = useDecimalCalculatedExpression({
    qItem: qItem,
    inputValue: input,
    precision: precision,
    onChangeByCalcExpressionDecimal: (newValueDecimal: number) => {
      setInput(
        typeof precision === 'number'
          ? newValueDecimal.toFixed(precision)
          : newValueDecimal.toString()
      );
      onQrItemChange({
        ...createEmptyQrItem(qItem),
        answer: [
          {
            valueQuantity: {
              value: newValueDecimal,
              system: unitInput?.valueCoding?.system,
              code: unitInput?.valueCoding?.code
            }
          }
        ]
      });
    },
    onChangeByCalcExpressionNull: () => {
      setInput('');
      onQrItemChange(createEmptyQrItem(qItem));
    }
  });

  // Event handlers
  function handleInputChange(newInput: string) {
    const parsedNewInput: string = parseDecimalStringWithPrecision(newInput, precision);

    setInput(parsedNewInput);
    updateQrItemWithDebounce(parsedNewInput);
  }

  function handleUnitInputChange(newInput: QuestionnaireItemAnswerOption | null) {
    setUnitInput(newInput);

    if (!input) return;

    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: precision
        ? [
            {
              valueQuantity: {
                value: parseDecimalStringToFloat(input, precision),
                system: newInput?.valueCoding?.system,
                code: newInput?.valueCoding?.code
              }
            }
          ]
        : [
            {
              valueQuantity: {
                value: parseFloat(input),
                system: newInput?.valueCoding?.system,
                code: newInput?.valueCoding?.code
              }
            }
          ]
    });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((parsedNewInput: string) => {
      if (parsedNewInput === '') {
        onQrItemChange(createEmptyQrItem(qItem));
      } else {
        onQrItemChange({
          ...createEmptyQrItem(qItem),
          answer: precision
            ? [
                {
                  valueQuantity: {
                    value: parseDecimalStringToFloat(parsedNewInput, precision),
                    system: unitInput?.valueCoding?.system,
                    code: unitInput?.valueCoding?.code
                  }
                }
              ]
            : [
                {
                  valueQuantity: {
                    value: parseFloat(parsedNewInput),
                    system: unitInput?.valueCoding?.system,
                    code: unitInput?.valueCoding?.code
                  }
                }
              ]
        });
      }
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem, displayUnit, precision, unitInput]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <Box data-test="q-item-quantity-box" display="flex" gap={1}>
        <QuantityField
          linkId={qItem.linkId}
          input={input}
          feedback={feedback}
          displayPrompt={displayPrompt}
          displayUnit={displayUnit}
          entryFormat={entryFormat}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          isTabled={isTabled}
          onInputChange={handleInputChange}
        />
        {answerOptions?.length ? (
          <QuantityUnitField
            qItem={qItem}
            options={answerOptions}
            valueSelect={unitInput}
            readOnly={readOnly}
            isTabled={isTabled}
            onChange={handleUnitInputChange}
          />
        ) : null}
      </Box>
    );
  }

  return (
    <FullWidthFormComponentBox
      data-test="q-item-quantity-box"
      data-linkid={qItem.linkId}
      onClick={() => onFocusLinkId(qItem.linkId)}>
      <ItemFieldGrid qItem={qItem} readOnly={readOnly}>
        <Box display="flex" gap={1}>
          <QuantityField
            linkId={qItem.linkId}
            input={input}
            feedback={feedback}
            displayPrompt={displayPrompt}
            displayUnit={displayUnit}
            entryFormat={entryFormat}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            isTabled={isTabled}
            onInputChange={handleInputChange}
          />
          {answerOptions?.length ? (
            <QuantityUnitField
              qItem={qItem}
              options={answerOptions}
              valueSelect={unitInput}
              readOnly={readOnly}
              isTabled={isTabled}
              onChange={handleUnitInputChange}
            />
          ) : null}
        </Box>
      </ItemFieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default QuantityItem;

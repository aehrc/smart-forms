import React, { useCallback, useMemo, useState } from 'react';
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
import { parseDecimalStringWithPrecision } from '../../../utils/parseInputs';
import { getDecimalPrecision } from '../../../utils/itemControl';
import useDecimalCalculatedExpression from '../../../hooks/useDecimalCalculatedExpression';
import useStringInput from '../../../hooks/useStringInput';
import useReadOnly from '../../../hooks/useReadOnly';
import { useQuestionnaireStore } from '../../../stores';
import Box from '@mui/material/Box';
import QuantityField from './QuantityField';
import QuantityUnitField from './QuantityUnitField';
import {
  createQuantityItemAnswer,
  quantityComparators,
  stringIsComparator
} from '../../../utils/quantity';
import QuantityComparatorField from './QuantityComparatorField';

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

  // Get units options if present
  const unitOptions = useMemo(
    () =>
      qItem.extension?.filter(
        (f) => f.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption'
      ) ?? [],
    [qItem]
  );

  // Init inputs
  let valueQuantity: Quantity = {};
  let initialValueInput = '';
  let initialComparatorInput: Quantity['comparator'] | null = null;
  let initialUnitInput: QuestionnaireItemAnswerOption | null = (unitOptions?.at(0) ??
    null) as Extension | null;
  if (qrItem?.answer) {
    if (qrItem?.answer[0].valueQuantity) {
      valueQuantity = qrItem.answer[0].valueQuantity;
    }

    initialValueInput =
      (precision ? valueQuantity.value?.toFixed(precision) : valueQuantity.value?.toString()) || '';

    if (valueQuantity.comparator && stringIsComparator(valueQuantity.comparator)) {
      initialComparatorInput = valueQuantity.comparator;
    }

    if (valueQuantity.code && valueQuantity.system) {
      initialUnitInput = {
        valueCoding: {
          code: valueQuantity.code,
          system: valueQuantity.system,
          display: valueQuantity.unit
        }
      };
    }
  }

  // input states
  const [valueInput, setValueInput] = useStringInput(initialValueInput);
  const [comparatorInput, setComparatorInput] = useState<Quantity['comparator'] | null>(
    initialComparatorInput
  );
  const [unitInput, setUnitInput] = useState<QuestionnaireItemAnswerOption | null>(
    initialUnitInput
  );

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, valueInput);

  // Process calculated expressions
  const { calcExpUpdated } = useDecimalCalculatedExpression({
    qItem: qItem,
    inputValue: valueInput,
    precision: precision,
    onChangeByCalcExpressionDecimal: (newValueDecimal: number) => {
      setValueInput(
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
              unit: unitInput?.valueCoding?.display,
              system: unitInput?.valueCoding?.system,
              code: unitInput?.valueCoding?.code
            }
          }
        ]
      });
    },
    onChangeByCalcExpressionNull: () => {
      setValueInput('');
      onQrItemChange(createEmptyQrItem(qItem));
    }
  });

  // Event handlers
  function handleComparatorInputChange(newComparatorInput: Quantity['comparator'] | null) {
    setComparatorInput(newComparatorInput);

    if (!valueInput) return;

    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: createQuantityItemAnswer(precision, valueInput, newComparatorInput, unitInput)
    });
  }

  function handleUnitInputChange(newUnitInput: QuestionnaireItemAnswerOption | null) {
    setUnitInput(newUnitInput);

    if (!valueInput) return;

    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: createQuantityItemAnswer(precision, valueInput, comparatorInput, newUnitInput)
    });
  }

  function handleValueInputChange(newInput: string) {
    const parsedNewInput: string = parseDecimalStringWithPrecision(newInput, precision);

    setValueInput(parsedNewInput);
    updateQrItemWithDebounce(parsedNewInput);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((parsedNewInput: string) => {
      if (parsedNewInput === '') {
        onQrItemChange(createEmptyQrItem(qItem));
      } else {
        onQrItemChange({
          ...createEmptyQrItem(qItem),
          answer: createQuantityItemAnswer(precision, parsedNewInput, comparatorInput, unitInput)
        });
      }
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem, displayUnit, precision, comparatorInput, unitInput]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  if (isRepeated) {
    return (
      <Box data-test="q-item-quantity-box" display="flex" gap={1}>
        <QuantityComparatorField
          linkId={qItem.linkId}
          options={quantityComparators}
          valueSelect={comparatorInput}
          readOnly={readOnly}
          isTabled={isTabled}
          onChange={handleComparatorInputChange}
        />
        <QuantityField
          linkId={qItem.linkId}
          input={valueInput}
          feedback={feedback}
          displayPrompt={displayPrompt}
          displayUnit={displayUnit}
          entryFormat={entryFormat}
          readOnly={readOnly}
          calcExpUpdated={calcExpUpdated}
          isTabled={isTabled}
          onInputChange={handleValueInputChange}
        />
        {unitOptions.length > 0 ? (
          <QuantityUnitField
            linkId={qItem.linkId}
            options={unitOptions}
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
          <QuantityComparatorField
            linkId={qItem.linkId}
            options={quantityComparators}
            valueSelect={comparatorInput}
            readOnly={readOnly}
            isTabled={isTabled}
            onChange={handleComparatorInputChange}
          />
          <QuantityField
            linkId={qItem.linkId}
            input={valueInput}
            feedback={feedback}
            displayPrompt={displayPrompt}
            displayUnit={displayUnit}
            entryFormat={entryFormat}
            readOnly={readOnly}
            calcExpUpdated={calcExpUpdated}
            isTabled={isTabled}
            onInputChange={handleValueInputChange}
          />
          {unitOptions.length > 0 ? (
            <QuantityUnitField
              linkId={qItem.linkId}
              options={unitOptions}
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

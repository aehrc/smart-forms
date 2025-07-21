import Box from '@mui/material/Box';
import type { Quantity, QuestionnaireItemAnswerOption } from 'fhir/r4';
import debounce from 'lodash.debounce';
import { useCallback, useMemo, useState } from 'react';
import useReadOnly from '../../../hooks/useReadOnly';
import useShowFeedback from '../../../hooks/useShowFeedback';
import useValidationFeedback from '../../../hooks/useValidationFeedback';
import type { BaseItemProps } from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { DEBOUNCE_DURATION } from '../../../utils/debounce';
import { getDecimalPrecision } from '../../../utils/extensions';
import { parseDecimalStringWithPrecision } from '../../../utils/parseInputs';
import { createEmptyQrItem } from '../../../utils/qrItem';
import {
  createQuantityItemAnswer,
  quantityComparators,
  stringIsComparator
} from '../../../utils/quantity';
import { FullWidthFormComponentBox } from '../../Box.styles';
import ItemFieldGrid from '../ItemParts/ItemFieldGrid';
import ItemLabel from '../ItemParts/ItemLabel';
import QuantityComparatorField from './QuantityComparatorField';
import QuantityField from './QuantityField';
import QuantityUnitField from './QuantityUnitField';

function QuantityItem(props: BaseItemProps) {
  const {
    qItem,
    qrItem,
    itemPath,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    calcExprAnimating,
    onQrItemChange
  } = props;

  const onFocusLinkId = useQuestionnaireStore.use.onFocusLinkId();

  const precision = getDecimalPrecision(qItem);
  const { displayPrompt, entryFormat, quantityUnit } = renderingExtensions;
  let { displayUnit } = renderingExtensions;

  // Get units options if present
  const unitOptions = useMemo(
    () =>
      qItem.extension?.filter(
        (f) => f.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-unitOption'
      ) ?? [],
    [qItem]
  );
  if (displayUnit === '' && unitOptions.length === 1) {
    displayUnit = unitOptions[0].valueCoding?.display ?? '';
  }

  // Init inputs
  const answerKey = qrItem?.answer?.[0]?.id;
  let valueQuantity: Quantity = {};
  let initialValueInput = '';
  let initialComparatorInput: Quantity['comparator'] | null = null;
  let initialUnitInput: QuestionnaireItemAnswerOption | null =
    quantityUnit ?? unitOptions?.at(0) ?? null;
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
  const [valueInput, setValueInput] = useState(initialValueInput);
  const [comparatorInput, setComparatorInput] = useState<Quantity['comparator'] | null>(
    initialComparatorInput
  );
  const [unitInput, setUnitInput] = useState<QuestionnaireItemAnswerOption | null>(
    initialUnitInput
  );

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  // Perform validation checks
  const feedback = useValidationFeedback(qItem, feedbackFromParent, valueInput);

  // Provides a way to hide the feedback when the user is typing
  const { showFeedback, setShowFeedback, hasBlurred, setHasBlurred } = useShowFeedback();

  // Event handlers
  function handleComparatorInputChange(newComparatorInput: Quantity['comparator'] | null) {
    setComparatorInput(newComparatorInput);

    // Only suppress feedback once (before first blur)
    if (!hasBlurred) {
      setShowFeedback(false);
    }

    if (!valueInput) return;

    onQrItemChange({
      ...createEmptyQrItem(qItem, answerKey),
      answer: createQuantityItemAnswer(
        precision,
        valueInput,
        newComparatorInput,
        unitInput,
        answerKey
      )
    });
  }

  function handleUnitInputChange(newUnitInput: QuestionnaireItemAnswerOption | null) {
    setUnitInput(newUnitInput);

    // Only suppress feedback once (before first blur)
    if (!hasBlurred) {
      setShowFeedback(false);
    }

    if (!valueInput) return;

    onQrItemChange({
      ...createEmptyQrItem(qItem, answerKey),
      answer: createQuantityItemAnswer(
        precision,
        valueInput,
        comparatorInput,
        newUnitInput,
        answerKey
      )
    });
  }

  function handleValueInputChange(newInput: string) {
    const parsedNewInput: string = parseDecimalStringWithPrecision(newInput, precision);

    setValueInput(parsedNewInput);

    // Only suppress feedback once (before first blur)
    if (!hasBlurred) {
      setShowFeedback(false);
    }

    updateQrItemWithDebounce(parsedNewInput);
  }

  function handleBlur() {
    setShowFeedback(true);
    setHasBlurred(true); // From now on, feedback should stay visible
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateQrItemWithDebounce = useCallback(
    debounce((parsedNewInput: string) => {
      if (parsedNewInput === '') {
        onQrItemChange(createEmptyQrItem(qItem, answerKey));
      } else {
        onQrItemChange({
          ...createEmptyQrItem(qItem, answerKey),
          answer: createQuantityItemAnswer(
            precision,
            parsedNewInput,
            comparatorInput,
            unitInput,
            answerKey
          )
        });
      }
    }, DEBOUNCE_DURATION),
    [onQrItemChange, qItem, displayUnit, precision, comparatorInput, unitInput]
  ); // Dependencies are tested, debounce is causing eslint to not recognise dependencies

  const showUnitOptions = unitOptions.length > 0 && displayUnit === '';

  if (isRepeated) {
    return (
      <Box
        id={qItem.type + '-' + qItem.linkId}
        data-test="q-item-quantity-box"
        display="flex"
        width="100%"
        gap={1}>
        <QuantityComparatorField
          linkId={qItem.linkId}
          itemType={qItem.type}
          options={quantityComparators}
          valueSelect={comparatorInput}
          readOnly={readOnly}
          calcExprAnimating={calcExprAnimating}
          isTabled={isTabled}
          onChange={handleComparatorInputChange}
        />
        <QuantityField
          linkId={qItem.linkId}
          itemType={qItem.type}
          input={valueInput}
          feedback={showFeedback ? feedback : ''}
          displayPrompt={displayPrompt}
          displayUnit={displayUnit}
          entryFormat={entryFormat}
          readOnly={readOnly}
          calcExprAnimating={calcExprAnimating}
          isTabled={isTabled}
          onInputChange={handleValueInputChange}
          onBlur={handleBlur}
        />
        {showUnitOptions ? (
          <QuantityUnitField
            linkId={qItem.linkId}
            itemType={qItem.type}
            options={unitOptions}
            valueSelect={unitInput}
            readOnly={readOnly}
            calcExprAnimating={calcExprAnimating}
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
      <ItemFieldGrid
        qItem={qItem}
        readOnly={readOnly}
        labelChildren={<ItemLabel qItem={qItem} readOnly={readOnly} />}
        fieldChildren={
          <Box display="flex" gap={1}>
            <QuantityComparatorField
              linkId={qItem.linkId}
              itemType={qItem.type}
              options={quantityComparators}
              valueSelect={comparatorInput}
              readOnly={readOnly}
              calcExprAnimating={calcExprAnimating}
              isTabled={isTabled}
              onChange={handleComparatorInputChange}
            />
            <QuantityField
              linkId={qItem.linkId}
              itemType={qItem.type}
              input={valueInput}
              feedback={showFeedback ? feedback : ''}
              displayPrompt={displayPrompt}
              displayUnit={displayUnit}
              entryFormat={entryFormat}
              readOnly={readOnly}
              calcExprAnimating={calcExprAnimating}
              isTabled={isTabled}
              onInputChange={handleValueInputChange}
              onBlur={handleBlur}
            />
            {showUnitOptions ? (
              <QuantityUnitField
                linkId={qItem.linkId}
                itemType={qItem.type}
                options={unitOptions}
                valueSelect={unitInput}
                readOnly={readOnly}
                calcExprAnimating={calcExprAnimating}
                isTabled={isTabled}
                onChange={handleUnitInputChange}
              />
            ) : null}
          </Box>
        }
        feedback={feedback}
      />
    </FullWidthFormComponentBox>
  );
}

export default QuantityItem;

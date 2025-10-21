/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Typography from '@mui/material/Typography';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { useCalculatedExpressionUpdated } from '../../../hooks/useCalculatedExpressionUpdated';
import type {
  PropsWithFeedbackFromParentAttribute,
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentStylesAttribute,
  PropsWithQrItemChangeHandler,
  PropsWithRenderingExtensionsAttribute
} from '../../../interfaces/renderProps.interface';
import { useQuestionnaireStore } from '../../../stores';
import { isSpecificItemControl } from '../../../utils';
import AttachmentItem from '../AttachmentItem/AttachmentItem';
import BooleanItem from '../BooleanItem/BooleanItem';
import ChoiceItemSwitcher from '../ChoiceItems/ChoiceItemSwitcher';
import CustomDateItem from '../DateTimeItems/CustomDateItem/CustomDateItem';
import CustomDateTimeItem from '../DateTimeItems/CustomDateTimeItem/CustomDateTimeItem';
import DecimalItem from '../DecimalItem/DecimalItem';
import DisplayItem from '../DisplayItem/DisplayItem';
import IntegerItem from '../IntegerItem/IntegerItem';
import OpenChoiceItemSwitcher from '../OpenChoiceItems/OpenChoiceItemSwitcher';
import QuantityItem from '../QuantityItem/QuantityItem';
import SliderItem from '../SliderItem/SliderItem';
import StringItem from '../StringItem/StringItem';
import TextItem from '../TextItem/TextItem';
import TimeItem from '../TimeItem/TimeItem';
import UrlItem from '../UrlItem/UrlItem';

interface SingleItemSwitcherProps
  extends PropsWithQrItemChangeHandler,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute,
    PropsWithRenderingExtensionsAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithFeedbackFromParentAttribute,
    PropsWithParentStylesAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem | null;
}

function SingleItemSwitcher(props: SingleItemSwitcherProps) {
  const {
    qItem,
    qrItem,
    isRepeated,
    isTabled,
    renderingExtensions,
    parentIsReadOnly,
    feedbackFromParent,
    parentStyles,
    onQrItemChange
  } = props;

  // Get answer key from the qrItem.answer, if it exists
  // This is used to force re-rendering of the component when the answer changes via an external event i.e. calculatedExpression
  const answerKey = qrItem?.answer?.[0]?.id;

  const calcExpUpdated = useCalculatedExpressionUpdated(answerKey);

  const qItemOverrideComponents = useQuestionnaireStore.use.qItemOverrideComponents();
  const QItemOverrideComponent = qItemOverrideComponents[qItem.linkId];

  // If a qItem override component is defined for this item, render it
  // Don't get too strict with the "typeof" checks for now
  if (QItemOverrideComponent && typeof QItemOverrideComponent === 'function') {
    return (
      <QItemOverrideComponent
        key={answerKey}
        qItem={qItem}
        qrItem={qrItem}
        isRepeated={isRepeated}
        isTabled={isTabled}
        renderingExtensions={renderingExtensions}
        parentIsReadOnly={parentIsReadOnly}
        feedbackFromParent={feedbackFromParent}
        // FIXME add calcExpUpdated here
        onQrItemChange={onQrItemChange}
        onQrRepeatGroupChange={() => {}} // Not needed for single items, use empty function
      />
    );
  }

  // Otherwise, render the default form component based on the item type
  switch (qItem.type) {
    case 'display':
      return (
        <DisplayItem
          key={answerKey}
          qItem={qItem}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          parentStyles={parentStyles}
        />
      );
    case 'boolean':
      return (
        <BooleanItem
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'decimal':
      return (
        <DecimalItem
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'integer':
      if (isSpecificItemControl(qItem, 'slider')) {
        return (
          <SliderItem
            key={answerKey}
            qItem={qItem}
            qrItem={qrItem}
            isRepeated={isRepeated}
            isTabled={isTabled}
            renderingExtensions={renderingExtensions}
            parentIsReadOnly={parentIsReadOnly}
            feedbackFromParent={feedbackFromParent}
            calcExpUpdated={calcExpUpdated}
            onQrItemChange={onQrItemChange}
            parentStyles={parentStyles}
          />
        );
      }

      return (
        <IntegerItem
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'date':
      return (
        <CustomDateItem
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'dateTime':
      return (
        <CustomDateTimeItem
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'time':
      return (
        <TimeItem
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'string':
      return (
        <StringItem
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'text':
      return (
        <TextItem
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'url':
      return (
        <UrlItem
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'choice':
      return (
        <ChoiceItemSwitcher
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'open-choice':
      return (
        <OpenChoiceItemSwitcher
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'attachment':
      return (
        <AttachmentItem
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'reference':
      // FIXME reference item uses the same component as string item currently
      return (
        <StringItem
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    case 'quantity':
      return (
        <QuantityItem
          key={answerKey}
          qItem={qItem}
          qrItem={qrItem}
          isRepeated={isRepeated}
          isTabled={isTabled}
          renderingExtensions={renderingExtensions}
          parentIsReadOnly={parentIsReadOnly}
          feedbackFromParent={feedbackFromParent}
          calcExpUpdated={calcExpUpdated}
          onQrItemChange={onQrItemChange}
          parentStyles={parentStyles}
        />
      );
    default:
      return (
        <Typography>
          Item type <b>{qItem.type}</b> not supported yet, or something has went wrong. If your
          questionnnaire is not a FHIR R4 resource, there might be issues rendering it.
        </Typography>
      );
  }
}

export default SingleItemSwitcher;

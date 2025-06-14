/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import React from 'react';
import type {
  PropsWithItemPathAttribute,
  PropsWithParentIsReadOnlyAttribute,
  PropsWithParentIsRepeatGroupAttribute,
  PropsWithShowMinimalViewAttribute
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { QGroupContainerBox } from '../../Box.styles';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import { TransitionGroup } from 'react-transition-group';
import { createEmptyQrItem } from '../../../utils/qrItem';
import RepeatGroupItem from './RepeatGroupItem';
import AddItemButton from './AddItemButton';
import type { RepeatGroupSingleModel } from '../../../interfaces/repeatGroup.interface';
import useReadOnly from '../../../hooks/useReadOnly';
import { getGroupCollapsible } from '../../../utils/qItem';
import { GroupAccordion } from '../GroupItem/GroupAccordion.styles';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccordionDetails from '@mui/material/AccordionDetails';
import GroupHeading from '../GroupItem/GroupHeading';
import { appendRepeatIndexToLastSegment } from '../../../utils/itemPath';
import type { ItemPath } from '../../../interfaces/itemPath.interface';

interface RepeatGroupViewProps
  extends PropsWithItemPathAttribute,
    PropsWithShowMinimalViewAttribute,
    PropsWithParentIsReadOnlyAttribute,
    PropsWithParentIsRepeatGroupAttribute {
  qItem: QuestionnaireItem;
  repeatGroups: RepeatGroupSingleModel[];
  groupCardElevation: number;
  onAnswerChange: (
    newQrItem: QuestionnaireResponseItem,
    index: number,
    targetItemPath?: ItemPath
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  parentStyles?: Record<string, string>;
}

/**
 * Main component to render a repeating, group Questionnaire item.
 * Store and manages the state of multiple instances of GroupItem in a repeating group.
 *
 * @author Sean Fong
 */
function RepeatGroupView(props: RepeatGroupViewProps) {
  const {
    qItem,
    repeatGroups,
    itemPath,
    groupCardElevation,
    showMinimalView,
    parentIsReadOnly,
    parentStyles,
    onAnswerChange,
    onAddItem,
    onRemoveItem
  } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);

  if (showMinimalView) {
    return (
      <QGroupContainerBox
        key={qItem.linkId}
        cardElevation={groupCardElevation}
        isRepeated={true}
        style={parentStyles || undefined}>
        <Card elevation={groupCardElevation} sx={{ p: 2 }}>
          {repeatGroups.map(({ id, qrItem: nullableQrItem }, index) => {
            const answeredQrItem = createEmptyQrItem(qItem, undefined);
            if (nullableQrItem) {
              answeredQrItem.item = nullableQrItem.item;
            }

            return (
              <RepeatGroupItem
                key={id}
                qItem={qItem}
                repeatGroupIndex={index}
                answeredQrItem={answeredQrItem}
                nullableQrItem={nullableQrItem}
                numOfRepeatGroups={repeatGroups.length}
                itemPath={appendRepeatIndexToLastSegment(itemPath, index)}
                groupCardElevation={groupCardElevation}
                showMinimalView={showMinimalView}
                parentIsReadOnly={parentIsReadOnly}
                onRemoveItem={() => onRemoveItem(index)}
                onQrItemChange={(newQrItem, targetItemPath) =>
                  onAnswerChange(newQrItem, index, targetItemPath)
                }
              />
            );
          })}
        </Card>
      </QGroupContainerBox>
    );
  }

  const groupCollapsibleValue = getGroupCollapsible(qItem);
  if (groupCollapsibleValue) {
    const isDefaultOpen = groupCollapsibleValue === 'default-open';
    return (
      <GroupAccordion
        disableGutters
        defaultExpanded={isDefaultOpen}
        elevation={groupCardElevation}
        slotProps={{
          transition: { unmountOnExit: true, timeout: 250 }
        }}
        style={parentStyles || undefined}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: '28px' }}>
          {qItem.text ? (
            <GroupHeading
              qItem={qItem}
              readOnly={readOnly}
              groupCardElevation={groupCardElevation}
            />
          ) : null}
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0 }}>
          {qItem.text ? <Divider sx={{ mb: 1.5, opacity: 0.6 }} /> : null}
          <TransitionGroup>
            {repeatGroups.map(({ id, qrItem: nullableQrItem }, index) => {
              const answeredQrItem = createEmptyQrItem(qItem, undefined);
              if (nullableQrItem) {
                answeredQrItem.item = nullableQrItem.item;
              }

              return (
                <Collapse key={id} timeout={200}>
                  <RepeatGroupItem
                    qItem={qItem}
                    repeatGroupIndex={index}
                    answeredQrItem={answeredQrItem}
                    nullableQrItem={nullableQrItem}
                    numOfRepeatGroups={repeatGroups.length}
                    itemPath={appendRepeatIndexToLastSegment(itemPath, index)}
                    groupCardElevation={groupCardElevation}
                    parentIsReadOnly={parentIsReadOnly}
                    onRemoveItem={() => onRemoveItem(index)}
                    onQrItemChange={(newQrItem, targetItemPath) =>
                      onAnswerChange(newQrItem, index, targetItemPath)
                    }
                  />
                </Collapse>
              );
            })}
          </TransitionGroup>

          <AddItemButton repeatGroups={repeatGroups} readOnly={readOnly} onAddItem={onAddItem} />
        </AccordionDetails>
      </GroupAccordion>
    );
  }

  return (
    <QGroupContainerBox
      key={qItem.linkId}
      cardElevation={groupCardElevation}
      isRepeated={true}
      style={parentStyles || undefined}>
      <Card elevation={groupCardElevation} sx={{ p: 3, py: 2.5, mb: 3.5 }}>
        {qItem.text ? (
          <>
            <GroupHeading
              qItem={qItem}
              readOnly={readOnly}
              groupCardElevation={groupCardElevation}
            />
            <Divider sx={{ mt: 1, mb: 1.5, opacity: 0.6 }} />
          </>
        ) : null}
        <TransitionGroup>
          {repeatGroups.map(({ id, qrItem: nullableQrItem }, index) => {
            const answeredQrItem = createEmptyQrItem(qItem, undefined);
            if (nullableQrItem) {
              answeredQrItem.item = nullableQrItem.item;
            }

            return (
              <Collapse key={id} timeout={200}>
                <RepeatGroupItem
                  qItem={qItem}
                  repeatGroupIndex={index}
                  answeredQrItem={answeredQrItem}
                  nullableQrItem={nullableQrItem}
                  numOfRepeatGroups={repeatGroups.length}
                  itemPath={appendRepeatIndexToLastSegment(itemPath, index)}
                  groupCardElevation={groupCardElevation}
                  parentIsReadOnly={parentIsReadOnly}
                  onRemoveItem={() => onRemoveItem(index)}
                  onQrItemChange={(newQrItem, targetItemPath) =>
                    onAnswerChange(newQrItem, index, targetItemPath)
                  }
                />
              </Collapse>
            );
          })}
        </TransitionGroup>

        <AddItemButton repeatGroups={repeatGroups} readOnly={readOnly} onAddItem={onAddItem} />
      </Card>
    </QGroupContainerBox>
  );
}

export default RepeatGroupView;

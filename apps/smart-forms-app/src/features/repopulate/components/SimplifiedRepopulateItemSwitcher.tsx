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

import React, { useState } from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { getAnswerValueAsString } from '../utils/answerFormatters';
import { isSpecificItemControl } from '@aehrc/smart-forms-renderer';

interface SimplifiedRepopulateItemSwitcherProps {
  qItem: QuestionnaireItem;
  serverSuggestedQRItem?: QuestionnaireResponseItem;
  currentUserFormQRItem?: QuestionnaireResponseItem;
  serverSuggestedQRItems?: QuestionnaireResponseItem[];
  currentUserFormQRItems?: QuestionnaireResponseItem[];
  onValuePreferenceChange: (linkId: string, preferUserFormValue: boolean | undefined) => void;
}

interface ChangeEntry {
  fieldLabelQItem: QuestionnaireItem; // e.g., The "Weight" group item, or "Systolic Blood Pressure" for a simple item
  qSubItem: QuestionnaireItem;       // e.g., The "Value" item under "Weight", or same as fieldLabelQItem for simple items
  serverValue: string | null;
  userFormValue: string | null;
  rowIndex?: number;
  rowLabelForRow?: string; // For repeating table row context (e.g., "Condition: CKD")
}

/**
 * A simplified version of RepopulateItemSwitcher that only shows text-based old/new values
 */
function SimplifiedRepopulateItemSwitcher(props: SimplifiedRepopulateItemSwitcherProps) {
  const {
    qItem,
    serverSuggestedQRItem,
    currentUserFormQRItem,
    serverSuggestedQRItems,
    currentUserFormQRItems,
    onValuePreferenceChange
  } = props;
  
  const [fieldPreferences, setFieldPreferences] = useState<Record<string, boolean>>({});

  const handleComplexFieldPreferenceChange = (rowKeyOrFieldLinkId: string, subFieldLinkId: string | null, userPrefersTheirFormVal: boolean) => {
    const key = subFieldLinkId ? `${rowKeyOrFieldLinkId}:${subFieldLinkId}` : rowKeyOrFieldLinkId;
    setFieldPreferences(prev => ({ ...prev, [key]: userPrefersTheirFormVal }));
    onValuePreferenceChange(qItem.linkId + (subFieldLinkId ? `:${subFieldLinkId}` : '') , userPrefersTheirFormVal);
  };

  const isPreferringUserFormValueForField = (rowKeyOrFieldLinkId: string, subFieldLinkId: string | null): boolean => {
    const key = subFieldLinkId ? `${rowKeyOrFieldLinkId}:${subFieldLinkId}` : rowKeyOrFieldLinkId;
    return fieldPreferences[key] === undefined ? true : fieldPreferences[key];
  };

  const detectChanges = (): Array<ChangeEntry> => {
    const changes: Array<ChangeEntry> = [];

    function findChangesRecursive(
      currentQItemDefinition: QuestionnaireItem,
      parentFieldGroupQItem: QuestionnaireItem,
      currentServerQRItem?: QuestionnaireResponseItem,
      currentClientQRItem?: QuestionnaireResponseItem,
      rowIndex?: number,
      rowContextLabel?: string
    ) {
      const isSimpleType = currentQItemDefinition.type !== 'group';
      const isChoiceGroup = currentQItemDefinition.type === 'group' && currentQItemDefinition.answerOption && currentQItemDefinition.answerOption.length > 0;

      if (isSimpleType || isChoiceGroup) {
        const serverAnswer = currentServerQRItem?.answer?.[0];
        const userAnswer = currentClientQRItem?.answer?.[0];
        const serverValStr = serverAnswer ? getAnswerValueAsString(serverAnswer) : null;
        const userValStr = userAnswer ? getAnswerValueAsString(userAnswer) : null;

        if (serverValStr !== userValStr) {
          changes.push({
            fieldLabelQItem: parentFieldGroupQItem, 
            qSubItem: currentQItemDefinition,    
            serverValue: serverValStr,
            userFormValue: userValStr,
            rowIndex,
            rowLabelForRow: rowIndex !== undefined ? rowContextLabel : undefined
          });
        }
      }

      if (currentQItemDefinition.item && currentQItemDefinition.item.length > 0) {
        currentQItemDefinition.item.forEach(subQItemDef => {
          const serverSubQRItem = currentServerQRItem?.item?.find(i => i.linkId === subQItemDef.linkId);
          const clientSubQRItem = currentClientQRItem?.item?.find(i => i.linkId === subQItemDef.linkId);

          let nextParentFieldGroup = parentFieldGroupQItem;
          if (currentQItemDefinition.type === 'group' && 
              !currentQItemDefinition.repeats && 
              !isSpecificItemControl(currentQItemDefinition, 'grid') && 
              currentQItemDefinition.linkId !== qItem.linkId) {
                nextParentFieldGroup = currentQItemDefinition;
          }

          findChangesRecursive(
            subQItemDef,
            nextParentFieldGroup,
            serverSubQRItem,
            clientSubQRItem,
            rowIndex,
            rowContextLabel
          );
        });
      }
    }

    if (qItem.repeats && serverSuggestedQRItems && currentUserFormQRItems) {
      const maxRows = Math.max(serverSuggestedQRItems.length, currentUserFormQRItems.length);
      for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
        const serverRow = serverSuggestedQRItems[rowIdx];
        const userRow = currentUserFormQRItems[rowIdx];
        
        let dynamicRowLabel = `Row ${rowIdx + 1}`;
        if (qItem.item && qItem.item.length > 0) {
          const firstColForLabel = qItem.item[0];
          const serverCellForLabel = serverRow?.item?.find(i => i.linkId === firstColForLabel.linkId);
          const userCellForLabel = userRow?.item?.find(i => i.linkId === firstColForLabel.linkId);
          const cellForLabelValue = (serverCellForLabel || userCellForLabel)?.answer?.[0];
          if (cellForLabelValue) {
              dynamicRowLabel = `${firstColForLabel.text || firstColForLabel.linkId}: ${getAnswerValueAsString(cellForLabelValue)}`;
          }
        }

        (qItem.item || []).forEach(columnQItemDefinition => {
          const serverCellItem = serverRow?.item?.find(i => i.linkId === columnQItemDefinition.linkId);
          const userCellItem = userRow?.item?.find(i => i.linkId === columnQItemDefinition.linkId);
          findChangesRecursive(columnQItemDefinition, columnQItemDefinition, serverCellItem, userCellItem, rowIdx, dynamicRowLabel);
        });
      }
    } else {
      findChangesRecursive(qItem, qItem, serverSuggestedQRItem, currentUserFormQRItem);
    }
    
    return changes;
  };

  const changes = detectChanges();

  if (changes.length === 0) {
    return <Typography sx={{p:1, fontStyle: 'italic'}} variant="body2">No changes in: {qItem.text || qItem.linkId}</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5, width: '100%' }}>
      {(() => {
        if (qItem.repeats) {
          // Group changes by row for repeating items
          const groupedByRow: Array<{ rowIndex: number; rowLabelForRow: string; itemsInRow: ChangeEntry[] }> = [];
          const rowMap = new Map<number, { rowLabelForRow: string; itemsInRow: ChangeEntry[] }>();

          changes.forEach(change => {
            if (change.rowIndex !== undefined) {
              if (!rowMap.has(change.rowIndex)) {
                rowMap.set(change.rowIndex, { 
                  rowLabelForRow: change.rowLabelForRow || `Row ${change.rowIndex + 1}`, 
                  itemsInRow: [] 
                });
              }
              rowMap.get(change.rowIndex)!.itemsInRow.push(change);
            }
          });

          rowMap.forEach((value, key) => {
            groupedByRow.push({ rowIndex: key, ...value });
          });
          groupedByRow.sort((a,b) => a.rowIndex - b.rowIndex); // Ensure rows are ordered

          return groupedByRow.map((rowGroup, groupIdx) => (
            <React.Fragment key={`rowgroup-${rowGroup.rowIndex}-${groupIdx}`}>
              <Typography variant="subtitle2" sx={{ mt: groupIdx === 0 ? 0.5 : 2, mb: 0.5, pl: 1, fontWeight: 'bold' }}>
                {rowGroup.rowLabelForRow}
              </Typography>
              {rowGroup.itemsInRow.map((change, itemIdx) => {
                const preferenceKeyBase = qItem.linkId + (change.rowIndex !== undefined ? `-row${change.rowIndex}` : '');
                const preferenceKeySuffix = change.fieldLabelQItem.linkId === change.qSubItem.linkId 
                                            ? change.qSubItem.linkId 
                                            : `${change.fieldLabelQItem.linkId}:${change.qSubItem.linkId}`;
                return (
                  <Box key={`${preferenceKeyBase}-${preferenceKeySuffix}-${itemIdx}`} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 0.5, alignItems: 'flex-start', pl: 2 /* Indent fields under row heading */ }}>
                    <Typography variant="body2" sx={{ width: '280px', fontWeight: 'medium', pt: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {`${change.fieldLabelQItem.text || change.fieldLabelQItem.linkId}:`}
                    </Typography>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                      <FormControlLabel control={<Checkbox size="small" checked={isPreferringUserFormValueForField(preferenceKeyBase, preferenceKeySuffix)} onChange={() => handleComplexFieldPreferenceChange(preferenceKeyBase, preferenceKeySuffix, true)} sx={{p:0, mr:0.5}} />} label={<Typography variant="overline" fontSize={8} color="text.secondary">YOUR CURRENT VALUE</Typography>} sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}/>
                      <Box sx={{ padding: 1, border: '1px solid #eee', borderRadius: 1, minHeight: '36px', bgcolor: isPreferringUserFormValueForField(preferenceKeyBase, preferenceKeySuffix) ? 'rgba(25, 118, 210, 0.08)' : 'transparent', width: '100%' }}><Typography variant="body2" sx={{ color: '#2e7d32' }}>{change.userFormValue || 'Not set'}</Typography></Box>
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                      <FormControlLabel control={<Checkbox size="small" checked={!isPreferringUserFormValueForField(preferenceKeyBase, preferenceKeySuffix)} onChange={() => handleComplexFieldPreferenceChange(preferenceKeyBase, preferenceKeySuffix, false)} sx={{p:0, mr:0.5}} />} label={<Typography variant="overline" fontSize={8} color="text.secondary">SUGGESTED (SERVER)</Typography>} sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}/>
                      <Box sx={{ padding: 1, border: '1px solid #eee', borderRadius: 1, minHeight: '36px', bgcolor: !isPreferringUserFormValueForField(preferenceKeyBase, preferenceKeySuffix) ? 'rgba(25, 118, 210, 0.08)' : 'transparent', width: '100%' }}><Typography variant="body2" sx={{ color: '#d32f2f' }}>{change.serverValue || 'Not set'}</Typography></Box>
                    </Box>
                  </Box>
                );
              })}
            </React.Fragment>
          ));
        } else {
          // Original rendering for non-repeating items
          return changes.map((change, idx) => {
            const preferenceKeyBase = qItem.linkId; // No rowIndex for non-repeating
            const preferenceKeySuffix = change.fieldLabelQItem.linkId === change.qSubItem.linkId 
                                        ? change.qSubItem.linkId 
                                        : `${change.fieldLabelQItem.linkId}:${change.qSubItem.linkId}`;
            let label = change.fieldLabelQItem.text || change.fieldLabelQItem.linkId;
            if (change.qSubItem.linkId !== change.fieldLabelQItem.linkId && change.qSubItem.text && change.qSubItem.text.toLowerCase() !== 'value') {
              label += ` - ${change.qSubItem.text}`;
            }
            label += ':';

            return (
              <React.Fragment key={`${preferenceKeyBase}-${preferenceKeySuffix}-${idx}`}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 1, alignItems: 'flex-start', pl:1}}>
                  <Typography variant="body2" sx={{ width: '280px', fontWeight: 'medium', pt: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {label}
                  </Typography>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                      <FormControlLabel control={<Checkbox size="small" checked={isPreferringUserFormValueForField(preferenceKeyBase, preferenceKeySuffix)} onChange={() => handleComplexFieldPreferenceChange(preferenceKeyBase, preferenceKeySuffix, true)} sx={{p:0, mr:0.5}} />} label={<Typography variant="overline" fontSize={8} color="text.secondary">YOUR CURRENT VALUE</Typography>} sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}/>
                      <Box sx={{ padding: 1, border: '1px solid #eee', borderRadius: 1, minHeight: '36px', bgcolor: isPreferringUserFormValueForField(preferenceKeyBase, preferenceKeySuffix) ? 'rgba(25, 118, 210, 0.08)' : 'transparent', width: '100%' }}><Typography variant="body2" sx={{ color: '#2e7d32' }}>{change.userFormValue || 'Not set'}</Typography></Box>
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                      <FormControlLabel control={<Checkbox size="small" checked={!isPreferringUserFormValueForField(preferenceKeyBase, preferenceKeySuffix)} onChange={() => handleComplexFieldPreferenceChange(preferenceKeyBase, preferenceKeySuffix, false)} sx={{p:0, mr:0.5}} />} label={<Typography variant="overline" fontSize={8} color="text.secondary">SUGGESTED (SERVER)</Typography>} sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}/>
                      <Box sx={{ padding: 1, border: '1px solid #eee', borderRadius: 1, minHeight: '36px', bgcolor: !isPreferringUserFormValueForField(preferenceKeyBase, preferenceKeySuffix) ? 'rgba(25, 118, 210, 0.08)' : 'transparent', width: '100%' }}><Typography variant="body2" sx={{ color: '#d32f2f' }}>{change.serverValue || 'Not set'}</Typography></Box>
                    </Box>
                </Box>
              </React.Fragment>
            );
          });
        }
      })()}
    </Box>
  );
}

export default SimplifiedRepopulateItemSwitcher; 
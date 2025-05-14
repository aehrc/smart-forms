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

import { useState } from 'react';
import type { QuestionnaireItem, QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from 'fhir/r4';
import { Box, Checkbox, FormControlLabel, Stack, Typography, Divider } from '@mui/material';
import { getAnswerValueAsString } from '../utils/answerFormatters';

interface SimplifiedRepopulateItemSwitcherProps {
  qItem: QuestionnaireItem;
  serverSuggestedQRItem?: QuestionnaireResponseItem; // Data from server (renderer's newQRItem)
  currentUserFormQRItem?: QuestionnaireResponseItem; // Data from user's current form (renderer's oldQRItem)
  serverSuggestedQRItems?: QuestionnaireResponseItem[]; // For repeating groups (server)
  currentUserFormQRItems?: QuestionnaireResponseItem[]; // For repeating groups (user's current form)
  onValuePreferenceChange: (linkId: string, preferUserFormValue: boolean | undefined) => void;
  initialUserFormPreference?: boolean; // true if user's current form value is initially preferred
}

interface FieldChange {
  serverValue: string | null;
  userFormValue: string | null;
  qSubItem: QuestionnaireItem;
}

interface RowChange {
  rowKey: string; 
  status: 'modified' | 'added' | 'removed';
  changedFields: Record<string, FieldChange>; 
  serverRowData?: QuestionnaireResponseItem; 
  userFormRowData?: QuestionnaireResponseItem; 
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
    onValuePreferenceChange,
    initialUserFormPreference
  } = props;
  
  // Log all relevant props when the component initially renders for a gtable
  if (qItem.text?.includes('Medical history')) { // Or a more generic gtable check
    console.log(`Switcher PROPS for ${qItem.linkId} (${qItem.text}):`,
      {
        qItem,
        serverSuggestedQRItem,
        currentUserFormQRItem,
        serverSuggestedQRItems: JSON.stringify(serverSuggestedQRItems, null, 2), // Stringify to see full array if present
        currentUserFormQRItems: JSON.stringify(currentUserFormQRItems, null, 2), // Stringify
        initialUserFormPreference
      }
    );
  }
  
  const [preferUserFormValueInState, setPreferUserFormValueInState] = useState<boolean | undefined>(
    initialUserFormPreference === undefined ? true : initialUserFormPreference // Default to user preferring THEIR CURRENT FORM VALUE
  );

  const handleSelection = (userChoosesTheirFormValue: boolean) => {
    console.log(`Switcher for ${qItem.linkId}: User Chose THEIR FORM VALUE = ${userChoosesTheirFormValue}`);
    setPreferUserFormValueInState(userChoosesTheirFormValue);
    if (onValuePreferenceChange) {
      onValuePreferenceChange(qItem.linkId, userChoosesTheirFormValue);
    }
  };
  
  // State for individual field preferences within a complex item. Key is like "rowKey:fieldLinkId"
  // Value: true = prefer user's current form value for this sub-field, false = prefer server
  const [fieldPreferences, setFieldPreferences] = useState<Record<string, boolean>>({});

  const handleComplexFieldPreferenceChange = (rowKeyOrFieldLinkId: string, subFieldLinkId: string | null, userPrefersTheirFormVal: boolean) => {
    const key = subFieldLinkId ? `${rowKeyOrFieldLinkId}:${subFieldLinkId}` : rowKeyOrFieldLinkId;
    setFieldPreferences(prev => ({ ...prev, [key]: userPrefersTheirFormVal }));
    if (onValuePreferenceChange) {
      onValuePreferenceChange(qItem.linkId, userPrefersTheirFormVal);
    }
  };

  const isPreferringUserFormValueForField = (rowKeyOrFieldLinkId: string, subFieldLinkId: string | null): boolean => {
    const key = subFieldLinkId ? `${rowKeyOrFieldLinkId}:${subFieldLinkId}` : rowKeyOrFieldLinkId;
    return fieldPreferences[key] === undefined ? true : fieldPreferences[key]; // Default to user preferring THEIR CURRENT FORM VALUE for sub-fields
  };

  // Detection for complex items
  const isGrid = qItem.extension?.some(
    (e) => e.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
           e.valueCodeableConcept?.coding?.some((c) => c.code === 'grid')
  ) || (qItem.type === 'group' && !qItem.repeats); // Non-repeating group can be a grid

  const isGroupTable = qItem.extension?.some(
    (e) => e.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
           e.valueCodeableConcept?.coding?.some((c) => c.code === 'gtable')
  ) && qItem.repeats === true;

  // --- GTABLE (REPEATING GROUP TABLE) HANDLING ---
  if (isGroupTable) {
    console.log(`HANDLING GTABLE: ${qItem.linkId}`, { currentUserFormQRItems, serverSuggestedQRItems });
    const gtableChanges = detectGTableChanges(qItem, currentUserFormQRItems || [], serverSuggestedQRItems || []);

    if (gtableChanges.length === 0) {
      // Add detailed logging if no changes are detected for a gtable
      console.log(`No GTable changes detected for ${qItem.linkId}. Data examined:`);
      console.log("  User Form Rows (currentUserFormQRItems):", JSON.stringify(currentUserFormQRItems, null, 2));
      console.log("  Server Suggested Rows (serverSuggestedQRItems):", JSON.stringify(serverSuggestedQRItems, null, 2));
      return <Typography sx={{p:1, fontStyle: 'italic'}} variant="body2">No changes in table: {qItem.text || qItem.linkId}</Typography>;
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5, width: '100%' }}>
        {gtableChanges.map((rowChange, rowIndex) => {
          let rowTitle = `Row ${rowIndex + 1}`;
          const identifiableCellItem = rowChange.userFormRowData?.item?.[0] || rowChange.serverRowData?.item?.[0];
          if (identifiableCellItem?.answer?.[0]) {
            const firstCellDef = qItem.item?.find(col => col.linkId === identifiableCellItem.linkId);
            rowTitle = `${firstCellDef?.text || identifiableCellItem.linkId}: ${getAnswerValueAsString(identifiableCellItem.answer[0])}`;
          }
          if (rowChange.status === 'added') rowTitle += ' (New in your form)';
          if (rowChange.status === 'removed') rowTitle += ' (Removed from your form)';
          
          return (
            <Box key={rowChange.rowKey} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 1.5, mb: 1}}>
              <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 'bold', mb:1 }}>
                {rowTitle} 
                {rowChange.status !== 'added' && rowChange.status !== 'removed' && 
                  <Typography component="span" variant="caption" color='text.secondary'> - {rowChange.status.toUpperCase()}</Typography>}
              </Typography>
              {Object.entries(rowChange.changedFields).map(([fieldLinkId, fieldChange]) => (
                <Box key={fieldLinkId} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 1, alignItems: 'flex-start', pl: 2 }}>
                  <Typography variant="body2" sx={{minWidth: '180px', fontWeight: 'medium', pt: '6px'}}>{fieldChange.qSubItem.text || fieldLinkId}:</Typography>
                  {/* YOUR CURRENT VALUE (user's form) */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={isPreferringUserFormValueForField(rowChange.rowKey, fieldLinkId)}
                          onChange={() => handleComplexFieldPreferenceChange(rowChange.rowKey, fieldLinkId, true)}
                          sx={{p:0, mr: 0.5}}
                        />
                      }
                      label={<Typography variant="overline" fontSize={8} color="text.secondary">YOUR CURRENT VALUE</Typography>}
                      sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}
                    />
                    <Box sx={{ 
                      padding: 1, border: '1px solid #eee', borderRadius: 1, minHeight: '36px',
                      bgcolor: isPreferringUserFormValueForField(rowChange.rowKey, fieldLinkId) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      width: '100%'
                    }}>
                      <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                        {fieldChange.userFormValue || (rowChange.status === 'removed' ? '-' : 'Not set')} 
                      </Typography>
                    </Box>
                  </Box>
                  {/* SUGGESTED VALUE (FROM SERVER) */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          size="small" 
                          checked={!isPreferringUserFormValueForField(rowChange.rowKey, fieldLinkId)}
                          onChange={() => handleComplexFieldPreferenceChange(rowChange.rowKey, fieldLinkId, false)}
                          sx={{p:0, mr: 0.5}}
                        />
                      }
                      label={<Typography variant="overline" fontSize={8} color="text.secondary">SUGGESTED (SERVER)</Typography>}
                      sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}
                    />
                    <Box sx={{ 
                      padding: 1, border: '1px solid #eee', borderRadius: 1, minHeight: '36px',
                      bgcolor: !isPreferringUserFormValueForField(rowChange.rowKey, fieldLinkId) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      width: '100%'
                    }}>
                      <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                        {fieldChange.serverValue || (rowChange.status === 'added' ? '-' : 'Not set')} 
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
    );
  }

  // --- GRID (NON-REPEATING GROUP) HANDLING ---
  if (isGrid) {
    console.log(`HANDLING GRID: ${qItem.linkId}`);
    const gridChanges: Array<{ qSubItem: QuestionnaireItem; serverValue: string | null; userFormValue: string | null }> = [];
    (qItem.item || []).forEach(subItem => {
      const serverAnswer = serverSuggestedQRItem?.item?.find(i => i.linkId === subItem.linkId)?.answer?.[0];
      const userFormAnswer = currentUserFormQRItem?.item?.find(i => i.linkId === subItem.linkId)?.answer?.[0];
      const serverValStr = serverAnswer ? getAnswerValueAsString(serverAnswer) : null;
      const userFormValStr = userFormAnswer ? getAnswerValueAsString(userFormAnswer) : null;

      if (serverValStr !== userFormValStr) {
        gridChanges.push({ qSubItem: subItem, serverValue: serverValStr, userFormValue: userFormValStr });
      }
    });

    if (gridChanges.length === 0) {
      return <Typography sx={{p:1, fontStyle: 'italic'}} variant="body2">No changes in grid: {qItem.text || qItem.linkId}</Typography>;
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5, width: '100%' }}>
        {gridChanges.map((change) => (
          <Box key={change.qSubItem.linkId} sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 1, alignItems: 'flex-start', pl:1}}>
            <Typography variant="body2" sx={{minWidth: '180px', fontWeight: 'medium', pt: '6px'}}>{change.qSubItem.text || change.qSubItem.linkId}:</Typography>
            {/* YOUR CURRENT VALUE */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    size="small" 
                    checked={isPreferringUserFormValueForField(qItem.linkId, change.qSubItem.linkId)}
                    onChange={() => handleComplexFieldPreferenceChange(qItem.linkId, change.qSubItem.linkId, true)}
                    sx={{p:0, mr: 0.5}}
                  />
                }
                label={<Typography variant="overline" fontSize={8} color="text.secondary">YOUR CURRENT VALUE</Typography>}
                sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}
              />
              <Box sx={{ 
                padding: 1, border: '1px solid #eee', borderRadius: 1, minHeight: '36px',
                bgcolor: isPreferringUserFormValueForField(qItem.linkId, change.qSubItem.linkId) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                width: '100%'
              }}>
                <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                  {change.userFormValue || 'Not set'}
                </Typography>
              </Box>
            </Box>
            {/* SUGGESTED (SERVER) */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    size="small" 
                    checked={!isPreferringUserFormValueForField(qItem.linkId, change.qSubItem.linkId)}
                    onChange={() => handleComplexFieldPreferenceChange(qItem.linkId, change.qSubItem.linkId, false)}
                    sx={{p:0, mr: 0.5}}
                  />
                }
                label={<Typography variant="overline" fontSize={8} color="text.secondary">SUGGESTED (SERVER)</Typography>}
                sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}
              />
              <Box sx={{ 
                padding: 1, border: '1px solid #eee', borderRadius: 1, minHeight: '36px',
                bgcolor: !isPreferringUserFormValueForField(qItem.linkId, change.qSubItem.linkId) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                width: '100%'
              }}>
                <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                  {change.serverValue || 'Not set'}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  // --- FALLBACK FOR SIMPLE FIELDS ---
  const serverSuggestedValues = extractFormattedValues(qItem, serverSuggestedQRItem, serverSuggestedQRItems);
  const userCurrentValues = extractFormattedValues(qItem, currentUserFormQRItem, currentUserFormQRItems);

  const isDateField = qItem.type === 'date' || qItem.text?.toLowerCase().includes('date');
  let displayServerValues: string[] = [];
  let displayUserCurrentValues: string[] = [];

  const noChanges = serverSuggestedValues.length === userCurrentValues.length && 
                  serverSuggestedValues.every((val, idx) => val === userCurrentValues[idx]);

  if (isDateField || !noChanges) {
    displayServerValues = serverSuggestedValues;
    displayUserCurrentValues = userCurrentValues;
  } else {
    displayServerValues = serverSuggestedValues.length > 0 ? serverSuggestedValues : [];
    displayUserCurrentValues = serverSuggestedValues.length > 0 ? serverSuggestedValues : [];
  }
  
  if (displayServerValues.length === 0 && displayUserCurrentValues.length === 0 && noChanges) {
    return (
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="body2">
          {(serverSuggestedValues.join(',') || 'No data')} (No change)
        </Typography>
      </Box>
    );
  }
  
  const userPrefersTheirCurrentValueForSimpleField = preferUserFormValueInState === true;

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 0.25, alignItems: 'center' }}>
      {/* YOUR CURRENT VALUE Box */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={userPrefersTheirCurrentValueForSimpleField}
              onChange={() => handleSelection(true)} 
            />
          }
          label={<Typography variant="overline" fontSize={8} color="text.secondary">YOUR CURRENT VALUE</Typography>}
          sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}
        />
        <Box sx={{
          padding: 1,
          border: '1px solid #eee',
          borderRadius: 1,
          minHeight: '36px',
          bgcolor: userPrefersTheirCurrentValueForSimpleField ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
          width: '100%'
        }}>
          {displayUserCurrentValues.length > 0 ? (
            displayUserCurrentValues.map((value, index) => (
              <Typography key={index} variant="body2" sx={{ color: userPrefersTheirCurrentValueForSimpleField ? 'primary.main' : '#2e7d32', fontWeight: 'medium' }}>
                {value}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              {isDateField ? (userCurrentValues.join(',') || '-') : 'No value'}
            </Typography>
          )}
        </Box>
      </Box>
      
      {/* SUGGESTED VALUE (FROM SERVER) Box */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={!userPrefersTheirCurrentValueForSimpleField}
              onChange={() => handleSelection(false)} 
            />
          }
          label={<Typography variant="overline" fontSize={8} color="text.secondary">SUGGESTED (SERVER)</Typography>}
          sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}
        />
        <Box sx={{
          padding: 1,
          border: '1px solid #eee',
          borderRadius: 1,
          minHeight: '36px',
          bgcolor: !userPrefersTheirCurrentValueForSimpleField ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
          width: '100%'
        }}>
          {displayServerValues.length > 0 ? (
            displayServerValues.map((value, index) => (
              <Typography key={index} variant="body2" sx={{ color: !userPrefersTheirCurrentValueForSimpleField ? 'primary.main' : '#d32f2f', fontWeight: 'medium' }}>
                {value}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              {isDateField ? (serverSuggestedValues.join(',') || '-') : 'No value'}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// --- Helper function to detect changes in GTables ---
function detectGTableChanges(
  qItem: QuestionnaireItem, 
  currentUserFormRows: QuestionnaireResponseItem[], 
  serverSuggestedRows: QuestionnaireResponseItem[]
): RowChange[] {
  console.log('detectGTableChanges: Received User Form Rows:', JSON.stringify(currentUserFormRows, null, 2));
  console.log('detectGTableChanges: Received Server Suggested Rows:', JSON.stringify(serverSuggestedRows, null, 2));
  
  const changes: RowChange[] = [];
  const maxRows = Math.max(currentUserFormRows.length, serverSuggestedRows.length);

  for (let i = 0; i < maxRows; i++) {
    const userFormRow = currentUserFormRows[i];       
    const serverRow = serverSuggestedRows[i]; 
    const rowKey = `row-${i}`;
    const changedFields: Record<string, FieldChange> = {};
    let status: RowChange['status'] = 'modified';
    let rowHasActualChanges = false;

    if (!userFormRow && serverRow) status = 'removed'; 
    if (userFormRow && !serverRow) status = 'added';   

    console.log(`Comparing Row ${i}: UserFormRow exists: ${!!userFormRow}, ServerRow exists: ${!!serverRow}`);

    (qItem.item || []).forEach(colDef => {
      const linkId = colDef.linkId;
      
      const userFormCellItem = userFormRow?.item?.find(cell => cell.linkId === linkId);
      const userFormCellAnswer = userFormCellItem?.answer?.[0];
      const userFormValStr = userFormCellAnswer ? getAnswerValueAsString(userFormCellAnswer) : null;
      
      const serverCellItem = serverRow?.item?.find(cell => cell.linkId === linkId);
      const serverCellAnswer = serverCellItem?.answer?.[0];
      const serverValStr = serverCellAnswer ? getAnswerValueAsString(serverCellAnswer) : null;
      
      if (colDef.text === "Clinical Status") {
        console.log(`DEBUG Clinical Status - Row ${i}, LinkId ${linkId}:`);
        console.log("  User Form Cell Answer Object:", JSON.stringify(userFormCellAnswer, null, 2));
        console.log("  User Form String Value:", userFormValStr);
        console.log("  Server Cell Answer Object:", JSON.stringify(serverCellAnswer, null, 2));
        console.log("  Server String Value:", serverValStr);
        console.log("  Comparison result (userFormValStr !== serverValStr):", userFormValStr !== serverValStr);
      }

      console.log(`  Col '${colDef.text || linkId}': UserForm='${userFormValStr}', Server='${serverValStr}'`);

      if (userFormValStr !== serverValStr) {
        console.log(`    CHANGE DETECTED for ${linkId} in row ${i}`);
        changedFields[linkId] = { 
          userFormValue: userFormValStr, 
          serverValue: serverValStr,      
          qSubItem: colDef 
        };
        rowHasActualChanges = true;
      }
    });

    if (status !== 'modified' || rowHasActualChanges) {
      changes.push({ 
        rowKey, 
        status, 
        changedFields, 
        userFormRowData: userFormRow, 
        serverRowData: serverRow 
      });
    }
  }
  console.log('detectGTableChanges: Detected changes output:', JSON.stringify(changes, null, 2));
  return changes;
}

/**
 * Extract text values from QR items or QR item arrays
 */
function extractFormattedValues(
  qItem: QuestionnaireItem,
  qrItem?: QuestionnaireResponseItem, 
  qrItems?: QuestionnaireResponseItem[]
): string[] {
  const uniqueValues = new Set<string>();

  if (qrItem?.answer && qrItem.answer.length > 0) {
    qrItem.answer.forEach((answer) => {
      const formattedValue = getAnswerValueAsString(answer) || 'N/A';
      uniqueValues.add(formattedValue);
    });
  } else if (qrItems && qrItems.length > 0 && qItem.type !== 'group') {
    const itemValues: string[] = [];
    qrItems.forEach((itemInArray) => {
      if (itemInArray.answer && itemInArray.answer.length > 0) {
        itemInArray.answer.forEach((answer) => {
          const formattedValue = getAnswerValueAsString(answer) || 'N/A';
          itemValues.push(formattedValue);
        });
      }
    });
    if (itemValues.length > 0) {
      uniqueValues.add(itemValues.join(', ')); 
    }
  } else if (qrItem?.item && qItem.type === 'group') {
    (qItem.item || []).forEach(subQ => {
        const subQRItem = qrItem.item?.find(i => i.linkId === subQ.linkId);
        if (subQRItem?.answer && subQRItem.answer.length > 0) {
            subQRItem.answer.forEach(ans => {
                uniqueValues.add(`${subQ.text || subQ.linkId}: ${getAnswerValueAsString(ans) || 'N/A'}`);
            });
        }
    });
  }

  return Array.from(uniqueValues);
}

export default SimplifiedRepopulateItemSwitcher; 
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
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { getAnswerValueAsString } from '../utils/answerFormatters';

interface SimplifiedRepopulateItemSwitcherProps {
  qItem: QuestionnaireItem;
  newQRItem?: QuestionnaireResponseItem;
  oldQRItem?: QuestionnaireResponseItem;
  newQRItems?: QuestionnaireResponseItem[];
  oldQRItems?: QuestionnaireResponseItem[];
  onValuePreferenceChange: (linkId: string, preferOld: boolean | undefined) => void;
  initialPreference?: boolean;
}

// Helper interfaces for data tracking
interface FieldChange {
  old: string | null;
  new: string | null;
}

interface ConditionData {
  name: string;
  fields: Record<string, FieldChange>;
}

/**
 * A simplified version of RepopulateItemSwitcher that only shows text-based old/new values
 * Rather than using "minimal" versions of complex controls
 */
function SimplifiedRepopulateItemSwitcher(props: SimplifiedRepopulateItemSwitcherProps) {
  const { qItem, oldQRItem, newQRItem, newQRItems, oldQRItems, onValuePreferenceChange, initialPreference } = props;
  
  const [preferOldInState, setPreferOldInState] = useState<boolean | undefined>(
    initialPreference === undefined ? false : initialPreference // Default to NEW if no initial preference
  );

  const handleSelection = (selectedOld: boolean) => {
    console.log(`Switcher for ${qItem.linkId}: Selected ${selectedOld ? 'OLD' : 'NEW'}`);
    setPreferOldInState(selectedOld);
    if (onValuePreferenceChange) {
      onValuePreferenceChange(qItem.linkId, selectedOld);
    }
  };

  // Check if a specific field prefers old value
  const isPreferringOld = (conditionName: string, fieldName: string) => {
    const key = `${conditionName}:${fieldName}`;
    return preferOldInState === true;
  };

  // Check if this is a medical history item
  const isMedicalHistory = qItem.text?.includes('Medical history');
  
  // For medical history, use dynamic detection of changes
  if (isMedicalHistory) {
    console.log("USING ADAPTIVE DETECTION FOR MEDICAL HISTORY");
    
    // Function to detect all changes in medical history
    const detectChanges = (): ConditionData[] => {
      // Save the old and new QR items for logging
      console.log("Detecting changes from:", oldQRItem, newQRItem);
      
      // Extract conditions and their data from old and new items
      const oldConditions: Record<string, Record<string, string>> = {};
      const newConditions: Record<string, Record<string, string>> = {};
      
      // Process old items
      if (oldQRItem?.item) {
        let currentCondition = '';
        
        oldQRItem.item.forEach(item => {
          if (item.text?.includes('Condition:')) {
            currentCondition = item.text;
            oldConditions[currentCondition] = {};
          } else if (currentCondition && item.text && item.answer && item.answer.length > 0) {
            const value = getAnswerValueAsString(item.answer[0]);
            if (value && value !== 'DD/MM/YYYY') {
              oldConditions[currentCondition][item.text] = value;
            }
          }
        });
      }
      
      // Process new items
      if (newQRItem?.item) {
        let currentCondition = '';
        
        newQRItem.item.forEach(item => {
          if (item.text?.includes('Condition:')) {
            currentCondition = item.text;
            newConditions[currentCondition] = {};
          } else if (currentCondition && item.text && item.answer && item.answer.length > 0) {
            const value = getAnswerValueAsString(item.answer[0]);
            if (value && value !== 'DD/MM/YYYY') {
              newConditions[currentCondition][item.text] = value;
            }
          }
        });
      }
      
      console.log("Old conditions:", oldConditions);
      console.log("New conditions:", newConditions);
      
      // Find changes by comparing old and new
      const changes: ConditionData[] = [];
      
      // Check all conditions in oldConditions
      Object.keys(oldConditions).forEach(condition => {
        const oldFields = oldConditions[condition];
        const newFields = newConditions[condition] || {};
        const changedFields: Record<string, FieldChange> = {};
        
        // Check for changed fields
        Object.keys(oldFields).forEach(field => {
          if (newFields[field] && newFields[field] !== oldFields[field]) {
            changedFields[field] = {
              old: oldFields[field],
              new: newFields[field]
            };
          } else if (!newFields[field]) {
            changedFields[field] = {
              old: oldFields[field],
              new: null
            };
          }
        });
        
        // Check for new fields that didn't exist in old
        Object.keys(newFields).forEach(field => {
          if (!oldFields[field]) {
            changedFields[field] = {
              old: null,
              new: newFields[field]
            };
          }
        });
        
        // If we found changes, add to the result
        if (Object.keys(changedFields).length > 0) {
          changes.push({
            name: condition,
            fields: changedFields
          });
        }
      });
      
      // Check for entirely new conditions
      Object.keys(newConditions).forEach(condition => {
        if (!oldConditions[condition]) {
          const newFields = newConditions[condition];
          const changedFields: Record<string, FieldChange> = {};
          
          Object.keys(newFields).forEach(field => {
            changedFields[field] = {
              old: null,
              new: newFields[field]
            };
          });
          
          changes.push({
            name: condition,
            fields: changedFields
          });
        }
      });
      
      console.log("Detected changes:", changes);
      return changes;
    };
    
    // Get dynamically detected changes
    const changes = detectChanges();
    
    // If we found changes, display them
    if (changes.length > 0) {
      // When any field in medical history is selected to prefer old, update parent
      const handleMedicalHistoryPreferenceChange = (conditionName: string, fieldName: string, preferOld: boolean) => {
        // Update the local state first
        handleSelection(preferOld);
        
        // For medical history, any selection means the entire item should use old values
        if (preferOld && onValuePreferenceChange) {
          console.log(`Medical history: forcing all fields to preferOld=${preferOld}`);
          onValuePreferenceChange(qItem.linkId, true);
        }
      };
      
      // Display ALL detected changes in a vertical list
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 0.25 }}>
          {changes.map((change, changeIndex) => (
            <Box key={changeIndex}>
              {/* Display the condition name as a header */}
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                {change.name}
              </Typography>
              
              {/* Display each changed field for this condition */}
              {Object.entries(change.fields).map(([fieldName, fieldData], fieldIndex) => (
                <Box 
                  key={fieldIndex} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' }, 
                    gap: 2,
                    mb: 1,
                    pb: fieldIndex < Object.keys(change.fields).length - 1 ? 1 : 0,
                    borderBottom: fieldIndex < Object.keys(change.fields).length - 1 ? '1px dashed #eee' : 'none'
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={isPreferringOld(change.name, fieldName)}
                    onChange={(e) => {
                      // Stop event propagation to prevent affecting the parent checkbox
                      e.stopPropagation();
                      
                      const preferOld = e.target.checked;
                      console.log(`Medical history checkbox change for ${fieldName}: use old value = ${preferOld}`);
                      handleMedicalHistoryPreferenceChange(change.name, fieldName, preferOld);
                      
                      // Notify parent component
                      if (onValuePreferenceChange) {
                        console.log(`Medical history: value preference change to ${preferOld ? "OLD" : "NEW"} for ${qItem.linkId}`);
                        onValuePreferenceChange(qItem.linkId, preferOld);
                      }
                    }}
                  />
                </Box>
              ))}
              
              {/* Add a divider between conditions if not the last one */}
              {changeIndex < changes.length - 1 && (
                <Box sx={{ borderBottom: '1px solid #eee', my: 1 }} />
              )}
            </Box>
          ))}
        </Box>
      );
    }
  }

  // CORRECTED: oldValues should be from oldQRItem, newValues from newQRItem
  const oldValues = extractFormattedValues(qItem, oldQRItem, oldQRItems);
  const newValues = extractFormattedValues(qItem, newQRItem, newQRItems);

  const isDateField = qItem.type === 'date' || qItem.text?.toLowerCase().includes('date');
  
  // Determine what to display based on changes and field type
  let displayOldValues: string[] = [];
  let displayNewValues: string[] = [];

  if (isDateField) {
    // For date fields, always show both, even if identical, to be explicit.
    displayOldValues = oldValues;
    displayNewValues = newValues;
  } else {
    // For other fields, show differences or the common value if no change.
    const commonValues = oldValues.filter(v => newValues.includes(v));
    const uniqueToOld = oldValues.filter(v => !newValues.includes(v));
    const uniqueToNew = newValues.filter(v => !oldValues.includes(v));

    if (uniqueToOld.length === 0 && uniqueToNew.length === 0) {
      // No changes, display the common value(s) or "No change"
      displayOldValues = commonValues.length > 0 ? commonValues : [];
      displayNewValues = commonValues.length > 0 ? commonValues : []; 
    } else {
      displayOldValues = uniqueToOld;
      displayNewValues = uniqueToNew;
    }
  }
  
  // If no changes and not a date field and no common value to show, display a message
  if (!isDateField && displayOldValues.length === 0 && displayNewValues.length === 0 && oldValues.join(',') === newValues.join(',')) {
    return (
      <Box sx={{ mt: 0.5 }}>
        <Typography variant="body2">
          {oldValues.join(',') || 'No change'} (No change)
        </Typography>
      </Box>
    );
  }

  // Show a side-by-side comparison for non-date fields
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 0.25, alignItems: 'center' }}>
      {/* YOUR CURRENT VALUE Box */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={preferOldInState === true} // This represents selecting "Your Current Value"
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
          bgcolor: preferOldInState === true ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
          width: '100%'
        }}>
          {displayOldValues.length > 0 ? (
            displayOldValues.map((value, index) => (
              <Typography key={index} variant="body2" sx={{ color: preferOldInState === true ? 'primary.main' : '#d32f2f', fontWeight: 'medium' }}>
                {value}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              {isDateField ? (oldValues.join(',') || '-') : 'No value'}
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
              checked={preferOldInState === false} // This represents selecting "Suggested Value"
              onChange={() => handleSelection(false)}
            />
          }
          label={<Typography variant="overline" fontSize={8} color="text.secondary">SUGGESTED VALUE (FROM SERVER)</Typography>}
          sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}
        />
        <Box sx={{
          padding: 1,
          border: '1px solid #eee',
          borderRadius: 1,
          minHeight: '36px',
          bgcolor: preferOldInState === false ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
          width: '100%'
        }}>
          {displayNewValues.length > 0 ? (
            displayNewValues.map((value, index) => (
              <Typography key={index} variant="body2" sx={{ color: preferOldInState === false ? 'primary.main' : '#2e7d32', fontWeight: 'medium' }}>
                {value}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" fontStyle="italic">
              {isDateField ? (newValues.join(',') || '-') : 'No value'}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Extract text values from QR items or QR item arrays
 */
function extractFormattedValues(
  qItem: QuestionnaireItem,
  qrItem?: QuestionnaireResponseItem,
  qrItems?: QuestionnaireResponseItem[]
): string[] {
  const values: string[] = [];
  const uniqueValues = new Set<string>();

  // Handle the special case of "Recorded Date" fields
  const isRecordedDate = qItem.text?.includes('Recorded Date') || 
                          qItem.linkId?.includes('recordedDate');
  
  // Medical history special case detection
  const isMedicalHistoryList = qItem.text?.includes('Medical history and current problems list');
  
  // Special handling for date fields
  const isDateField = qItem.type === 'date' || qItem.text?.toLowerCase().includes('date');
  
  if (isRecordedDate || isMedicalHistoryList || isDateField) {
    console.log('Special field detected:', qItem.text || qItem.linkId);
    console.log('QR item:', qrItem);
    
    // For all date fields, ensure we normalize the format
    if (isDateField && qrItem?.answer) {
      qrItem.answer.forEach(answer => {
        if (answer.valueDate) {
          // Normalize date format to ensure consistent comparison
          const formattedDate = answer.valueDate;
          uniqueValues.add(formattedDate);
          
          // Log the actual date value for debugging
          console.log(`Date value detected: ${formattedDate}`);
        }
      });
    }
    
    // If this is the medical history list, process it specially
    if (isMedicalHistoryList && qrItem?.item) {
      // Track dates by condition
      let currentCondition = '';
      
      qrItem.item.forEach(item => {
        if (item.text?.includes('Condition:')) {
          currentCondition = item.text || '';
        } else if (currentCondition && item.text && item.answer && item.answer.length > 0) {
          const valueText = getAnswerValueAsString(item.answer[0]);
          if (valueText && valueText !== 'DD/MM/YYYY') {
            uniqueValues.add(`${item.text}: ${valueText}`);
          }
        }
      });
    }
  }

  // Single item with answer
  if (qrItem?.answer && qrItem.answer.length > 0) {
    qrItem.answer.forEach((answer) => {
      const formattedValue = getAnswerValueAsString(answer) || 'N/A';
      uniqueValues.add(formattedValue);
    });
  }

  // Multiple items (like repeating groups)
  if (qrItems && qrItems.length > 0) {
    // For groups, show each item
    if (qItem.type === 'group') {
      qrItems.forEach((item, index) => {
        // For each repeating group, add a separator
        if (index > 0 && values.length > 0) {
          values.push('---'); // Separator between repeat items
        }
        
        // If the group has subitems, extract their values
        if (item.item && item.item.length > 0) {
          item.item.forEach((subItem) => {
            if (subItem.answer && subItem.answer.length > 0) {
              // For each subitem in a group, show the text and value
              const subQItem = qItem.item?.find((qi) => qi.linkId === subItem.linkId);
              if (subQItem) {
                const label = subQItem.text || subItem.linkId;
                subItem.answer.forEach((answer) => {
                  const formattedValue = getAnswerValueAsString(answer) || 'N/A';
                  uniqueValues.add(`${label}: ${formattedValue}`);
                });
              }
            }
          });
        }
      });
    } else {
      // For repeating items, show comma-separated values
      const itemValues: string[] = [];
      qrItems.forEach((item) => {
        if (item.answer && item.answer.length > 0) {
          item.answer.forEach((answer) => {
            const formattedValue = getAnswerValueAsString(answer) || 'N/A';
            itemValues.push(formattedValue);
          });
        }
      });
      
      if (itemValues.length > 0) {
        uniqueValues.add(itemValues.join(', '));
      }
    }
  }

  // Convert Set to Array to remove duplicates
  return Array.from(uniqueValues);
}

export default SimplifiedRepopulateItemSwitcher; 
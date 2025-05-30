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

import React, { useMemo, useRef } from 'react';
import { Box, Checkbox, FormControlLabel, Typography } from '@mui/material';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { 
  detectChanges, 
  groupChangesByRow, 
  generatePreferenceKey,
  type ChangeEntry 
} from '../utils/changeDetection';

interface SimplifiedRepopulateItemSwitcherProps {
  qItem: QuestionnaireItem;
  serverSuggestedQRItem?: QuestionnaireResponseItem;
  currentUserFormQRItem?: QuestionnaireResponseItem;
  serverSuggestedQRItems?: QuestionnaireResponseItem[];
  currentUserFormQRItems?: QuestionnaireResponseItem[];
  onValuePreferenceChange: (linkId: string, preferUserFormValue: boolean | undefined) => void;
  fieldPreferences: Record<string, boolean | undefined>;
}

function SimplifiedRepopulateItemSwitcher(props: SimplifiedRepopulateItemSwitcherProps) {
  const {
    qItem,
    serverSuggestedQRItem,
    currentUserFormQRItem,
    serverSuggestedQRItems,
    currentUserFormQRItems,
    onValuePreferenceChange,
    fieldPreferences
  } = props;

  // Track which preferences have been initialized to prevent re-initialization
  const initializedPreferences = useRef<Set<string>>(new Set());

  // Memoize changes detection to prevent infinite loops
  const changes = useMemo(() => {
    return detectChanges({
      qItem,
      serverSuggestedQRItem,
      currentUserFormQRItem,
      serverSuggestedQRItems,
      currentUserFormQRItems
    });
  }, [qItem, serverSuggestedQRItem, currentUserFormQRItem, serverSuggestedQRItems, currentUserFormQRItems]);

  // Send default preferences for all detected changes to the dialog
  React.useEffect(() => {
    console.log(
      `🔧 SWITCHER INIT: Setting up default preferences for ${qItem.text || qItem.linkId}`
    );
    console.log(`🔧 SWITCHER INIT: Found ${changes.length} changes`);

    changes.forEach((change) => {
      const { fullKey } = generatePreferenceKey(qItem.linkId, change);

      // Only send default preference if not already initialized
      if (!initializedPreferences.current.has(fullKey) && fieldPreferences[fullKey] === undefined) {
        console.log(
          `🔧 SWITCHER INIT: Setting default preference for ${fullKey} = true (user prefers their current value)`
        );
        onValuePreferenceChange(fullKey, true);
        initializedPreferences.current.add(fullKey);
      }
    });
  }, [changes, qItem.linkId, onValuePreferenceChange]);

  const handleComplexFieldPreferenceChange = (
    rowKeyOrFieldLinkId: string,
    subFieldLinkId: string | null,
    userPrefersTheirFormVal: boolean
  ) => {
    const fullKey = subFieldLinkId ? `${rowKeyOrFieldLinkId}:${subFieldLinkId}` : rowKeyOrFieldLinkId;
    onValuePreferenceChange(fullKey, userPrefersTheirFormVal);
  };

  const isPreferringUserFormValueForField = (
    rowKeyOrFieldLinkId: string,
    subFieldLinkId: string | null
  ): boolean => {
    const fullKey = subFieldLinkId ? `${rowKeyOrFieldLinkId}:${subFieldLinkId}` : rowKeyOrFieldLinkId;
    return fieldPreferences[fullKey] ?? true; // Default to true (user prefers their current value)
  };

  if (changes.length === 0) {
    return (
      <Typography sx={{ p: 1, fontStyle: 'italic' }} variant="body2">
        No changes in: {qItem.text || qItem.linkId}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5, width: '100%' }}>
      {(() => {
        if (qItem.repeats) {
          // Group changes by row for repeating items
          const groupedByRow = groupChangesByRow(changes);

          return groupedByRow.map((rowGroup, groupIdx) => (
            <React.Fragment key={`rowgroup-${rowGroup.rowIndex}-${groupIdx}`}>
              <Typography
                variant="subtitle2"
                sx={{ mt: groupIdx === 0 ? 0.5 : 2, mb: 0.5, pl: 1, fontWeight: 'bold' }}>
                {rowGroup.rowLabelForRow}
              </Typography>
              {rowGroup.itemsInRow.map((change, itemIdx) => {
                const { preferenceKeyBase, preferenceKeySuffix } = generatePreferenceKey(qItem.linkId, change);
                console.log(
                  `🔧 MEDICAL HISTORY DEBUG: Row ${change.rowIndex}, Field: ${change.qSubItem.text} (${change.qSubItem.linkId})`
                );
                console.log(`  Preference key base: ${preferenceKeyBase}`);
                console.log(`  Preference key suffix: ${preferenceKeySuffix}`);
                console.log(`  Full preference key: ${preferenceKeyBase}:${preferenceKeySuffix}`);
                return (
                  <Box
                    key={`${preferenceKeyBase}-${preferenceKeySuffix}-${itemIdx}`}
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 2,
                      mt: 0.5,
                      alignItems: 'flex-start',
                      pl: 2 /* Indent fields under row heading */
                    }}>
                    <Typography
                      variant="body2"
                      sx={{
                        width: '280px',
                        fontWeight: 'medium',
                        pt: '6px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                      {`${change.fieldLabelQItem.text || change.fieldLabelQItem.linkId}:`}
                    </Typography>
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch'
                      }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={isPreferringUserFormValueForField(
                              preferenceKeyBase,
                              preferenceKeySuffix
                            )}
                            onChange={() =>
                              handleComplexFieldPreferenceChange(
                                preferenceKeyBase,
                                preferenceKeySuffix,
                                true
                              )
                            }
                            sx={{ p: 0, mr: 0.5 }}
                          />
                        }
                        label={
                          <Typography variant="overline" fontSize={8} color="text.secondary">
                            YOUR CURRENT VALUE
                          </Typography>
                        }
                        sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}
                      />
                      <Box
                        sx={{
                          padding: 1,
                          border: '1px solid #eee',
                          borderRadius: 1,
                          minHeight: '36px',
                          bgcolor: isPreferringUserFormValueForField(
                            preferenceKeyBase,
                            preferenceKeySuffix
                          )
                            ? 'rgba(25, 118, 210, 0.08)'
                            : 'transparent',
                          width: '100%'
                        }}>
                        <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                          {change.userFormValue || 'Not set'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch'
                      }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={
                              !isPreferringUserFormValueForField(
                                preferenceKeyBase,
                                preferenceKeySuffix
                              )
                            }
                            onChange={() =>
                              handleComplexFieldPreferenceChange(
                                preferenceKeyBase,
                                preferenceKeySuffix,
                                false
                              )
                            }
                            sx={{ p: 0, mr: 0.5 }}
                          />
                        }
                        label={
                          <Typography variant="overline" fontSize={8} color="text.secondary">
                            SUGGESTED (SERVER)
                          </Typography>
                        }
                        sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}
                      />
                      <Box
                        sx={{
                          padding: 1,
                          border: '1px solid #eee',
                          borderRadius: 1,
                          minHeight: '36px',
                          bgcolor: !isPreferringUserFormValueForField(
                            preferenceKeyBase,
                            preferenceKeySuffix
                          )
                            ? 'rgba(25, 118, 210, 0.08)'
                            : 'transparent',
                          width: '100%'
                        }}>
                        <Typography variant="body2" sx={{ color: '#1976d2' }}>
                          {change.serverValue || 'Not set'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </React.Fragment>
          ));
        } else {
          // Handle simple (non-repeating) items
          return changes.map((change, idx) => {
            const { preferenceKeyBase, preferenceKeySuffix } = generatePreferenceKey(qItem.linkId, change);
            return (
              <Box
                key={`${preferenceKeyBase}-${preferenceKeySuffix}-${idx}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                  mt: 0.5,
                  alignItems: 'flex-start'
                }}>
                <Typography
                  variant="body2"
                  sx={{
                    width: '280px',
                    fontWeight: 'medium',
                    pt: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                  {`${change.fieldLabelQItem.text || change.fieldLabelQItem.linkId}:`}
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch'
                  }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={isPreferringUserFormValueForField(
                          preferenceKeyBase,
                          preferenceKeySuffix
                        )}
                        onChange={() =>
                          handleComplexFieldPreferenceChange(
                            preferenceKeyBase,
                            preferenceKeySuffix,
                            true
                          )
                        }
                        sx={{ p: 0, mr: 0.5 }}
                      />
                    }
                    label={
                      <Typography variant="overline" fontSize={8} color="text.secondary">
                        YOUR CURRENT VALUE
                      </Typography>
                    }
                    sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}
                  />
                  <Box
                    sx={{
                      padding: 1,
                      border: '1px solid #eee',
                      borderRadius: 1,
                      minHeight: '36px',
                      bgcolor: isPreferringUserFormValueForField(
                        preferenceKeyBase,
                        preferenceKeySuffix
                      )
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'transparent',
                      width: '100%'
                    }}>
                    <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                      {change.userFormValue || 'Not set'}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch'
                  }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={
                          !isPreferringUserFormValueForField(
                            preferenceKeyBase,
                            preferenceKeySuffix
                          )
                        }
                        onChange={() =>
                          handleComplexFieldPreferenceChange(
                            preferenceKeyBase,
                            preferenceKeySuffix,
                            false
                          )
                        }
                        sx={{ p: 0, mr: 0.5 }}
                      />
                    }
                    label={
                      <Typography variant="overline" fontSize={8} color="text.secondary">
                        SUGGESTED (SERVER)
                      </Typography>
                    }
                    sx={{ ml: 0, mb: 0.5, alignSelf: 'flex-start' }}
                  />
                  <Box
                    sx={{
                      padding: 1,
                      border: '1px solid #eee',
                      borderRadius: 1,
                      minHeight: '36px',
                      bgcolor: !isPreferringUserFormValueForField(
                        preferenceKeyBase,
                        preferenceKeySuffix
                      )
                        ? 'rgba(25, 118, 210, 0.08)'
                        : 'transparent',
                      width: '100%'
                    }}>
                    <Typography variant="body2" sx={{ color: '#1976d2' }}>
                      {change.serverValue || 'Not set'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          });
        }
      })()}
    </Box>
  );
}

export default SimplifiedRepopulateItemSwitcher;

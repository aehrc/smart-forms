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

import { useCallback, useEffect, useRef } from 'react';
import type { QuestionnaireItem } from 'fhir/r4';
import { DEBOUNCE_DURATION } from '../utils/debounce';
import useValidationFeedback from './useValidationFeedback';
import { useQuestionnaireResponseStore } from '../stores';

interface SynchronizedValidationOptions {
  qItem: QuestionnaireItem;
  feedbackFromParent: string | undefined;
  input: string;
  hasBlurred: boolean;
  onValidationSync?: (isValid: boolean, errorMessage: string) => void;
}

interface SynchronizedValidationResult {
  feedback: string;
  syncValidation: () => void;
}

/**
 * Hook that synchronizes immediate inline validation with debounced store validation.
 * 
 * This hook maintains the original validation behavior while adding synchronization
 * to fix the timing mismatch issue where:
 * - Inline validation messages appear immediately based on input state
 * - Store validation state updates after 300ms debounce
 * 
 * The hook provides:
 * 1. Immediate validation feedback (using original useValidationFeedback)
 * 2. Synchronized state management for consistent validation timing
 * 3. Manual sync capability on blur events
 * 
 * @param options Configuration for synchronized validation
 * @returns Object with feedback and sync function
 */
function useSynchronizedValidation(options: SynchronizedValidationOptions): SynchronizedValidationResult {
  const { qItem, feedbackFromParent, input, hasBlurred, onValidationSync } = options;
  
  // Get immediate validation feedback (original behavior - MUST work the same)
  const feedback = useValidationFeedback(qItem, feedbackFromParent, input);
  
  // Get store validation state (debounced)
  const invalidItems = useQuestionnaireResponseStore.use.invalidItems();
  const storeValidationError = invalidItems[qItem.linkId];
  
  // Track sync state
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedFeedbackRef = useRef<string>('');
  
  // Determine validation states
  const hasImmediateError = feedback !== '';
  const hasStoreError = !!storeValidationError;
  const isValidationMismatched = hasImmediateError !== hasStoreError;
  
  // Sync validation state
  const syncValidation = useCallback(() => {
    // Only call sync callback if feedback has changed since last sync
    if (onValidationSync && lastSyncedFeedbackRef.current !== feedback) {
      onValidationSync(!hasImmediateError, feedback);
      lastSyncedFeedbackRef.current = feedback;
    }
    
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
  }, [hasImmediateError, feedback, onValidationSync]);
  
  // Schedule validation sync when there's a mismatch after debounce period
  useEffect(() => {
    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    // Only schedule sync if there's actually a mismatch
    if (isValidationMismatched) {
      syncTimeoutRef.current = setTimeout(() => {
        // Re-check mismatch state at sync time (store might have updated)
        const currentStoreError = useQuestionnaireResponseStore.getState().invalidItems[qItem.linkId];
        const currentHasStoreError = !!currentStoreError;
        const currentHasImmediateError = feedback !== '';
        const stillMismatched = currentHasImmediateError !== currentHasStoreError;
        
        if (stillMismatched) {
          syncValidation();
        }
      }, DEBOUNCE_DURATION + 50); // Slight delay to ensure store has updated
    }
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [feedback, isValidationMismatched, qItem.linkId, syncValidation]);
  
  // Immediate sync on blur to ensure consistency
  useEffect(() => {
    if (hasBlurred && isValidationMismatched) {
      syncValidation();
    }
  }, [hasBlurred, isValidationMismatched, syncValidation]);
  
  return {
    feedback, // Return the original feedback unchanged
    syncValidation
  };
}

export default useSynchronizedValidation; 
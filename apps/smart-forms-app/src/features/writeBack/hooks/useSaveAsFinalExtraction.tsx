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

import { useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import type { Bundle, QuestionnaireResponse } from 'fhir/r4';
import {
  buildBundleFromObservationArray,
  extractObservationBased,
  useQuestionnaireResponseStore,
  useQuestionnaireStore
} from '@aehrc/smart-forms-renderer';
import { extractResultIsOperationOutcome, inAppExtract } from '@aehrc/sdc-template-extract';
import { populateQuestionnaire } from '@aehrc/sdc-populate';
import useSmartClient from '../../../hooks/useSmartClient.ts';
import { fetchResourceCallback } from '../../prepopulate/utils/callback.ts';
import { validateExtractedBundle } from '../utils/validateExtractedBundle.ts';
import { getExtractMechanism } from '../../renderer/utils/extract.ts';
import { extractionErrorMessage } from '../../../interfaces/snackbar.interface.ts';
import CloseSnackbar from '../../../components/Snackbar/CloseSnackbar.tsx';

export interface UseSaveAsFinalExtractionOptions {
  // Called once extraction has completed and produced a bundle (possibly empty) to write back.
  // Callers use this to open their own "Save as Final" confirmation dialog.
  onExtracted: () => void;
}

export interface UseSaveAsFinalExtractionResult {
  extractMechanism: 'template-based' | 'observation-based' | null;
  writeBackEnabled: boolean;
  isExtracting: boolean;
  extractedBundle: Bundle | null;
  invalidBundleEntryIndices: Set<number> | null;
  // Runs the extraction mechanism appropriate for the current questionnaire (if any) and
  // calls onExtracted() when a bundle is ready. No-op if the questionnaire can't be extracted.
  runExtraction: () => Promise<void>;
  // Resets extraction state back to its initial values, e.g. on the writeback dialog's onExited.
  resetExtractionState: () => void;
}

// Shared by the renderer's SaveAsFinalAction and the viewer's ViewerSaveAsFinal so both
// "Save as Final" entry points extract and write back data the same way.
function useSaveAsFinalExtraction(
  options: UseSaveAsFinalExtractionOptions
): UseSaveAsFinalExtractionResult {
  const { onExtracted } = options;

  const { smartClient, patient, user, encounter, extraLaunchContext } = useSmartClient();
  const { enqueueSnackbar } = useSnackbar();

  const sourceQuestionnaire = useQuestionnaireStore.use.sourceQuestionnaire();
  const updatableResponse = useQuestionnaireResponseStore.use.updatableResponse();

  const [isExtracting, setExtracting] = useState(false);
  const [extractedBundle, setExtractedBundle] = useState<Bundle | null>(null);
  const [invalidBundleEntryIndices, setInvalidBundleEntryIndices] = useState<Set<number> | null>(
    null
  );

  const extractMechanism = useMemo(
    () => getExtractMechanism(sourceQuestionnaire),
    [sourceQuestionnaire]
  );
  const writeBackEnabled = !!extractMechanism;

  async function handleTemplateExtract() {
    // In the user-facing UI, always perform a modified-only extraction
    const modifiedOnly = true;

    setExtracting(true);

    // FhirClient not available, skip whole save process
    if (!smartClient || !patient || !user) {
      setExtracting(false);
      enqueueSnackbar(extractionErrorMessage, {
        variant: 'error',
        action: <CloseSnackbar variant="error" />
      });
      return;
    }

    // If modifiedOnly is true, populate a fresh copy of the questionnaire to compare against
    let responseToCompare: QuestionnaireResponse | null = null;
    if (modifiedOnly) {
      const populateRes = await populateQuestionnaire({
        questionnaire: sourceQuestionnaire,
        fetchResourceCallback: fetchResourceCallback,
        fetchResourceRequestConfig: {
          sourceServerUrl: smartClient.state.serverUrl,
          authToken: smartClient.state.tokenResponse?.access_token
        },
        patient: patient,
        user: user,
        encounter: encounter ?? undefined
      });

      responseToCompare = populateRes.populateResult?.populatedResponse ?? null;
    }

    // Perform template-based extraction to get a transaction bundle
    const responseToExtract = structuredClone(updatableResponse);
    const inAppExtractOutput = await inAppExtract(
      responseToExtract,
      sourceQuestionnaire,
      modifiedOnly ? responseToCompare : null
    );

    const { extractResult } = inAppExtractOutput;

    if (extractResultIsOperationOutcome(extractResult)) {
      console.error(extractResult);
      setExtracting(false);
      enqueueSnackbar(extractionErrorMessage, {
        variant: 'error',
        action: <CloseSnackbar variant="error" />
      });
      return;
    }

    // Validate before updating state — ensures WriteBackBundleSelectorDialog mounts with
    // invalidBundleEntryIndices already set, so its selectedKeys initializer excludes invalid entries
    const validationResults = extraLaunchContext.enableBundleValidation
      ? await validateExtractedBundle(extractResult.extractedBundle, smartClient)
      : new Set<number>();

    // All four updates land in the same React 18 batch → single render → component mounts correctly
    setExtractedBundle(extractResult.extractedBundle);
    setInvalidBundleEntryIndices(validationResults.size > 0 ? validationResults : null);
    setExtracting(false);

    onExtracted();
  }

  function handleObservationExtract() {
    const extractedObservations = extractObservationBased(sourceQuestionnaire, updatableResponse);
    const bundleFromObservations = buildBundleFromObservationArray(extractedObservations);
    setExtractedBundle(bundleFromObservations);

    onExtracted();
  }

  async function runExtraction() {
    if (extractMechanism === 'template-based') {
      await handleTemplateExtract();
      return;
    }

    if (extractMechanism === 'observation-based') {
      handleObservationExtract();
    }
  }

  function resetExtractionState() {
    setExtracting(false);
    setExtractedBundle(null);
    setInvalidBundleEntryIndices(null);
  }

  return {
    extractMechanism,
    writeBackEnabled,
    isExtracting,
    extractedBundle,
    invalidBundleEntryIndices,
    runExtraction,
    resetExtractionState
  };
}

export default useSaveAsFinalExtraction;

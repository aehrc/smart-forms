import { useEffect } from 'react';
import { getValueSetCodings, getValueSetPromise } from '../utils/valueSet';
import type { Coding, QuestionnaireItem, ValueSet } from 'fhir/r4';
import { addDisplayToCodingArray } from '../utils/questionnaireStoreUtils/addDisplayToCodings';
import type { ProcessedValueSet } from '../interfaces/valueSet.interface';
import { useQuestionnaireStore } from '../stores';

function useDynamicValueSetEffect(
  qItem: QuestionnaireItem,
  answerValueSetUrl: string | undefined,
  terminologyServerUrl: string,
  processedValueSets: Record<string, ProcessedValueSet>,
  cachedValueSetCodings: Record<string, Coding[]>,
  onSetCodings: (codings: Coding[]) => void,
  onSetDynamicCodingsUpdated: (updated: boolean) => void,
  onSetServerError: (error: Error) => void
) {
  const addCodingToCache = useQuestionnaireStore.use.addCodingToCache();

  const updatableValueSetUrl = processedValueSets[answerValueSetUrl ?? '']?.updatableValueSetUrl;
  useEffect(() => {
    if (!qItem.answerValueSet || !qItem._answerValueSet) {
      return;
    }

    if (!updatableValueSetUrl) {
      return;
    }

    // attempt to get codings from cached queried value sets
    if (cachedValueSetCodings[updatableValueSetUrl]) {
      onSetCodings(cachedValueSetCodings[updatableValueSetUrl]);

      // Update ui to show calculated value changes
      onSetDynamicCodingsUpdated(true);
      const timeoutId = setTimeout(() => {
        onSetDynamicCodingsUpdated(false);
      }, 500);

      return () => clearTimeout(timeoutId);
    }

    const promise = getValueSetPromise(updatableValueSetUrl, terminologyServerUrl);
    if (!promise) {
      return;
    }

    promise
      .then(async (valueSet: ValueSet) => {
        const newCodings = getValueSetCodings(valueSet);
        try {
          const codingsWithDisplay = await addDisplayToCodingArray(
            newCodings,
            terminologyServerUrl
          );

          addCodingToCache(updatableValueSetUrl, codingsWithDisplay);
          onSetCodings(codingsWithDisplay.length > 0 ? newCodings : []);

          // Update UI to show calculated value changes
          onSetDynamicCodingsUpdated(true);
          const timeoutId = setTimeout(() => {
            onSetDynamicCodingsUpdated(false);
          }, 500);

          return () => clearTimeout(timeoutId);
        } catch (error) {
          onSetServerError(error as Error);
        }
      })
      .catch((error: Error) => {
        onSetServerError(error);
      });
  }, [
    addCodingToCache,
    cachedValueSetCodings,
    onSetCodings,
    onSetDynamicCodingsUpdated,
    onSetServerError,
    qItem,
    terminologyServerUrl,
    updatableValueSetUrl
  ]);
}

export default useDynamicValueSetEffect;

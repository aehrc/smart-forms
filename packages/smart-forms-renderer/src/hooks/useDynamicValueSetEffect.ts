import { useEffect, useRef } from 'react';
import { getValueSetCodings, getValueSetPromise } from '../utils/valueSet';
import type { Coding, QuestionnaireItem, ValueSet } from 'fhir/r4';
import { addDisplayToCodingArray } from '../utils/questionnaireStoreUtils/addDisplayToCodings';
import type { ProcessedValueSet } from '../interfaces/valueSet.interface';
import { useQuestionnaireStore } from '../stores';
import type { CalculatedExpression } from '../interfaces';

function useDynamicValueSetEffect(
  qItem: QuestionnaireItem,
  terminologyServerUrl: string,
  processedValueSets: Record<string, ProcessedValueSet>,
  cachedValueSetCodings: Record<string, Coding[]>,
  onSetCodings: (codings: Coding[]) => void,
  onSetDynamicCodingsUpdated: (updated: boolean) => void,
  onSetServerError: (error: Error) => void
) {
  const calculatedExpressions = useQuestionnaireStore.use.calculatedExpressions();
  const addCodingToCache = useQuestionnaireStore.use.addCodingToCache();
  const lastUpdatableValueSetUrlRef = useRef<string | null>(null);

  // Compute updatableValueSetUrl
  const updatableValueSetUrl = getUpdatableValueSetUrl(
    qItem,
    calculatedExpressions,
    processedValueSets
  );

  useEffect(() => {
    if (!qItem.answerValueSet || !qItem._answerValueSet || updatableValueSetUrl === '') {
      return;
    }

    // Skip if same as last updatableValueSetUrl value
    if (lastUpdatableValueSetUrlRef.current === updatableValueSetUrl) {
      return;
    }
    lastUpdatableValueSetUrlRef.current = updatableValueSetUrl;

    let isMounted = true;

    // Check cached codings first
    const cached = cachedValueSetCodings[updatableValueSetUrl];
    if (cached) {
      onSetCodings(cached);
      onSetDynamicCodingsUpdated(true);
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          onSetDynamicCodingsUpdated(false);
        }
      }, 500);
      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }

    const promise = getValueSetPromise(updatableValueSetUrl, terminologyServerUrl);
    if (!promise) {
      return () => {
        isMounted = false;
      };
    }

    promise
      .then(async (valueSet: ValueSet) => {
        if (!isMounted) return;
        
        const newCodings = getValueSetCodings(valueSet);
        try {
          const newCodingsWithDisplay = await addDisplayToCodingArray(
            newCodings,
            terminologyServerUrl
          );

          if (!isMounted) return;

          addCodingToCache(updatableValueSetUrl, newCodingsWithDisplay);
          onSetCodings(newCodingsWithDisplay.length > 0 ? newCodingsWithDisplay : []);

          // Update UI to show calculated value changes
          onSetDynamicCodingsUpdated(true);
          const timeoutId = setTimeout(() => {
            if (isMounted) {
              onSetDynamicCodingsUpdated(false);
            }
          }, 500);
        } catch (error) {
          if (isMounted) {
            onSetServerError(error as Error);
          }
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          onSetServerError(error);
        }
      });

    return () => {
      isMounted = false;
    };
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

// Get updatableValueSetUrl from cqfAnswerValueSetCqfExpression or processedValueSets's updatableValueSetUrl, otherwise return empty string
export function getUpdatableValueSetUrl(
  qItem: QuestionnaireItem,
  calculatedExpressions: Record<string, CalculatedExpression[]>,
  processedValueSets: Record<string, ProcessedValueSet>
) {
  const cqfAnswerValueSetCqfExpression = calculatedExpressions[qItem.linkId]?.find(
    (exp) => exp.from === 'item._answerValueSet'
  );
  if (
    cqfAnswerValueSetCqfExpression &&
    typeof cqfAnswerValueSetCqfExpression?.value === 'string' &&
    cqfAnswerValueSetCqfExpression.value !== ''
  ) {
    return cqfAnswerValueSetCqfExpression.value;
  }

  return processedValueSets[qItem.answerValueSet ?? '']?.updatableValueSetUrl ?? '';
}

export default useDynamicValueSetEffect;

import { useQuestionnaireStore } from '../stores';
import type { Coding, QuestionnaireItemAnswerOption } from 'fhir/r4';
import { useEffect, useRef, useState } from 'react';

function useAnswerOptionsToggleExpressions(linkId: string): {
  answerOptionsToggleExpressionsMap: Map<string, boolean>;
  answerOptionsToggleExpUpdated: boolean;
} {
  const answerOptionsToggleExpressions = useQuestionnaireStore.use.answerOptionsToggleExpressions();
  const itemAnswerOptionsToggleExpressions = answerOptionsToggleExpressions[linkId];

  // Use a map to store answerOptionsToggleExpressions values for fast lookup
  const answerOptionsToggleExpressionsMap = new Map<string, boolean>();

  // Ref to store the previous map
  const prevMapRef = useRef<Map<string, boolean>>(new Map<string, boolean>());
  let mapHasChanged = false;

  const [optionsUpdated, setOptionsUpdated] = useState(false);

  // There are itemAnswerOptionsToggleExpressions for this item
  if (itemAnswerOptionsToggleExpressions) {
    // Populate the map for all toggleOptions
    for (const itemAnswerOptionsToggleExpression of itemAnswerOptionsToggleExpressions) {
      const { options: toggleOptions, isEnabled } = itemAnswerOptionsToggleExpression;

      for (const toggleOption of toggleOptions) {
        const key = generateOptionKey(toggleOption);
        const optionIsEnabled = !(isEnabled === false || isEnabled === undefined);
        answerOptionsToggleExpressionsMap.set(key, optionIsEnabled);
      }
    }

    // Compare current map with the previous map
    mapHasChanged = hasMapChanged(prevMapRef.current, answerOptionsToggleExpressionsMap);

    // Update the ref with the current map
    prevMapRef.current = answerOptionsToggleExpressionsMap;
  }

  useEffect(() => {
    if (answerOptionsToggleExpressionsMap.size === 0) {
      return;
    }

    // Update ui to show calculated value changes
    setOptionsUpdated(true);
    const timeoutId = setTimeout(() => {
      setOptionsUpdated(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [answerOptionsToggleExpressionsMap.size, mapHasChanged]);

  return { answerOptionsToggleExpressionsMap, answerOptionsToggleExpUpdated: optionsUpdated };
}

function hasMapChanged(map1: Map<string, boolean>, map2: Map<string, boolean>): boolean {
  if (map1.size !== map2.size) return true;

  for (const [key, value] of map1) {
    if (map2.get(key) !== value) return true;
  }

  return false;
}

export function generateOptionKey(option: QuestionnaireItemAnswerOption): string {
  if (option.valueCoding) {
    const systemKey = option.valueCoding.system ?? ' ';
    const codeKey = option.valueCoding.code ?? ' ';
    const displayKey = option.valueCoding.display ?? ' ';

    return `coding:${systemKey}-${codeKey}-${displayKey}`;
  }

  if (option.valueString !== undefined) {
    return `string:${option.valueString}`;
  }

  if (option.valueInteger !== undefined) {
    return `integer:${option.valueInteger}`;
  }

  return ''; // In case no valid value is found
}

// An exact copy of isOptionDisabled, except instead of using QuestionnaireItemAnswerOption it usings codings.
// It makes sense to align these two functions when we refactor choice/open-choice items https://github.com/aehrc/smart-forms/issues/1205
export function generateCodingKey(coding: Coding): string {
  const systemKey = coding.system ?? ' ';
  const codeKey = coding.code ?? ' ';
  const displayKey = coding.display ?? ' ';

  return `coding:${systemKey}-${codeKey}-${displayKey}`;
}

export default useAnswerOptionsToggleExpressions;

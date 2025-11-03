import { useEffect, useRef, useState } from 'react';

/**
 * Detects when an item value changes due to a calculatedExpression.
 * Returns true for ~700ms whenever the calculated value updates.
 *
 * Ignores the initial mount (so it won't re-animate when the user switch between tabs).
 */
export function useCalculatedExpressionUpdated(answerKey: string | undefined): boolean {
  const [animating, setAnimating] = useState(false);
  const previousAnswerKey = useRef<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    // Skip the first render — just store the current key
    if (!mounted.current) {
      mounted.current = true;
      previousAnswerKey.current = answerKey ?? null;
      return;
    }

    // Answer key has changed, and it is a calculatedExpression
    if (
      answerKey &&
      answerKey !== previousAnswerKey.current &&
      // values generated via calculatedExpression will have "calculatedExpression" in their key e.g. obs-bmi-calculatedExpression-_Cye5_m-d4cjxZqY4-9XL
      answerKey.includes('calculatedExpression')
    ) {
      previousAnswerKey.current = answerKey;
      setAnimating(true);

      const timer = setTimeout(() => setAnimating(false), 700);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [answerKey]);

  return animating;
}

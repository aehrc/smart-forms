import { useEffect, useRef, useState } from 'react';

/**
 * Detects when an item value changes due to a calculatedExpression.
 * Returns true for ~700ms whenever the calculated value updates.
 *
 * Ignores the initial mount (so it won't re-animate when the user switch between tabs).
 */
export function useCalculatedExpressionUpdated(
  answerKey: string | undefined,
  answerSnapshot?: string | undefined
): boolean {
  const [animating, setAnimating] = useState(false);
  const previousAnswerKey = useRef<string | null>(null);
  const previousAnswerSnapshot = useRef<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    // Skip the first render — just store the current key/snapshot
    if (!mounted.current) {
      mounted.current = true;
      previousAnswerKey.current = answerKey ?? null;
      previousAnswerSnapshot.current = answerSnapshot ?? null;
      return;
    }

    // Determine whether the answer changed. If an answerSnapshot is provided we use
    // that to detect value changes (useful when the answer id stays the same).
    const changed =
      answerSnapshot !== undefined
        ? answerSnapshot !== previousAnswerSnapshot.current
        : !!answerKey && answerKey !== previousAnswerKey.current;

    const isCalculated = !!answerKey && answerKey.includes('calculatedExpression');

    // Answer changed and it is a calculatedExpression
    if (changed && isCalculated) {
      previousAnswerKey.current = answerKey ?? null;
      previousAnswerSnapshot.current = answerSnapshot ?? null;
      setAnimating(true);

      const timer = setTimeout(() => setAnimating(false), 700);

      return () => clearTimeout(timer);
    }

    // Always advance the stored values so we don't re-fire due to transient undefined/null
    previousAnswerKey.current = answerKey ?? null;
    previousAnswerSnapshot.current = answerSnapshot ?? null;

    return undefined;
  }, [answerKey, answerSnapshot]);

  return animating;
}

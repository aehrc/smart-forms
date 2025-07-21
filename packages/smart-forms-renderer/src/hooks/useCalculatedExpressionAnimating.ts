import { useEffect, useRef, useState } from 'react';

export function useCalculatedExpressionAnimation(answerKey: string | undefined): boolean {
  const [animating, setAnimating] = useState(false);
  const previousAnswerKey = useRef<string | null>(null);

  useEffect(() => {
    if (
      answerKey &&
      answerKey !== previousAnswerKey.current &&
      answerKey.includes('calculatedExpression')
    ) {
      previousAnswerKey.current = answerKey;
      setAnimating(true);

      const timer = setTimeout(() => setAnimating(false), 1000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [answerKey]);

  return animating;
}

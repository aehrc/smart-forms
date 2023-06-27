import { useEffect, useState } from 'react';

interface UseClickCounter {
  counter: number;
  addOneToCounter: () => void;
}

function useClickCounter(): UseClickCounter {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (counter === 7) {
      const timeout = setTimeout(() => {
        setCounter(0);
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [counter]);

  return {
    counter,
    addOneToCounter: () => setCounter(counter + 1)
  };
}

export default useClickCounter;

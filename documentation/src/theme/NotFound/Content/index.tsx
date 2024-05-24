import React, { useEffect, useState } from 'react';
import type { Props } from '@theme/NotFound/Content';
import NotFoundPage from '@site/src/theme/NotFound/Content/NotFoundPage';
import LoadingPage from '@site/src/theme/NotFound/Content/LoadingPage';

export default function NotFoundContent({ className }: Props): JSX.Element {
  const [showLoadingPage, setShowLoadingPage] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowLoadingPage(false);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  if (showLoadingPage) {
    return <LoadingPage className={className} />;
  }

  return <NotFoundPage className={className} />;
}

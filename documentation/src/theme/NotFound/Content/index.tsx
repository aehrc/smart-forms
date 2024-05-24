import React, { Suspense } from 'react';
import type { Props } from '@theme/NotFound/Content';
import NotFoundWithTimeout from '@site/src/theme/NotFound/Content/NotFoundWithTimeout';
import LoadingForNotFound from '@site/src/theme/NotFound/Content/LoadingForNotFound';

export default function NotFoundContent({ className }: Props): JSX.Element {
  return (
    <Suspense fallback={<LoadingForNotFound className={className} />}>
      <NotFoundWithTimeout className={className} />
    </Suspense>
  );
}

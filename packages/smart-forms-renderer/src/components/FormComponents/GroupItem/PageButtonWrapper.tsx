import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Pages } from '../../../interfaces/page.interface';
import { useQuestionnaireStore } from '../../../stores';
import NextPageButton from './NextPageButton';
import PreviousPageButton from './PreviousPageButton';
import useNextAndPreviousVisiblePages from '../../../hooks/useNextAndPreviousVisiblePages';
import { useRendererStylingStore } from '../../../stores/rendererStylingStore';

interface PageButtonsWrapperProps {
  currentPageIndex?: number;
  pages?: Pages;
}

const PageButtonsWrapper = memo(function PageButtonsWrapper(props: PageButtonsWrapperProps) {
  const { currentPageIndex, pages } = props;

  const switchPage = useQuestionnaireStore.use.switchPage();
  const disablePageButtons = useRendererStylingStore.use.disablePageButtons();

  const { previousPageIndex, nextPageIndex, numOfVisiblePages } = useNextAndPreviousVisiblePages(
    currentPageIndex,
    pages
  );

  const pagesNotDefined = currentPageIndex === undefined || pages === undefined;

  // Event handlers
  function handlePreviousPageButtonClick() {
    if (previousPageIndex === null) {
      return;
    }

    switchPage(previousPageIndex);

    // Scroll to top of page
    window.scrollTo(0, 0);
  }

  function handleNextPageButtonClick() {
    if (nextPageIndex === null) {
      return;
    }

    switchPage(nextPageIndex);

    // Scroll to top of page
    window.scrollTo(0, 0);
  }

  // No pages defined, do not render page buttons
  if (pagesNotDefined) {
    return null;
  }

  // Disable page buttons - currently only available via disablePageButtons API
  if (disablePageButtons) {
    return null;
  }

  const previousPageButtonHidden = previousPageIndex === null;
  const nextPageButtonHidden = nextPageIndex === null;

  // This is more of a fallback check to prevent the user from navigating to an invisble page if buttons are visble for some reason
  const pageButtonsDisabled = numOfVisiblePages <= 1;

  return (
    <Box display="flex" mt={3} gap={2} alignItems="center">
      <Box flexGrow={1} />
      <Typography component="span" color="text.secondary">
        Page {`${currentPageIndex + 1} / ${numOfVisiblePages}`}
      </Typography>
      <PreviousPageButton
        isDisabled={pageButtonsDisabled || previousPageButtonHidden}
        onPreviousPageClick={handlePreviousPageButtonClick}
      />
      <NextPageButton
        isDisabled={pageButtonsDisabled || nextPageButtonHidden}
        onNextPageClick={handleNextPageButtonClick}
      />
    </Box>
  );
});

export default PageButtonsWrapper;

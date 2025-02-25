import { useCallback } from 'react';

export function useFocusTabHeading() {
  return useCallback((tabPanelId: string) => {
    // Find the first heading in the tab panel that was just activated
    const tabPanel = document.getElementById(tabPanelId);
    if (!tabPanel) return;

    // Look for the first heading element within the tab panel
    const firstHeading = tabPanel.querySelector('h1, h2, h3, h4, h5, h6');
    if (!firstHeading) return;
    
    // If heading doesn't have tabindex=-1, add it
    if (!firstHeading.hasAttribute('tabindex')) {
      firstHeading.setAttribute('tabindex', '-1');
    }

    // Focus the heading
    (firstHeading as HTMLElement).focus();
  }, []);
}
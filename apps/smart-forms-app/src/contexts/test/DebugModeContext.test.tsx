/*
 * Copyright 2025 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { useContext } from 'react';
import DebugModeContextProvider, { DebugModeContext } from '../DebugModeContext';

// Test component to access context
function TestComponent() {
  const { enabled, setEnabled } = useContext(DebugModeContext);

  return (
    <div>
      <span data-testid="enabled-status">{enabled.toString()}</span>
      <button data-testid="toggle-button" onClick={() => setEnabled(!enabled)}>
        Toggle
      </button>
      <button data-testid="enable-button" onClick={() => setEnabled(true)}>
        Enable
      </button>
      <button data-testid="disable-button" onClick={() => setEnabled(false)}>
        Disable
      </button>
    </div>
  );
}

describe('DebugModeContext', () => {
  describe('default context value', () => {
    it('provides default values when used outside provider', () => {
      render(<TestComponent />);

      expect(screen.getByTestId('enabled-status')).toHaveTextContent('false');
    });

    it('setEnabled function in default context does nothing', () => {
      render(<TestComponent />);

      const toggleButton = screen.getByTestId('toggle-button');
      fireEvent.click(toggleButton);

      // Should remain false since default setEnabled does nothing
      expect(screen.getByTestId('enabled-status')).toHaveTextContent('false');
    });
  });

  describe('DebugModeContextProvider', () => {
    it('provides initial state as false', () => {
      render(
        <DebugModeContextProvider>
          <TestComponent />
        </DebugModeContextProvider>
      );

      expect(screen.getByTestId('enabled-status')).toHaveTextContent('false');
    });

    it('allows enabling debug mode', () => {
      render(
        <DebugModeContextProvider>
          <TestComponent />
        </DebugModeContextProvider>
      );

      const enableButton = screen.getByTestId('enable-button');
      fireEvent.click(enableButton);

      expect(screen.getByTestId('enabled-status')).toHaveTextContent('true');
    });

    it('allows disabling debug mode', () => {
      render(
        <DebugModeContextProvider>
          <TestComponent />
        </DebugModeContextProvider>
      );

      // First enable
      const enableButton = screen.getByTestId('enable-button');
      fireEvent.click(enableButton);
      expect(screen.getByTestId('enabled-status')).toHaveTextContent('true');

      // Then disable
      const disableButton = screen.getByTestId('disable-button');
      fireEvent.click(disableButton);
      expect(screen.getByTestId('enabled-status')).toHaveTextContent('false');
    });

    it('allows toggling debug mode', () => {
      render(
        <DebugModeContextProvider>
          <TestComponent />
        </DebugModeContextProvider>
      );

      const toggleButton = screen.getByTestId('toggle-button');

      // Initially false
      expect(screen.getByTestId('enabled-status')).toHaveTextContent('false');

      // Toggle to true
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('enabled-status')).toHaveTextContent('true');

      // Toggle back to false
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('enabled-status')).toHaveTextContent('false');
    });

    it('maintains state across multiple children', () => {
      function AnotherTestComponent() {
        const { enabled } = useContext(DebugModeContext);
        return <span data-testid="another-enabled-status">{enabled.toString()}</span>;
      }

      render(
        <DebugModeContextProvider>
          <TestComponent />
          <AnotherTestComponent />
        </DebugModeContextProvider>
      );

      const enableButton = screen.getByTestId('enable-button');
      fireEvent.click(enableButton);

      expect(screen.getByTestId('enabled-status')).toHaveTextContent('true');
      expect(screen.getByTestId('another-enabled-status')).toHaveTextContent('true');
    });

    it('renders children correctly', () => {
      render(
        <DebugModeContextProvider>
          <div data-testid="child-content">Test Child</div>
        </DebugModeContextProvider>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByTestId('child-content')).toHaveTextContent('Test Child');
    });
  });
});

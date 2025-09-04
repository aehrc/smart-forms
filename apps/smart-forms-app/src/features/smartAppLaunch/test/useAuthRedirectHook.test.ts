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

import { renderHook } from '@testing-library/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthRedirectHook from '../hooks/useAuthRedirectHook';
import type { AuthState } from '../interfaces/authorisation.interface';

// Mock React
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn()
}));

const mockUseEffect = useEffect as jest.MockedFunction<typeof useEffect>;
const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;

describe('useAuthRedirectHook', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseEffect.mockImplementation((cb) => cb());
  });

  it('does not navigate when auth is not successful', () => {
    const authState: AuthState = {
      hasClient: false,
      hasUser: false,
      hasPatient: false,
      hasQuestionnaire: false,
      errorMessage: null
    };

    renderHook(() => useAuthRedirectHook(authState));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to /dashboard/existing when auth is successful and questionnaire exists', () => {
    const authState: AuthState = {
      hasClient: true,
      hasUser: true,
      hasPatient: true,
      hasQuestionnaire: true,
      errorMessage: null
    };

    renderHook(() => useAuthRedirectHook(authState));

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/existing');
  });

  it('navigates to /dashboard/questionnaires when auth is successful and questionnaire does not exist', () => {
    const authState: AuthState = {
      hasClient: true,
      hasUser: true,
      hasPatient: true,
      hasQuestionnaire: false,
      errorMessage: null
    };

    renderHook(() => useAuthRedirectHook(authState));

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/questionnaires');
  });

  it('does not navigate when hasClient is false', () => {
    const authState: AuthState = {
      hasClient: false,
      hasUser: true,
      hasPatient: true,
      hasQuestionnaire: true,
      errorMessage: null
    };

    renderHook(() => useAuthRedirectHook(authState));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate when hasUser is false', () => {
    const authState: AuthState = {
      hasClient: true,
      hasUser: false,
      hasPatient: true,
      hasQuestionnaire: true,
      errorMessage: null
    };

    renderHook(() => useAuthRedirectHook(authState));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate when hasPatient is false', () => {
    const authState: AuthState = {
      hasClient: true,
      hasUser: true,
      hasPatient: false,
      hasQuestionnaire: true,
      errorMessage: null
    };

    renderHook(() => useAuthRedirectHook(authState));

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('sets up useEffect with correct dependencies', () => {
    const authState: AuthState = {
      hasClient: true,
      hasUser: true,
      hasPatient: true,
      hasQuestionnaire: true,
      errorMessage: null
    };

    renderHook(() => useAuthRedirectHook(authState));

    expect(mockUseEffect).toHaveBeenCalledWith(expect.any(Function), [mockNavigate, true, true]);
  });
});

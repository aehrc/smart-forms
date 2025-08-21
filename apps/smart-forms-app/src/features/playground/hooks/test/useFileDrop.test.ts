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
import { useDrop } from 'react-dnd';
import UseFileDrop from '../useFileDrop';

// Mock react-dnd
jest.mock('react-dnd', () => ({
  useDrop: jest.fn()
}));

// Mock react-dnd-html5-backend
jest.mock('react-dnd-html5-backend', () => ({
  NativeTypes: {
    FILE: 'file'
  }
}));

const mockUseDrop = useDrop as jest.MockedFunction<typeof useDrop>;

describe('UseFileDrop', () => {
  const mockDropTarget = jest.fn();
  const mockOnDrop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDrop.mockReturnValue([
      {
        canDrop: true,
        isOver: false
      },
      mockDropTarget
    ]);
  });

  it('returns canDrop as true', () => {
    const { result } = renderHook(() => UseFileDrop(mockOnDrop));

    expect(result.current.canDrop).toBe(true);
  });

  it('returns isOver as false initially', () => {
    const { result } = renderHook(() => UseFileDrop(mockOnDrop));

    expect(result.current.isOver).toBe(false);
  });

  it('returns dropTarget function', () => {
    const { result } = renderHook(() => UseFileDrop(mockOnDrop));

    expect(result.current.dropTarget).toBe(mockDropTarget);
  });

  it('returns isOver true when dragging over', () => {
    mockUseDrop.mockReturnValue([
      {
        canDrop: true,
        isOver: true
      },
      mockDropTarget
    ]);

    const { result } = renderHook(() => UseFileDrop(mockOnDrop));

    expect(result.current.isOver).toBe(true);
  });

  it('calls useDrop with configuration function and dependencies', () => {
    renderHook(() => UseFileDrop(mockOnDrop));

    expect(mockUseDrop).toHaveBeenCalledWith(expect.any(Function), [mockOnDrop]);
  });

  it('returns canDrop false when drop monitor indicates false', () => {
    mockUseDrop.mockReturnValue([
      {
        canDrop: false,
        isOver: false
      },
      mockDropTarget
    ]);

    const { result } = renderHook(() => UseFileDrop(mockOnDrop));

    expect(result.current.canDrop).toBe(false);
  });
});

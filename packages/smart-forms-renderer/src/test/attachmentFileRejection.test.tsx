/*
 * Copyright 2026 Commonwealth Scientific and Industrial Research
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

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Questionnaire, QuestionnaireResponse } from 'fhir/r4';
import React from 'react';
import SmartFormsRenderer from '../components/Renderer/SmartFormsRenderer';
import { questionnaireResponseStore } from '../stores';

jest.mock('react-markdown', () => ({ default: () => null, __esModule: true }));
jest.mock('react-dnd', () => ({
  DndProvider: ({ children }: React.PropsWithChildren) => children,
  useDrop: () => [{ isOver: false, canDrop: false }, jest.fn()]
}));
jest.mock('react-dnd-html5-backend', () => ({ NativeTypes: { FILE: '__NATIVE_FILE__' } }));

const questionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  status: 'active',
  item: [{ linkId: 'report', type: 'attachment', text: 'Report' }]
};

function savedAttachment() {
  return questionnaireResponseStore.getState().updatableResponse.item?.[0]?.answer?.[0]
    ?.valueAttachment;
}

async function renderAttachment(questionnaireResponse?: QuestionnaireResponse) {
  const { container } = render(
    <SmartFormsRenderer
      questionnaire={questionnaire}
      questionnaireResponse={questionnaireResponse}
    />
  );
  await screen.findByText('No file selected');
  const input = container.querySelector<HTMLInputElement>('input[type=file]')!;
  return (file: File) => fireEvent.change(input, { target: { files: [file] } });
}

afterEach(() => jest.restoreAllMocks());

test('keeps an attached file when its replacement has no content type', async () => {
  const upload = await renderAttachment();
  const read = jest.spyOn(FileReader.prototype, 'readAsDataURL');
  upload(new File(['report'], 'report.txt', { type: 'text/plain' }));
  await waitFor(() => expect(savedAttachment()?.data).toBeTruthy());
  const attachment = savedAttachment();

  const url = 'https://example.org/report';
  const title = 'Final report';
  fireEvent.change(screen.getByLabelText('URL'), { target: { value: url } });
  fireEvent.change(screen.getByLabelText('File name (optional)'), { target: { value: title } });
  await waitFor(() => expect(savedAttachment()).toEqual({ ...attachment, url, title }));

  upload(new File(['replacement'], 'report.unknown'));
  await screen.findByText(/file type is unknown/i);
  expect(savedAttachment()).toEqual({ ...attachment, url, title });
  expect(read).toHaveBeenCalledTimes(1);
});

test('keeps the saved URL and the latest title edit when reading a file fails', async () => {
  const url = 'https://example.org/report';
  const title = 'Lab report';
  const upload = await renderAttachment({
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    item: [{ linkId: 'report', answer: [{ valueAttachment: { url, title: 'Draft' } }] }]
  });
  fireEvent.change(screen.getByLabelText('File name (optional)'), { target: { value: title } });

  jest.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementationOnce(function (
    this: FileReader
  ) {
    queueMicrotask(() => this.dispatchEvent(new ProgressEvent('error')));
  });
  const file = new File(['report'], 'report.txt', { type: 'text/plain' });
  upload(file);

  await screen.findByText(/file could not be read/i);
  expect(savedAttachment()).toEqual({ url, title });

  upload(file);
  await waitFor(() => expect(savedAttachment()?.data).toBeTruthy());
  expect(screen.queryByText(/file could not be read/i)).toBeNull();
});

test('ignores an earlier read error after a replacement file succeeds', async () => {
  const upload = await renderAttachment();
  const read = jest.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementationOnce(() => {});
  upload(new File(['first'], 'first.txt', { type: 'text/plain' }));
  const firstReader = read.mock.contexts[0] as FileReader;
  upload(new File(['replacement'], 'replacement.pdf', { type: 'application/pdf' }));
  await waitFor(() => expect(savedAttachment()?.contentType).toBe('application/pdf'));

  await act(async () => {
    firstReader.dispatchEvent(new ProgressEvent('error'));
  });

  expect(screen.getByText('replacement.pdf')).toBeVisible();
  expect(screen.queryByText(/file could not be read/i)).toBeNull();
  expect(savedAttachment()?.contentType).toBe('application/pdf');
});

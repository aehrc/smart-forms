/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
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

import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import DashboardLayout from '../features/dashboard/layout/DashboardLayout.tsx';
import Launch from '../features/smartAppLaunch/components/Launch.tsx';
import QuestionnairesPage from '../features/dashboard/components/QuestionnairePage/QuestionnairesPage.tsx';
import ResponsesPage from '../features/dashboard/components/ResponsesPage/ResponsesPage.tsx';
import RendererLayout from '../features/renderer/components/RendererLayout.tsx';
import Form from '../features/renderer/components/FormPage/Form.tsx';
import FormPreview from '../features/renderer/components/FormPreviewPage/FormPreview.tsx';
import ViewerLayout from '../features/viewer/ViewerLayout.tsx';
import ResponsePreview from '../features/viewer/ResponsePreview.tsx';
import Authorisation from '../features/smartAppLaunch/components/Authorisation.tsx';
import PlaygroundLayout from '../features/playground/components/PlaygroundLayout.tsx';
import Playground from '../features/playground/components/Playground.tsx';

export default function Router() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Authorisation />
    },
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { path: 'questionnaires', element: <QuestionnairesPage /> },
        { path: 'responses', element: <ResponsesPage /> }
      ]
    },
    {
      path: '/renderer',
      element: <RendererLayout />,
      children: [
        { path: '', element: <Form /> },
        { path: 'preview', element: <FormPreview /> }
      ]
    },
    {
      path: '/viewer',
      element: <ViewerLayout />,
      children: [{ path: '', element: <ResponsePreview /> }]
    },
    {
      path: '/playground',
      element: <PlaygroundLayout />,
      children: [{ path: '', element: <Playground /> }]
    },
    {
      path: '/launch',
      element: <Launch />
    },
    {
      path: '/launch.html',
      element: <Launch />
    },
    {
      path: '*',
      element: <Navigate to="/" replace />
    }
  ]);

  return <RouterProvider router={router} />;
}

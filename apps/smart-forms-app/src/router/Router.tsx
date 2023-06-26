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
import DashboardLayout from '../components/Dashboard/DashboardLayout.tsx';
import Launch from '../features/smartAppLaunch/components/Launch.tsx';
import QuestionnairesPage from '../components/Dashboard/QuestionnairePage/QuestionnairesPage.tsx';
import ResponsesPage from '../components/Dashboard/ResponsesPage/ResponsesPage.tsx';
import RendererLayout from '../components/Renderer/RendererLayout.tsx';
import Form from '../components/Renderer/FormPage/Form.tsx';
import FormPreview from '../components/Renderer/FormPreviewPage/FormPreview.tsx';
import ViewerLayout from '../components/Viewer/ViewerLayout.tsx';
import ResponsePreview from '../components/Viewer/ResponsePreview.tsx';
import Authorisation from '../features/smartAppLaunch/components/Authorisation.tsx';
import PlaygroundLayout from '../components/Playground/PlaygroundLayout.tsx';
import Playground from '../components/Playground/Playground.tsx';

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

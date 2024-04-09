/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from '../features/dashboard/layout/DashboardLayout.tsx';
import Launch from '../features/smartAppLaunch/components/Launch.tsx';
import QuestionnairesPage from '../features/dashboard/components/DashboardPages/QuestionnairePage/QuestionnairesPage.tsx';
import RendererLayout from '../features/renderer/components/RendererLayout.tsx';
import FormWrapper from '../features/renderer/components/FormPage/FormRenderer/FormWrapper.tsx';
import FormPreview from '../features/renderer/components/FormPreviewPage/FormPreview.tsx';
import ViewerLayout from '../features/viewer/ViewerLayout.tsx';
import ResponsePreview from '../features/viewer/ResponsePreview.tsx';
import Authorisation from '../features/smartAppLaunch/components/Authorisation.tsx';
import PlaygroundLayout from '../features/playground/components/PlaygroundLayout.tsx';
import Playground from '../features/playground/components/Playground.tsx';
import ResponsesPage from '../features/dashboard/components/DashboardPages/ResponsesPage/ResponsesPage.tsx';
import NotFound from '../features/notfound/NotFound.tsx';
import ExistingResponsesPage from '../features/renderer/components/ExistingResponses/ExistingResponsesPage.tsx';
import Standalone from '../features/standalone/components/Standalone.tsx';

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
        { path: 'responses', element: <ResponsesPage /> },
        { path: 'existing', element: <ExistingResponsesPage /> }
      ]
    },
    {
      path: '/renderer',
      element: <RendererLayout />,
      children: [
        { path: '', element: <FormWrapper /> },
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
      path: '/standalone',
      element: <Standalone />
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
      element: <NotFound />
    }
  ]);

  return <RouterProvider router={router} />;
}

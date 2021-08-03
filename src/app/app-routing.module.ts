import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RedirectComponent } from './redirect/redirect.component';
import { LaunchComponent } from './launch/launch.component';
import { QRenderComponent } from './qrender/qrender.component';

const routes: Routes = [
  { path: '', component: QRenderComponent },
  { path: 'redirect', component: RedirectComponent },
  { path: 'launch', component: LaunchComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

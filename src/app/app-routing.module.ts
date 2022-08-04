import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { RedirectComponent } from "./redirect/redirect.component";
import { LaunchComponent } from "./launch/launch.component";
import { QRenderComponent } from "./qrender/qrender.component";
import { QuestionnaireListComponent } from "./questionnaire-list/questionnaire-list.component";

const routes: Routes = [
  { path: "", component: QRenderComponent },
  { path: "redirect", component: RedirectComponent },
  { path: "launch", component: LaunchComponent },
  { path: "questionnaires", component: QuestionnaireListComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

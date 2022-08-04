import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { PatientService } from "../services/patient.service";
import { QuestionnaireForm } from "../services/questionnaire-form.model";
import { QuestionnaireResponseService } from "../services/questionnaire-response.service";
import { Questionnaire } from "../services/questionnaire.model";
import { QuestionnaireService } from "../services/questionnaire.service";

@Component({
  selector: "questionnaire",
  templateUrl: "./questionnaire.component.html",
  styleUrls: ["./questionnaire.component.css"],
})
export class QuestionnaireComponent implements OnInit, OnDestroy {
  showSpinner: boolean;

  questionnaire$: Observable<Questionnaire>;

  questionnaireModel: QuestionnaireForm;

  constructor(
    private questionnaireService: QuestionnaireService,
    private qresponseService: QuestionnaireResponseService,
    private patientService: PatientService
  ) {}

  private subscriptions: Subscription[] = [];

  private addSubscriptions(...subs: Subscription[]) {
    this.subscriptions.push(...subs);
  }

  ngOnInit(): void {
    // this.showSpinner = true;

    this.questionnaire$ = this.questionnaireService.questionnaire$;

    this.addSubscriptions(
      this.questionnaire$.subscribe((q) => {
        // this.showSpinner = true;

        this.addSubscriptions(
          this.questionnaireService.populate(q).subscribe((qr) => {
            this.questionnaireModel.merge(qr);

            // this.showSpinner = false;
          })
        );

        this.questionnaireModel = new QuestionnaireForm(
          q,
          this.patientService.patient$
        );

        this.addSubscriptions(
          this.questionnaireModel.questionnaireResponse$.subscribe((response) =>
            this.qresponseService.onQuestionnaireResponseChanged(response)
          )
        );
      })
    );
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}

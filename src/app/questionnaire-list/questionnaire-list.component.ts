import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { Observable, of, Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { Questionnaire } from "../services/questionnaire.model";
import {
  QuestionnaireCandidate,
  QuestionnaireService,
} from "../services/questionnaire.service";

@Component({
  selector: "app-questionnaire-list",
  templateUrl: "./questionnaire-list.component.html",
  styleUrls: ["./questionnaire-list.component.css"],
})
export class QuestionnaireListComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private questionnaireService: QuestionnaireService
  ) {}
  src = "local";

  servers: string[];

  // pageCount: number =0;
  // totalCount: number =0;

  qsearch = "";
  private qsearch$ = new Subject<string>();

  questionnaires$: Observable<QuestionnaireCandidate[]>;

  questionnaire$: Observable<Questionnaire>;

  errors$;

  navbarOpen = false;

  private uploadSubscription: Subscription = null;

  ngOnInit(): void {
    this.servers = this.questionnaireService.servers;
    if (this.questionnaireService.currentServer) {
      this.src = this.questionnaireService.currentServer;
    }

    this.questionnaire$ = this.questionnaireService.questionnaire$;

    this.questionnaires$ = this.qsearch$.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((name: string) => {
        // search local
        if (this.src === "local") {
          return this.questionnaireService.searchLocal(name);
        } else {
          if (name.length > 0) {
            return this.questionnaireService.searchCandidates(name);
          } else {
            return of<QuestionnaireCandidate[]>([]);
          }
        }
      })
    );

    setTimeout(() => {
      this.qsearch$.next(this.qsearch);
    }, 300);
  }

  ngOnDestroy() {
    if (this.uploadSubscription !== null) {
      this.uploadSubscription.unsubscribe();
    }
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  setQuestionnaire(resource: Questionnaire) {
    this.questionnaireService.setQuestionnaire(resource);
  }

  setQuestionnaireByUrl(url: string) {
    this.questionnaireService.setQuestionnaireByLocalUrl(url);
  }

  changeServer(src: string) {
    this.questionnaireService.currentServer = src;
    this.qsearch = "";
    this.qsearch$.next(this.qsearch);
  }

  search(qsearch: string) {
    this.qsearch$.next(qsearch);
  }

  upload() {
    let questionnaire;
    this.questionnaire$.subscribe((q) => (questionnaire = q)).unsubscribe();

    if (this.uploadSubscription !== null) {
      this.uploadSubscription.unsubscribe();
    }

    this.uploadSubscription = this.questionnaireService
      .update(questionnaire)
      .subscribe((r) => {
        console.log(r);
        const q = r as Questionnaire;
        if (q.title) {
          this.questionnaireService.setQuestionnaire(q);
        } else {
          const operationOutcome = r;
          const errors = operationOutcome.issue.filter(
            (i) => i.severity === "error"
          );
          this.errors$ = of(errors);
        }
      });
  }

  view() {
    this.router.navigate(["/"]);
  }

  handleFileInput(files: FileList) {
    const fileToUpload = files.item(0);

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const resource = JSON.parse(fileReader.result as string) as Questionnaire;
      this.questionnaireService.setQuestionnaire(resource);
    };

    fileReader.readAsText(fileToUpload, "UTF-8");
  }
}

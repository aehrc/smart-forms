import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, async } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { QuestionnaireItemChoiceComponent } from "./questionnaire-item-choice.component";

describe("QuestionnaireItemChoiceComponent", () => {
  let component: QuestionnaireItemChoiceComponent;
  let fixture: ComponentFixture<QuestionnaireItemChoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionnaireItemChoiceComponent],
    });
    fixture = TestBed.createComponent(QuestionnaireItemChoiceComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeDefined();
  });

  it("should be displayed as a radio button", () => {
    component.item = {
      linkId: "661dd4c2-3092-4eb0-92d6-a8b18865c4b4",
      text: "Eligible for health check",
      type: "choice",
      item: [],
      answerOption: [
        {
          valueCoding: {
            code: "Y",
            display: "Yes",
            system: "http://terminology.hl7.org/CodeSystem/v2-0136",
          },
        },
        {
          valueCoding: {
            code: "N",
            display: "No",
            system: "http://terminology.hl7.org/CodeSystem/v2-0136",
          },
        },
        {
          valueCoding: {
            code: "NA",
            display: "NA",
            system: "http://terminology.hl7.org/CodeSystem/v3-NullFlavor",
          },
        },
      ],
    };

    fixture.detectChanges();

    const radioDe: DebugElement = fixture.debugElement;
    const radioEl: HTMLElement = radioDe.nativeElement;
    const inputEl = radioDe.query(By.css("input"));
    expect(inputEl.attributes.type).toBe("radio");
    console.log(radioEl);
  });

  it("should be displayed as a dropdown", () => {
    component.item = {
      linkId: "3d46c42b-a10f-4805-ad9f-ae9510bdbc4e",
      text: "Aboriginal and Torres Strait Islander status",
      type: "choice",
      item: [],
      answerOption: [
        {
          valueCoding: {
            code: "1",
            display: "Aboriginal but not Torres Strait Islander origin",
            system:
              "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
          },
        },
        {
          valueCoding: {
            code: "2",
            display: "Torres Strait Islander but not Aboriginal origin",
            system:
              "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
          },
        },
        {
          valueCoding: {
            code: "3",
            display: "Both Aboriginal and Torres Strait Islander origin",
            system:
              "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
          },
        },
        {
          valueCoding: {
            code: "4",
            display: "Neither Aboriginal nor Torres Strait Islander origin",
            system:
              "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
          },
        },
        {
          valueCoding: {
            code: "9",
            display: "Not stated/inadequately described",
            system:
              "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
          },
        },
      ],
    };
    fixture.detectChanges();

    const dropdownDe: DebugElement = fixture.debugElement;
    const dropdownEl: HTMLElement = dropdownDe.nativeElement;
    expect(dropdownDe.query(By.css("select")));
  });
});

import { TestBed } from "@angular/core/testing";

import { EnableWhenService } from "./enable-when.service";

describe("compareWhenExprAnswerBoolean", () => {
  let service: EnableWhenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnableWhenService);
  });
  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should be true when invalid answer type is given", () =>
    expect(
      service.compareWhenExprAnswerBoolean(
        { valueBoolean: true },
        {
          question: "linked-question-response",
          operator: ">",
          answerInteger: 24,
        }
      )
    ).toBeTruthy());

  it("should be true when both answerBoolean and valueBoolean is true", () =>
    expect(
      service.compareWhenExprAnswerBoolean(
        { valueBoolean: true },
        {
          question: "linked-question-response",
          operator: "=",
          answerBoolean: true,
        }
      )
    ).toBeTruthy());

  it("should be false when valueBoolean is false while answerBoolean is true", () =>
    expect(
      service.compareWhenExprAnswerBoolean(
        { valueBoolean: false },
        {
          question: "linked-question-response",
          operator: "=",
          answerBoolean: true,
        }
      )
    ).toBeFalsy());

  it("should be false when valueBoolean is true while answerBoolean is false", () =>
    expect(
      service.compareWhenExprAnswerBoolean(
        { valueBoolean: true },
        {
          question: "linked-question-response",
          operator: "=",
          answerBoolean: false,
        }
      )
    ).toBeFalsy());
});

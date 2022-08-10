import { Injectable } from "@angular/core";
import { AnswerOption } from "./questionnaire.model";

@Injectable({
  providedIn: "root",
})
export class AnswerOptionService {
  addAnswerOption(option: AnswerOption): AnswerOption {
    if (option["valueString"]) {
      return {
        valueCoding: {
          code: option["valueString"],
          display: option["valueString"],
          system: "",
        },
      };
    } else if (option["valueInteger"]) {
      return {
        valueCoding: {
          code: option["valueInteger"] as unknown as string,
          display: option["valueInteger"] as unknown as string,
          system: "",
        },
      };
    } else {
      // if option is valueCoding
      return option;
    }
  }
}

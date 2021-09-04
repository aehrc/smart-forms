import { OnInit, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { QuestionnaireItem } from '../services/questionnaire.service';
import { QuestionnaireFormGroup } from '../services/questionnaireResponse.model';

export abstract class QuestionnaireItemBase implements OnInit {
    @Input() item: QuestionnaireItem;
  
    @Input() parentGroup: QuestionnaireFormGroup;
    @Input() repeat: AbstractControl;
  
    abstract onInit() : void;
  
    ngOnInit(): void {
      this.onInit();
    }
  
    questionnaireInstruction(): string {
      var extension = this.item.extension?.find(e=> e.url == "http://hl7.org/fhir/StructureDefinition/questionnaire-instruction");
      if (extension) {
        console.log(this.parentGroup.item.text, ": ", this.item.text, " => ", extension.valueString);
  
        return extension.valueString;
      }
      return null;
    }
  
    isHidden(): boolean {
      var extension = this.item.extension?.find(e=> e.url == "http://hl7.org/fhir/StructureDefinition/questionnaire-hidden");
      if (extension) {
          return extension.valueBoolean;
      }
      return false;
    }
  
  }
  
  
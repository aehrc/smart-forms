import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { QuestionnaireItem } from '../services/questionnaire.service';
import { QuestionnaireItemBase } from './questionnaire-item-base.component';

import { Pipe, PipeTransform } from '@angular/core';

abstract class TabFilterPipeBase {

    isTab(item: QuestionnaireItem) {
      var itemControl = item.extension?.find(e=> e.url == "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl");
      if (itemControl) {
          var tabCoding = itemControl.valueCodeableConcept?.coding?.find(c=> c.code == "tab");
          if (tabCoding)
              return true;
      }
      return false;
    }  
}
  
@Pipe({
  name: 'tabGroups'
})
export class TabFilterPipe extends TabFilterPipeBase implements PipeTransform {

  // value - array of QuestionnaireItem
  // return array of QuestionnaireItem that are tabs
  transform(value: QuestionnaireItem[]): QuestionnaireItem[] {
       return value.filter(i=> this.isTab(i));
    }
}

@Pipe({
  name: 'nonTabItems'
})
export class NonTabItemFilterPipe extends TabFilterPipeBase implements PipeTransform {

  // value - array of QuestionnaireItem
  // return array of QuestionnaireItem that are not tabs
  transform(value: QuestionnaireItem[]): QuestionnaireItem[] {
       return value.filter(i=> !this.isTab(i));
    }
}

@Component({
  selector: 'qitem-group',
  templateUrl: './questionnaire-item-group.component.html',
  styleUrls: ['./questionnaire-item.component.css'],
  providers: [TabFilterPipe]
})
export class QuestionnaireItemGroupComponent extends QuestionnaireItemBase {

  formGroup: FormGroup = new FormGroup({});

  constructor(private tabFilter: TabFilterPipe) {
      super();
  }

  onInit() {
    if (this.parentGroup)
      this.formGroup = this.parentGroup.controls[this.item.linkId] as FormGroup;

    else if (this.repeat)
      this.formGroup = this.repeat as FormGroup;

  }

  /*
  private isTab(item: QuestionnaireItem) {
    var itemControl = item.extension?.find(e=> e.url == "http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl");
    if (itemControl) {
        var tabCoding = itemControl.valueCodeableConcept?.coding?.find(c=> c.code == "tab");
        if (tabCoding)
            return true;
    }
    return false;
  }
  */

  containsTabs() {
    //var firstTab = this.item.item.find(i=> this.isTab(i));
    var tabItems = this.tabFilter.transform(this.item.item);

    //if (firstTab)
    if (tabItems.length > 0)
        return true;
    return false;
  }
/*
  groupTabs(): QuestionnaireItem[] {
    var tabItems = this.item.item.filter(i=> this.isTab(i));
    return tabItems;
  }

  nonTabItems(): QuestionnaireItem[] {
    var tabItems = this.item.item.filter(i=> !this.isTab(i));
    return tabItems;
  }
*/  
}


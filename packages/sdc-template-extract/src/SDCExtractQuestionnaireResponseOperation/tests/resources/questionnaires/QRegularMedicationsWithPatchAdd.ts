import type { Questionnaire } from 'fhir/r4';

export const QRegularMedicationsWithPatchAdd: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'RegularMedications',
  meta: {
    versionId: '7',
    lastUpdated: '2025-09-23T03:39:57.157+00:00',
    source: '#JNgut1GnedAqKRUg',
    profile: [
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-extr-template',
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-modular',
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-pop-exp',
      'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-render'
    ]
  },
  text: {
    status: 'extensions',
    div: '<div xmlns="http://www.w3.org/1999/xhtml"><p class="res-header-id"><b>Generated Narrative: Questionnaire RegularMedications</b></p><a name="RegularMedications"> </a><a name="hcRegularMedications"> </a><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px"/><p style="margin-bottom: 0px">Profiles: <a href="https://build.fhir.org/ig/HL7/sdc/StructureDefinition-sdc-questionnaire-render.html">Advanced Rendering Questionnaire</a>, <a href="https://build.fhir.org/ig/HL7/sdc/StructureDefinition-sdc-questionnaire-modular.html">SDC Modular Questionnaire</a>, <a href="https://build.fhir.org/ig/HL7/sdc/StructureDefinition-sdc-questionnaire-pop-exp.html">Populatable Questionnaire - Expression</a>, <a href="https://build.fhir.org/ig/HL7/sdc/StructureDefinition-sdc-questionnaire-extr-template.html">Extractable Questionnaire - Template</a></p></div><table border="1" cellpadding="0" cellspacing="0" style="border: 1px #F0F0F0 solid; font-size: 11px; font-family: verdana; vertical-align: top;"><tr style="border: 2px #F0F0F0 solid; font-size: 11px; font-family: verdana; vertical-align: top"><th style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; padding-top: 3px; padding-bottom: 3px" class="hierarchy"><a href="https://hl7.org/fhir/R4/formats.html#table" title="The linkID for the item">LinkID</a></th><th style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; padding-top: 3px; padding-bottom: 3px" class="hierarchy"><a href="https://hl7.org/fhir/R4/formats.html#table" title="Text for the item">Text</a></th><th style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; padding-top: 3px; padding-bottom: 3px" class="hierarchy"><a href="https://hl7.org/fhir/R4/formats.html#table" title="Minimum and Maximum # of times the item can appear in the instance">Cardinality</a></th><th style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; padding-top: 3px; padding-bottom: 3px" class="hierarchy"><a href="https://hl7.org/fhir/R4/formats.html#table" title="The type of the item">Type</a></th><th style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; padding-top: 3px; padding-bottom: 3px" class="hierarchy"><a href="https://hl7.org/fhir/R4/formats.html#table" title="Other attributes of the item">Flags</a></th><th style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; padding-top: 3px; padding-bottom: 3px" class="hierarchy"><a href="https://hl7.org/fhir/R4/formats.html#table" title="Additional information about the item">Description &amp; Constraints</a><span style="float: right"><a href="https://hl7.org/fhir/R4/formats.html#table" title="Legend for this format"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3goXBCwdPqAP0wAAAldJREFUOMuNk0tIlFEYhp9z/vE2jHkhxXA0zJCMitrUQlq4lnSltEqCFhFG2MJFhIvIFpkEWaTQqjaWZRkp0g26URZkTpbaaOJkDqk10szoODP//7XIMUe0elcfnPd9zsfLOYplGrpRwZaqTtw3K7PtGem7Q6FoidbGgqHVy/HRb669R+56zx7eRV1L31JGxYbBtjKK93cxeqfyQHbehkZbUkK20goELEuIzEd+dHS+qz/Y8PTSif0FnGkbiwcAjHaU1+QWOptFiyCLp/LnKptpqIuXHx6rbR26kJcBX3yLgBfnd7CxwJmflpP2wUg0HIAoUUpZBmKzELGWcN8nAr6Gpu7tLU/CkwAaoKTWRSQyt89Q8w6J+oVQkKnBoblH7V0PPvUOvDYXfopE/SJmALsxnVm6LbkotrUtNowMeIrVrBcBpaMmdS0j9df7abpSuy7HWehwJdt1lhVwi/J58U5beXGAF6c3UXLycw1wdFklArBn87xdh0ZsZtArghBdAA3+OEDVubG4UEzP6x1FOWneHh2VDAHBAt80IbdXDcesNoCvs3E5AFyNSU5nbrDPZpcUEQQTFZiEVx+51fxMhhyJEAgvlriadIJZZksRuwBYMOPBbO3hePVVqgEJhFeUuFLhIPkRP6BQLIBrmMenujm/3g4zc398awIe90Zb5A1vREALqneMcYgP/xVQWlG+Ncu5vgwwlaUNx+3799rfe96u9K0JSDXcOzOTJg4B6IgmXfsygc7/Bvg9g9E58/cDVmGIBOP/zT8Bz1zqWqpbXIsd0O9hajXfL6u4BaOS6SeWAAAAAElFTkSuQmCC" alt="doco" style="background-color: inherit"/></a></span></th></tr><tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck1.png)" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon_q_root.gif" alt="." style="background-color: white; background-color: inherit" title="QuestionnaireRoot" class="hierarchy"/> RegularMedications</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Questionnaire</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">http://www.health.gov.au/assessments/mbs/715/RegularMedications#0.3.0</td></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01.png)" id="item.7dfe7c6a-ca7f-4ddf-9241-a7b918a9695a" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin_end.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-group.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="group" class="hierarchy"/> 7dfe7c6a-ca7f-4ddf-9241-a7b918a9695a</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Regular medications</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-group">group</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck010.png)" id="item.CD-in-progress-23" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-display.png" alt="." style="background-color: white; background-color: inherit" title="display" class="hierarchy"/> CD-in-progress-23</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">In progress</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-display">display</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Enable When: <span><a href="#item.MarkComplete-23">MarkComplete-23</a> != </span></td></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck010.png)" id="item.CD-complete-23" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-display.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="display" class="hierarchy"/> CD-complete-23</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Complete</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-display">display</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Enable When: <span><a href="#item.MarkComplete-23">MarkComplete-23</a> = </span></td></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck010.png)" id="item.regularmedications-instruction" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-display.png" alt="." style="background-color: white; background-color: inherit" title="display" class="hierarchy"/> regularmedications-instruction</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Check medications are still required, appropriate dose, understanding of medication and adherence</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-display">display</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck011.png)" id="item.regularmedications-summary" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-group.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="group" class="hierarchy"/> regularmedications-summary</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Medication summary</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-group">group</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck0111.png)" id="item.regularmedications-summary-current" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-group.png" alt="." style="background-color: white; background-color: inherit" title="group" class="hierarchy"/> regularmedications-summary-current</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Current medications</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-group">group</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01110.png)" id="item.medicationStatementId" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-string.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="string" class="hierarchy"/> medicationStatementId</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">null</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-string">string</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/extension-questionnaire-hidden.html" title="Is a hidden item"><img src="icon-qi-hidden.png" alt="icon"/></a><img src="icon-qi-hidden.png" alt="icon"/></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01110.png)" id="item.regularmedications-summary-current-medication" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-coding.png" alt="." style="background-color: white; background-color: inherit" title="coding" class="hierarchy"/> regularmedications-summary-current-medication</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Medication</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-open-choice">open-choice</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/questionnaire-definitions.html#Questionnaire.item.readOnly" title="Is Read Only"><img src="icon-qi-readonly.png" alt="icon"/></a><img src="icon-qi-readonly.png" alt="icon"/></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Value Set: <a href="ValueSet-RegularMedications_smart-health-checks-medicine-products.html">Smart Health Checks Medicine Products</a></td></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01110.png)" id="item.regularmedications-summary-current-status" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-coding.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="coding" class="hierarchy"/> regularmedications-summary-current-status</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Status</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-choice">choice</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Value Set: <a href="ValueSet-RegularMedications_MedicationStatementStatusLimited.html">Medication Statement Status Limited</a></td></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01110.png)" id="item.regularmedications-summary-current-dosage" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-text.png" alt="." style="background-color: white; background-color: inherit" title="text" class="hierarchy"/> regularmedications-summary-current-dosage</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Dosage</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-text">text</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01110.png)" id="item.regularmedications-summary-current-dosage-hidden" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-text.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="text" class="hierarchy"/> regularmedications-summary-current-dosage-hidden</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">null</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-text">text</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/extension-questionnaire-hidden.html" title="Is a hidden item"><img src="icon-qi-hidden.png" alt="icon"/></a><img src="icon-qi-hidden.png" alt="icon"/></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01110.png)" id="item.regularmedications-summary-current-reasoncode" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-coding.png" alt="." style="background-color: white; background-color: inherit" title="coding" class="hierarchy"/> regularmedications-summary-current-reasoncode</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Clinical indication</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-open-choice">open-choice</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/questionnaire-definitions.html#Questionnaire.item.readOnly" title="Is Read Only"><img src="icon-qi-readonly.png" alt="icon"/></a><img src="icon-qi-readonly.png" alt="icon"/></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Value Set: <a href="ValueSet-RegularMedications_medication-reason-taken-1.html">Medication Reason Taken</a></td></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01110.png)" id="item.regularmedications-summary-current-comment" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-text.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="text" class="hierarchy"/> regularmedications-summary-current-comment</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Comment</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-text">text</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01100.png)" id="item.regularmedications-summary-current-comment-hidden" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin_end.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-text.png" alt="." style="background-color: white; background-color: inherit" title="text" class="hierarchy"/> regularmedications-summary-current-comment-hidden</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">null</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-text">text</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/extension-questionnaire-hidden.html" title="Is a hidden item"><img src="icon-qi-hidden.png" alt="icon"/></a><img src="icon-qi-hidden.png" alt="icon"/></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck0101.png)" id="item.regularmedications-summary-new" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin_end.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-group.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="group" class="hierarchy"/> regularmedications-summary-new</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">New medications</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-group">group</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01010.png)" id="item.regularmedications-summary-new-medication" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-coding.png" alt="." style="background-color: white; background-color: inherit" title="coding" class="hierarchy"/> regularmedications-summary-new-medication</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Medication</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-open-choice">open-choice</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Value Set: <a href="ValueSet-RegularMedications_smart-health-checks-medicine-products.html">Smart Health Checks Medicine Products</a></td></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01010.png)" id="item.regularmedications-summary-new-dosage" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-text.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="text" class="hierarchy"/> regularmedications-summary-new-dosage</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Dosage</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-text">text</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01010.png)" id="item.regularmedications-summary-new-reasoncode" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-coding.png" alt="." style="background-color: white; background-color: inherit" title="coding" class="hierarchy"/> regularmedications-summary-new-reasoncode</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Clinical indication</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..*</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-open-choice">open-choice</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Value Set: <a href="ValueSet-RegularMedications_medication-reason-taken-1.html">Medication Reason Taken</a></td></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck01000.png)" id="item.regularmedications-summary-new-comment" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vline.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin_end.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-text.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="text" class="hierarchy"/> regularmedications-summary-new-comment</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Comment</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-text">text</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck010.png)" id="item.6eb59145-ed9a-4184-af83-3506d47e4d4e" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-coding.png" alt="." style="background-color: white; background-color: inherit" title="coding" class="hierarchy"/> 6eb59145-ed9a-4184-af83-3506d47e4d4e</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Does your child take any regular medications (prescribed, over-the-counter, traditional, complementary and alternative)?</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-choice">choice</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/extension-questionnaire-choiceorientation.html" title="Orientation: horizontal "><img src="icon-qi-horizontal.png" alt="icon"/></a><img src="icon-qi-horizontal.png" alt="icon"/></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Value Set: <a href="ValueSet-RegularMedications_YesNo.html">Yes/No</a></td></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck010.png)" id="item.3a2d27b6-e918-4df5-aca9-b374fcf9faad" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-coding.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="coding" class="hierarchy"/> 3a2d27b6-e918-4df5-aca9-b374fcf9faad</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Do you take any regular medications (prescribed, over-the-counter, traditional, complementary and alternative)?</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-choice">choice</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/extension-questionnaire-choiceorientation.html" title="Orientation: horizontal "><img src="icon-qi-horizontal.png" alt="icon"/></a><img src="icon-qi-horizontal.png" alt="icon"/></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Value Set: <a href="ValueSet-RegularMedications_YesNo.html">Yes/No</a></td></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck010.png)" id="item.874ec8db-95c9-4cc0-95db-e45edaa3cd12" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-boolean.png" alt="." style="background-color: white; background-color: inherit" title="boolean" class="hierarchy"/> 874ec8db-95c9-4cc0-95db-e45edaa3cd12</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Check the health record is up to date</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-boolean">boolean</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck010.png)" id="item.36290837-ad70-48b2-9c66-31533fec918b" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-boolean.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="boolean" class="hierarchy"/> 36290837-ad70-48b2-9c66-31533fec918b</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Check medication understanding and adherence with patient</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-boolean">boolean</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Enable When: <ul><li><a href="#item.6eb59145-ed9a-4184-af83-3506d47e4d4e">6eb59145-ed9a-4184-af83-3506d47e4d4e</a> = </li><li><a href="#item.3a2d27b6-e918-4df5-aca9-b374fcf9faad">3a2d27b6-e918-4df5-aca9-b374fcf9faad</a> = </li></ul></td></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: white"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck010.png)" id="item.aa9ff2ed-bcd2-406d-a9ff-89c201df2605" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-text.png" alt="." style="background-color: white; background-color: inherit" title="text" class="hierarchy"/> aa9ff2ed-bcd2-406d-a9ff-89c201df2605</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Health priorities, actions and follow-up</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-text">text</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: white; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr style="border: 1px #F0F0F0 solid; padding:0px; vertical-align: top; background-color: #F7F7F7"><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px; white-space: nowrap; background-image: url(tbl_bck000.png)" id="item.MarkComplete-23" class="hierarchy"><img src="tbl_spacer.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_blank.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="tbl_vjoin_end.png" alt="." style="background-color: inherit" class="hierarchy"/><img src="icon-q-boolean.png" alt="." style="background-color: #F7F7F7; background-color: inherit" title="boolean" class="hierarchy"/> MarkComplete-23</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">Mark section as complete</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy">0..1</td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"><a href="https://hl7.org/fhir/R4/codesystem-item-type.html#item-type-boolean">boolean</a></td><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/><td style="vertical-align: top; text-align : var(--ig-left,left); background-color: #F7F7F7; border: 1px #F0F0F0 solid; padding:0px 4px 0px 4px" class="hierarchy"/></tr>\r\n<tr><td colspan="6" class="hierarchy"><br/><a href="https://hl7.org/fhir/R4/formats.html#table" title="Legend for this format"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3goXBCwdPqAP0wAAAldJREFUOMuNk0tIlFEYhp9z/vE2jHkhxXA0zJCMitrUQlq4lnSltEqCFhFG2MJFhIvIFpkEWaTQqjaWZRkp0g26URZkTpbaaOJkDqk10szoODP//7XIMUe0elcfnPd9zsfLOYplGrpRwZaqTtw3K7PtGem7Q6FoidbGgqHVy/HRb669R+56zx7eRV1L31JGxYbBtjKK93cxeqfyQHbehkZbUkK20goELEuIzEd+dHS+qz/Y8PTSif0FnGkbiwcAjHaU1+QWOptFiyCLp/LnKptpqIuXHx6rbR26kJcBX3yLgBfnd7CxwJmflpP2wUg0HIAoUUpZBmKzELGWcN8nAr6Gpu7tLU/CkwAaoKTWRSQyt89Q8w6J+oVQkKnBoblH7V0PPvUOvDYXfopE/SJmALsxnVm6LbkotrUtNowMeIrVrBcBpaMmdS0j9df7abpSuy7HWehwJdt1lhVwi/J58U5beXGAF6c3UXLycw1wdFklArBn87xdh0ZsZtArghBdAA3+OEDVubG4UEzP6x1FOWneHh2VDAHBAt80IbdXDcesNoCvs3E5AFyNSU5nbrDPZpcUEQQTFZiEVx+51fxMhhyJEAgvlriadIJZZksRuwBYMOPBbO3hePVVqgEJhFeUuFLhIPkRP6BQLIBrmMenujm/3g4zc398awIe90Zb5A1vREALqneMcYgP/xVQWlG+Ncu5vgwwlaUNx+3799rfe96u9K0JSDXcOzOTJg4B6IgmXfsygc7/Bvg9g9E58/cDVmGIBOP/zT8Bz1zqWqpbXIsd0O9hajXfL6u4BaOS6SeWAAAAAElFTkSuQmCC" alt="doco" style="background-color: inherit"/> Documentation for this format</a></td></tr></table><h2>Contained Resources</h2><hr/><p class="res-header-id"><b>ValueSet #YesNo</b></p><a name="RegularMedications/YesNo"> </a><a name="hcRegularMedications/YesNo"> </a><p style="border: black 1px dotted; background-color: #EEEEEE; padding: 8px; margin-bottom: 8px">Expansion based on <a href="http://terminology.hl7.org/6.5.0/CodeSystem-v2-0532.html">codesystem expandedYes-NoIndicator v2.0.0 (CodeSystem)</a></p><p>This value set contains 2 concepts</p><table class="codes"><tr><td style="white-space:nowrap"><b>Code</b></td><td><b>System</b></td><td><b>Display</b></td><td><b>Definition</b></td></tr><tr><td style="white-space:nowrap"><a name="RegularMedications/YesNo-http://terminology.hl7.org/CodeSystem/v2-0532-Y"> </a>  <a href="http://terminology.hl7.org/6.5.0/CodeSystem-v2-0532.html#v2-0532-Y">Y</a></td><td>http://terminology.hl7.org/CodeSystem/v2-0532</td><td>Yes</td><td>Yes</td></tr><tr><td style="white-space:nowrap"><a name="RegularMedications/YesNo-http://terminology.hl7.org/CodeSystem/v2-0532-N"> </a>  <a href="http://terminology.hl7.org/6.5.0/CodeSystem-v2-0532.html#v2-0532-N">N</a></td><td>http://terminology.hl7.org/CodeSystem/v2-0532</td><td>No</td><td>No</td></tr></table><hr/><p class="res-header-id"><b>ValueSet #smart-health-checks-medicine-products</b></p><a name="RegularMedications/smart-health-checks-medicine-products"> </a><a name="hcRegularMedications/smart-health-checks-medicine-products"> </a><ul><li>Include codes from<a href="http://www.snomed.org/"><code>http://snomed.info/sct</code></a> where constraint  = ^ 929360081000036101|Medicinal product pack reference set| OR ^ 929360071000036103|Medicinal product unit of use reference set| OR ^ 929360041000036105|Trade product pack reference set| OR ^ 929360031000036100|Trade product unit of use reference set| OR ^ 929360051000036108|Containered trade product pack reference set|</li></ul><hr/><p class="res-header-id"><b>ValueSet #medication-reason-taken-1</b></p><a name="RegularMedications/medication-reason-taken-1"> </a><a name="hcRegularMedications/medication-reason-taken-1"> </a><div style="display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%"><p style="margin-bottom: 0px"/><p style="margin-bottom: 0px">Profiles: <a href="http://hl7.org/fhir/R4/shareablevalueset.html">Shareable ValueSet</a>, <code>https://healthterminologies.gov.au/fhir/StructureDefinition/composed-value-set-4</code></p></div><ul><li>Include codes from<a href="http://www.snomed.org/"><code>http://snomed.info/sct</code></a> where constraint  = ^32570581000036105|Problem/Diagnosis reference set| OR ^1184831000168105|Drug prophylaxis reference set| OR &lt;&lt;399097000|Administration of anaesthesia| OR 169443000|Preventive procedure|</li></ul><hr/><p class="res-header-id"><b>MedicationStatement #MedicationStatementTemplate</b></p><a name="RegularMedications/MedicationStatementTemplate"> </a><a name="hcRegularMedications/MedicationStatementTemplate"> </a><p><b>status</b>: active</p><p><b>status</b>: recorded</p><p><b>subject</b>: ?rref?</p><p><b>dateAsserted</b>: <code>Extract Template - Extract value: </code>now()</p><p><b>note</b>: </p><blockquote/><h3>Dosages</h3><table class="grid"><tr><td style="display: none">-</td><td><b>Extension</b></td><td><b>Text</b></td></tr><tr><td style="display: none">*</td><td/><td><code>Extract Template - Extract value: </code>$this</td></tr></table><hr/><p class="res-header-id"><b>Parameters #MedicationStatementPatchTemplate</b></p><a name="RegularMedications/MedicationStatementPatchTemplate"> </a><a name="hcRegularMedications/MedicationStatementPatchTemplate"> </a><h2>Parameters</h2><table class="grid"><tr><td>operation</td><td/></tr><tr><td> type</td><td>add</td></tr><tr><td> path</td><td>MedicationStatement</td></tr><tr><td> name</td><td>status</td></tr><tr><td> value</td><td/></tr><tr><td> pathLabel</td><td>Status</td></tr><tr><td>operation</td><td/></tr><tr><td> type</td><td>add</td></tr><tr><td> path</td><td><code>Extract Template - Extract value: </code>iif(item.where(linkId=\'regularmedications-summary-current-dosage-hidden\').answer.value.exists(), \'MedicationStatement.dosage[0]\', \'MedicationStatement\')</td></tr><tr><td> name</td><td><code>Extract Template - Extract value: </code>iif(item.where(linkId=\'regularmedications-summary-current-dosage-hidden\').answer.value.exists(), \'text\', \'dosage\')</td></tr><tr><td> </td><td><code>Extract Template - Extract value: </code>iif(item.where(linkId=\'regularmedications-summary-current-dosage-hidden\').answer.value.exists(), item.where(linkId=\'regularmedications-summary-current-dosage\').answer.value.first())</td></tr><tr><td> </td><td>No display for Dosage </td></tr><tr><td> pathLabel</td><td>Dosage</td></tr><tr><td>operation</td><td/></tr><tr><td> type</td><td>add</td></tr><tr><td> path</td><td><code>Extract Template - Extract value: </code>iif(item.where(linkId=\'regularmedications-summary-current-comment-hidden\').answer.value.exists(), \'MedicationStatement.note[0]\', \'MedicationStatement\')</td></tr><tr><td> name</td><td><code>Extract Template - Extract value: </code>iif(item.where(linkId=\'regularmedications-summary-current-comment-hidden\').answer.value.exists(), \'text\', \'note\')</td></tr><tr><td> </td><td/></tr><tr><td> </td><td><blockquote/></td></tr><tr><td> pathLabel</td><td>Comment</td></tr></table><hr/><p class="res-header-id"><b>ValueSet #MedicationStatementStatusLimited</b></p><a name="RegularMedications/MedicationStatementStatusLimited"> </a><a name="hcRegularMedications/MedicationStatementStatusLimited"> </a><p style="border: black 1px dotted; background-color: #EEEEEE; padding: 8px; margin-bottom: 8px">Expansion based on <a href="http://hl7.org/fhir/R4/codesystem-medication-statement-status.html">codesystem Medication  status  codes v4.0.1 (CodeSystem)</a></p><p>This value set contains 4 concepts</p><table class="codes"><tr><td style="white-space:nowrap"><b>Code</b></td><td><b>System</b></td><td><b>Display</b></td><td><b>Definition</b></td></tr><tr><td style="white-space:nowrap"><a name="RegularMedications/MedicationStatementStatusLimited-http://hl7.org/fhir/CodeSystem/medication-statement-status-active"> </a>  <a href="http://hl7.org/fhir/R4/codesystem-medication-statement-status.html#medication-statement-status-active">active</a></td><td>http://hl7.org/fhir/CodeSystem/medication-statement-status</td><td>Active</td><td>The medication is still being taken.</td></tr><tr><td style="white-space:nowrap"><a name="RegularMedications/MedicationStatementStatusLimited-http://hl7.org/fhir/CodeSystem/medication-statement-status-completed"> </a>  <a href="http://hl7.org/fhir/R4/codesystem-medication-statement-status.html#medication-statement-status-completed">completed</a></td><td>http://hl7.org/fhir/CodeSystem/medication-statement-status</td><td>Completed</td><td>The medication is no longer being taken.</td></tr><tr><td style="white-space:nowrap"><a name="RegularMedications/MedicationStatementStatusLimited-http://hl7.org/fhir/CodeSystem/medication-statement-status-stopped"> </a>  <a href="http://hl7.org/fhir/R4/codesystem-medication-statement-status.html#medication-statement-status-stopped">stopped</a></td><td>http://hl7.org/fhir/CodeSystem/medication-statement-status</td><td>Stopped</td><td>Actions implied by the statement have been permanently halted, before all of them occurred. This should not be used if the statement was entered in error.</td></tr><tr><td style="white-space:nowrap"><a name="RegularMedications/MedicationStatementStatusLimited-http://hl7.org/fhir/CodeSystem/medication-statement-status-on-hold"> </a>  <a href="http://hl7.org/fhir/R4/codesystem-medication-statement-status.html#medication-statement-status-on-hold">on-hold</a></td><td>http://hl7.org/fhir/CodeSystem/medication-statement-status</td><td>On Hold</td><td>Actions implied by the statement have been temporarily halted, but are expected to continue later. May also be called \'suspended\'.</td></tr></table></div>'
  },
  contained: [
    {
      resourceType: 'ValueSet',
      id: 'YesNo',
      url: 'https://smartforms.csiro.au/ig/ValueSet/YesNo',
      name: 'YesNo',
      title: 'Yes/No',
      status: 'draft',
      experimental: false,
      description: 'Concepts for Yes and No',
      compose: {
        include: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            version: '2.0.0',
            concept: [
              {
                code: 'Y',
                display: 'Yes'
              },
              {
                code: 'N',
                display: 'No'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:5d9dbf1e-e156-4961-bb02-051dfc831832',
        timestamp: '2025-09-18T16:28:54+10:00',
        total: 2,
        offset: 0,
        parameter: [
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://terminology.hl7.org/CodeSystem/v2-0532|2.0.0'
          }
        ],
        contains: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'Y',
            display: 'Yes'
          },
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0532',
            code: 'N',
            display: 'No'
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'smart-health-checks-medicine-products',
      url: 'https://smartforms.csiro.au/ig/ValueSet/smart-health-checks-medicine-products',
      name: 'SmartHealthChecksMedicineProducts',
      title: 'Smart Health Checks Medicine Products',
      status: 'draft',
      experimental: false,
      description:
        'The Smart Health Checks Medicine Products value set includes Australian Medicines Terminology (AMT) product concepts that may be used for the identification of a medicine with form, ingredient and unit of measure details.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            version: 'http://snomed.info/sct/32506021000036107',
            filter: [
              {
                property: 'constraint',
                op: '=',
                value:
                  '^ 929360081000036101|Medicinal product pack reference set| OR ^ 929360071000036103|Medicinal product unit of use reference set| OR ^ 929360041000036105|Trade product pack reference set| OR ^ 929360031000036100|Trade product unit of use reference set| OR ^ 929360051000036108|Containered trade product pack reference set|'
              }
            ]
          }
        ]
      }
    },
    {
      resourceType: 'ValueSet',
      id: 'medication-reason-taken-1',
      meta: {
        profile: [
          'http://hl7.org/fhir/StructureDefinition/shareablevalueset',
          'https://healthterminologies.gov.au/fhir/StructureDefinition/composed-value-set-4'
        ]
      },
      url: 'https://healthterminologies.gov.au/fhir/ValueSet/medication-reason-taken-1',
      identifier: [
        {
          system: 'urn:ietf:rfc:3986',
          value: 'urn:oid:1.2.36.1.2001.1004.201.10048'
        }
      ],
      version: '1.1.0',
      name: 'MedicationReasonTaken',
      title: 'Medication Reason Taken',
      status: 'active',
      experimental: false,
      date: '2020-07-31',
      publisher: 'Australian Digital Health Agency',
      contact: [
        {
          telecom: [
            {
              system: 'email',
              value: 'help@digitalhealth.gov.au'
            }
          ]
        }
      ],
      description:
        'The Medication Reason Taken value set includes values that identify a reason why a medication has been or is being taken.',
      copyright:
        'Copyright © 2020 Australian Digital Health Agency - All rights reserved. Except for the material identified below, this content is licensed under a Creative Commons Attribution 4.0 International License. See https://creativecommons.org/licenses/by/4.0/. \n\nThis resource includes SNOMED Clinical Terms™ (SNOMED CT®) which is used by permission of the International Health Terminology Standards Development Organisation (IHTSDO). All rights reserved. SNOMED CT®, was originally created by The College of American Pathologists. “SNOMED” and “SNOMED CT” are registered trademarks of the IHTSDO. \n\nThe rights to use and implement or implementation of SNOMED CT content are limited to the extent it is necessary to allow for the end use of this material.  No further rights are granted in respect of the International Release and no further use of any SNOMED CT content by any other party is permitted.\n\nAll copies of this resource must include this copyright statement and all information contained in this statement.',
      compose: {
        include: [
          {
            system: 'http://snomed.info/sct',
            filter: [
              {
                property: 'constraint',
                op: '=',
                value:
                  '^32570581000036105|Problem/Diagnosis reference set| OR ^1184831000168105|Drug prophylaxis reference set| OR <<399097000|Administration of anaesthesia| OR 169443000|Preventive procedure|'
              }
            ]
          }
        ]
      }
    },
    {
      resourceType: 'MedicationStatement',
      id: 'MedicationStatementTemplate',
      status: 'active',
      medicationCodeableConcept: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
            valueString:
              "item.where(linkId='regularmedications-summary-new-medication').answer.value"
          }
        ],
        coding: [
          {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: 'ofType(Coding)'
              }
            ]
          }
        ],
        _text: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: 'ofType(string)'
            }
          ]
        }
      },
      subject: {
        _reference: {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
              valueString: '%resource.subject.reference'
            }
          ]
        }
      },
      _dateAsserted: {
        extension: [
          {
            url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
            valueString: 'now()'
          }
        ]
      },
      reasonCode: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString:
                "item.where(linkId='regularmedications-summary-new-reasoncode').answer.value.ofType(Coding)"
            }
          ],
          coding: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                  valueString: '$this'
                }
              ]
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString:
                "item.where(linkId='regularmedications-summary-new-reasoncode').answer.value.ofType(string)"
            }
          ],
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: '$this'
              }
            ]
          }
        }
      ],
      note: [
        // @ts-ignore - TS2741: Property text is missing in type. This is a template so we can get away with no "text" field
        {
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString:
                  "item.where(linkId='regularmedications-summary-new-comment').answer.value"
              }
            ]
          }
        }
      ],
      dosage: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractContext',
              valueString: "item.where(linkId='regularmedications-summary-new-dosage').answer.value"
            }
          ],
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                valueString: '$this'
              }
            ]
          }
        }
      ]
    },
    {
      resourceType: 'Parameters',
      id: 'MedicationStatementPatchTemplate',
      parameter: [
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              valueString: 'MedicationStatement'
            },
            {
              name: 'name',
              valueString: 'status'
            },
            {
              name: 'value',
              _valueCode: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                    valueString:
                      "item.where(linkId='regularmedications-summary-current-status').answer.value.code"
                  }
                ]
              }
            },
            {
              name: 'pathLabel',
              valueString: 'Status'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              _valueString: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                    valueString:
                      "iif(item.where(linkId='regularmedications-summary-current-dosage-hidden').answer.value.exists(), 'MedicationStatement.dosage[0]', 'MedicationStatement')"
                  }
                ]
              }
            },
            {
              name: 'name',
              _valueString: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                    valueString:
                      "iif(item.where(linkId='regularmedications-summary-current-dosage-hidden').answer.value.exists(), 'text', 'dosage')"
                  }
                ]
              }
            },
            // @ts-ignore - TS2741: Property name is missing in type. This is a template so we can get away with no "name" field
            {
              _name: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                    valueString:
                      "iif(item.where(linkId='regularmedications-summary-current-dosage-hidden').answer.value.exists(), 'value')"
                  }
                ]
              },
              _valueString: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                    valueString:
                      "iif(item.where(linkId='regularmedications-summary-current-dosage-hidden').answer.value.exists(), item.where(linkId='regularmedications-summary-current-dosage').answer.value.first())"
                  }
                ]
              }
            },
            // @ts-ignore - TS2741: Property name is missing in type. This is a template so we can get away with no "name" field
            {
              _name: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                    valueString:
                      "iif(item.where(linkId='regularmedications-summary-current-dosage-hidden').answer.value.empty(), 'value')"
                  }
                ]
              },
              valueDosage: {
                _text: {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                      valueString:
                        "iif(item.where(linkId='regularmedications-summary-current-dosage-hidden').answer.value.empty(), item.where(linkId='regularmedications-summary-current-dosage').answer.value.first())"
                    }
                  ]
                }
              }
            },
            {
              name: 'pathLabel',
              valueString: 'Dosage'
            }
          ]
        },
        {
          name: 'operation',
          part: [
            {
              name: 'type',
              valueCode: 'add'
            },
            {
              name: 'path',
              _valueString: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                    valueString:
                      "iif(item.where(linkId='regularmedications-summary-current-comment-hidden').answer.value.exists(), 'MedicationStatement.note[0]', 'MedicationStatement')"
                  }
                ]
              }
            },
            {
              name: 'name',
              _valueString: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                    valueString:
                      "iif(item.where(linkId='regularmedications-summary-current-comment-hidden').answer.value.exists(), 'text', 'note')"
                  }
                ]
              }
            },
            // @ts-ignore - TS2741: Property name is missing in type. This is a template so we can get away with no "name" field
            {
              _name: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                    valueString:
                      "iif(item.where(linkId='regularmedications-summary-current-comment-hidden').answer.value.exists(), 'value')"
                  }
                ]
              },
              _valueMarkdown: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                    valueString:
                      "iif(item.where(linkId='regularmedications-summary-current-comment-hidden').answer.value.exists(), item.where(linkId='regularmedications-summary-current-comment').answer.value.first())"
                  }
                ]
              }
            },
            {
              _name: {
                extension: [
                  {
                    url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                    valueString:
                      "iif(item.where(linkId='regularmedications-summary-current-comment-hidden').answer.value.empty(), 'value')"
                  }
                ]
              },
              // @ts-ignore - TS2741: Property text is missing in type. This is a template so we can get away with no "text" field
              valueAnnotation: {
                _text: {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtractValue',
                      valueString:
                        "iif(item.where(linkId='regularmedications-summary-current-comment-hidden').answer.value.empty(), item.where(linkId='regularmedications-summary-current-comment').answer.value.first())"
                    }
                  ]
                }
              }
            },
            {
              name: 'pathLabel',
              valueString: 'Comment'
            }
          ]
        }
      ]
    },
    {
      resourceType: 'ValueSet',
      id: 'MedicationStatementStatusLimited',
      url: 'https://smartforms.csiro.au/ig/ValueSet/MedicationStatementStatusLimited',
      name: 'MedicationStatementStatusLimited',
      title: 'Medication Statement Status Limited',
      status: 'draft',
      experimental: false,
      description:
        'This value set includes the minimal set of codes to represent the status of a medication statement (i.e., active, completed, stopped and on-hold).',
      compose: {
        include: [
          {
            system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
            concept: [
              {
                code: 'active'
              },
              {
                code: 'completed'
              },
              {
                code: 'stopped'
              },
              {
                code: 'on-hold'
              }
            ]
          }
        ]
      },
      expansion: {
        identifier: 'urn:uuid:59fe5ac1-65bf-4606-8c2a-0a55fba1d064',
        timestamp: '2025-08-25T15:53:32+10:00',
        total: 4,
        offset: 0,
        parameter: [
          {
            name: 'count',
            valueInteger: 1000
          },
          {
            name: 'offset',
            valueInteger: 0
          },
          {
            name: 'excludeNested',
            valueBoolean: false
          },
          {
            name: 'used-codesystem',
            valueUri: 'http://hl7.org/fhir/CodeSystem/medication-statement-status|4.0.1'
          }
        ],
        contains: [
          {
            system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
            code: 'active',
            display: 'Active'
          },
          {
            system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
            code: 'completed',
            display: 'Completed'
          },
          {
            system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
            code: 'stopped',
            display: 'Stopped'
          },
          {
            system: 'http://hl7.org/fhir/CodeSystem/medication-statement-status',
            code: 'on-hold',
            display: 'On Hold'
          }
        ]
      }
    }
  ],
  extension: [
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assemble-expectation',
      valueCode: 'assemble-child'
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'patient'
          }
        },
        {
          url: 'type',
          valueCode: 'Patient'
        },
        {
          url: 'description',
          valueString: 'The patient that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'user'
          }
        },
        {
          url: 'type',
          valueCode: 'Practitioner'
        },
        {
          url: 'description',
          valueString: 'The practitioner user that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext',
      extension: [
        {
          url: 'name',
          valueCoding: {
            system: 'http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext',
            code: 'encounter'
          }
        },
        {
          url: 'type',
          valueCode: 'Encounter'
        },
        {
          url: 'description',
          valueString: 'The encounter that is to be used to pre-populate the form'
        }
      ]
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'MedicationStatement',
        language: 'application/x-fhir-query',
        expression:
          'MedicationStatement?patient={{%patient.id}}&status=active&_include=MedicationStatement:medication'
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'medicationsFromContained',
        language: 'text/fhirpath',
        expression:
          "%MedicationStatement.entry.resource.contained.ofType(Medication).where(id in %MedicationStatement.entry.resource.medication.select(reference.replace('#', '')))"
      }
    },
    {
      url: 'http://hl7.org/fhir/StructureDefinition/variable',
      valueExpression: {
        name: 'medicationsFromRef',
        language: 'text/fhirpath',
        expression:
          "%MedicationStatement.entry.resource.ofType(Medication).where(id in %MedicationStatement.entry.resource.medication.select(reference.replace('Medication/', '')))"
      }
    },
    {
      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-assembleContext',
      valueString: 'age'
    },
    {
      url: 'http://hl7.org/fhir/5.0/StructureDefinition/extension-Questionnaire.versionAlgorithm[x]',
      valueCoding: {
        system: 'http://hl7.org/fhir/version-algorithm',
        code: 'semver'
      }
    }
  ],
  url: 'http://www.health.gov.au/assessments/mbs/715/RegularMedications',
  version: '0.3.0',
  name: 'RegularMedications',
  title: 'Aboriginal and Torres Strait Islander Health Check - Regular Medications',
  status: 'draft',
  experimental: false,
  subjectType: ['Patient'],
  date: '2025-03-14',
  publisher: 'AEHRC CSIRO',
  contact: [
    {
      name: 'AEHRC CSIRO',
      telecom: [
        {
          system: 'url',
          value:
            'https://confluence.csiro.au/display/PCDQFPhase2/Primary+Care+Data+Quality+Foundations+-+Phase+2'
        }
      ]
    }
  ],
  jurisdiction: [
    {
      coding: [
        {
          system: 'urn:iso:std:iso:3166',
          code: 'AU',
          display: 'Australia'
        }
      ]
    }
  ],
  copyright:
    'Copyright © 2022+ Australian Government Department of Health and Aged Care - All rights reserved.\nThis content is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.\nSee https://creativecommons.org/licenses/by-sa/4.0/.\n',
  item: [
    {
      linkId: '7dfe7c6a-ca7f-4ddf-9241-a7b918a9695a',
      text: 'Regular medications',
      type: 'group',
      repeats: false,
      item: [
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system:
                      'https://smartforms.csiro.au/ig/CodeSystem/QuestionnaireItemControlExtended',
                    code: 'context-display'
                  }
                ]
              }
            }
          ],
          linkId: 'CD-in-progress-23',
          text: 'In progress',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div title="In progress" xmlns="http://www.w3.org/1999/xhtml">\r\n\t<div style="display: flex; flex-direction: row;">\r\n\t\t<img width=\'24\' height=\'24\' src=\'data:image/svg+xml;base64,\r\n\t\tPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiM3NTc1NzUiIGQ9Im0xNS44NCAxMC4ybC0xLjAxIDEuMDFsLTIuMDctMi4wM2wxLjAxLTEuMDJjLjItLjIxLjU0LS4yMi43OCAwbDEuMjkgMS4yNWMuMjEuMjEuMjIuNTUgMCAuNzlNOCAxMy45MWw0LjE3LTQuMTlsMi4wNyAyLjA4bC00LjE2IDQuMkg4di0yLjA5TTEzIDJ2MmM0LjM5LjU0IDcuNSA0LjUzIDYuOTYgOC45MkE4LjAxNCA4LjAxNCAwIDAgMSAxMyAxOS44OHYyYzUuNS0uNiA5LjQ1LTUuNTQgOC44NS0xMS4wM0MyMS4zMyA2LjE5IDE3LjY2IDIuNSAxMyAybS0yIDBjLTEuOTYuMTgtMy44MS45NS01LjMzIDIuMkw3LjEgNS43NGMxLjEyLS45IDIuNDctMS40OCAzLjktMS42OHYtMk00LjI2IDUuNjdBOS44MSA5LjgxIDAgMCAwIDIuMDUgMTFoMmMuMTktMS40Mi43NS0yLjc3IDEuNjQtMy45TDQuMjYgNS42N00yLjA2IDEzYy4yIDEuOTYuOTcgMy44MSAyLjIxIDUuMzNsMS40Mi0xLjQzQTguMDAyIDguMDAyIDAgMCAxIDQuMDYgMTNoLTJtNSA1LjM3bC0xLjM5IDEuMzdBOS45OTQgOS45OTQgMCAwIDAgMTEgMjJ2LTJhOC4wMDIgOC4wMDIgMCAwIDEtMy45LTEuNjNoLS4wNFoiLz48L3N2Zz4=\' \r\n\t\tstyle="align-self: center;"/>\r\n\t</div>\r\n</div>'
              }
            ]
          },
          type: 'display',
          enableWhen: [
            {
              question: 'MarkComplete-23',
              operator: '!=',
              answerBoolean: true
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system:
                      'https://smartforms.csiro.au/ig/CodeSystem/QuestionnaireItemControlExtended',
                    code: 'context-display'
                  }
                ]
              }
            }
          ],
          linkId: 'CD-complete-23',
          text: 'Complete',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div title="Section completed" xmlns="http://www.w3.org/1999/xhtml">\r\n\t<div style="display: flex; flex-direction: row;">\r\n\t\t<img width=\'24\' height=\'24\' src=\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9IiMyZTdkMzIiIGQ9Ik0yMCAxMmE4IDggMCAwIDEtOCA4YTggOCAwIDAgMS04LThhOCA4IDAgMCAxIDgtOGMuNzYgMCAxLjUuMTEgMi4yLjMxbDEuNTctMS41N0E5LjgyMiA5LjgyMiAwIDAgMCAxMiAyQTEwIDEwIDAgMCAwIDIgMTJhMTAgMTAgMCAwIDAgMTAgMTBhMTAgMTAgMCAwIDAgMTAtMTBNNy45MSAxMC4wOEw2LjUgMTEuNUwxMSAxNkwyMSA2bC0xLjQxLTEuNDJMMTEgMTMuMTdsLTMuMDktMy4wOVoiLz48L3N2Zz4=\'\r\n\t\tstyle="align-self: center;"/>\r\n\t</div>\r\n</div>'
              }
            ]
          },
          type: 'display',
          enableWhen: [
            {
              question: 'MarkComplete-23',
              operator: '=',
              answerBoolean: true
            }
          ]
        },
        {
          linkId: 'regularmedications-instruction',
          text: 'Check medications are still required, appropriate dose, understanding of medication and adherence',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n      <em>Check medications are still required, appropriate dose, understanding of medication and adherence</em>\r\n    </div>'
              }
            ]
          },
          type: 'display'
        },
        {
          linkId: 'regularmedications-summary',
          text: 'Medication summary',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n<p>Medication summary</p>\r\n<p style="font-size:0.9em; font-weight:normal"><em>This section includes a list of existing items from the patient record. <br />Update these items here or update the patient record and repopulate the form. <br />Add new items at the bottom.</em></p>\r\n</div>'
              }
            ]
          },
          type: 'group',
          repeats: false,
          item: [
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-itemPopulationContext',
                  valueExpression: {
                    name: 'MedicationStatementRepeat',
                    language: 'text/fhirpath',
                    expression: '%MedicationStatement.entry.resource.ofType(MedicationStatement)'
                  }
                },
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
                  extension: [
                    {
                      url: 'template',
                      valueReference: {
                        reference: '#MedicationStatementPatchTemplate'
                      }
                    },
                    {
                      url: 'resourceId',
                      valueString: "item.where(linkId='medicationStatementId').answer.value"
                    },
                    {
                      url: 'type',
                      valueCode: 'MedicationStatement'
                    }
                  ]
                },
                {
                  url: 'https://smartforms.csiro.au/ig/StructureDefinition/GroupHideAddItemButton',
                  valueBoolean: true
                }
              ],
              linkId: 'regularmedications-summary-current',
              text: 'Current medications',
              _text: {
                extension: [
                  {
                    url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
                    valueBoolean: true
                  }
                ]
              },
              type: 'group',
              repeats: true,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                      valueBoolean: true
                    },
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.id'
                      }
                    }
                  ],
                  linkId: 'medicationStatementId',
                  type: 'string'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                      valueCodeableConcept: {
                        coding: [
                          {
                            system: 'http://hl7.org/fhir/questionnaire-item-control',
                            code: 'autocomplete'
                          }
                        ]
                      }
                    },
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression:
                          "iif(%MedicationStatementRepeat.medication.reference.replace('#', '') in %medicationsFromContained.id, %medicationsFromContained.where(id = %MedicationStatementRepeat.medication.reference.replace('#', '')).code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first()), iif(%MedicationStatementRepeat.medication.reference.replace('Medication/', '') in %medicationsFromRef.id , %medicationsFromRef.where(id = %MedicationStatementRepeat.medication.reference.replace('Medication/', '')).code.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first()) ,%MedicationStatementRepeat.medication.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())))"
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-medication',
                  text: 'Medication',
                  type: 'open-choice',
                  repeats: false,
                  readOnly: true,
                  answerValueSet: '#smart-health-checks-medicine-products'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.status'
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-status',
                  text: 'Status',
                  type: 'choice',
                  repeats: false,
                  answerValueSet: '#MedicationStatementStatusLimited'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.dosage.text'
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-dosage',
                  text: 'Dosage',
                  type: 'text',
                  repeats: false
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.dosage.text'
                      }
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                      valueBoolean: true
                    }
                  ],
                  linkId: 'regularmedications-summary-current-dosage-hidden',
                  type: 'text',
                  repeats: false
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                      valueCodeableConcept: {
                        coding: [
                          {
                            system: 'http://hl7.org/fhir/questionnaire-item-control',
                            code: 'autocomplete'
                          }
                        ]
                      }
                    },
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression:
                          "%MedicationStatementRepeat.reasonCode.select((coding.where(system='http://snomed.info/sct') | coding.where(system!='http://snomed.info/sct').first() | text ).first())"
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-reasoncode',
                  text: 'Clinical indication',
                  type: 'open-choice',
                  repeats: true,
                  readOnly: true,
                  answerValueSet: '#medication-reason-taken-1'
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.note.text'
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-current-comment',
                  text: 'Comment',
                  type: 'text',
                  repeats: false
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression',
                      valueExpression: {
                        language: 'text/fhirpath',
                        expression: '%MedicationStatementRepeat.note.text'
                      }
                    },
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-hidden',
                      valueBoolean: true
                    }
                  ],
                  linkId: 'regularmedications-summary-current-comment-hidden',
                  type: 'text',
                  repeats: false
                }
              ]
            },
            {
              extension: [
                {
                  url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-templateExtract',
                  extension: [
                    {
                      url: 'template',
                      valueReference: {
                        reference: '#MedicationStatementTemplate'
                      }
                    }
                  ]
                }
              ],
              linkId: 'regularmedications-summary-new',
              text: 'New medications',
              _text: {
                extension: [
                  {
                    url: 'https://smartforms.csiro.au/ig/StructureDefinition/QuestionnaireItemTextHidden',
                    valueBoolean: true
                  }
                ]
              },
              type: 'group',
              repeats: true,
              item: [
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                      valueCodeableConcept: {
                        coding: [
                          {
                            system: 'http://hl7.org/fhir/questionnaire-item-control',
                            code: 'autocomplete'
                          }
                        ]
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-new-medication',
                  text: 'Medication',
                  type: 'open-choice',
                  repeats: false,
                  answerValueSet: '#smart-health-checks-medicine-products'
                },
                {
                  linkId: 'regularmedications-summary-new-dosage',
                  text: 'Dosage',
                  type: 'text',
                  repeats: false
                },
                {
                  extension: [
                    {
                      url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                      valueCodeableConcept: {
                        coding: [
                          {
                            system: 'http://hl7.org/fhir/questionnaire-item-control',
                            code: 'autocomplete'
                          }
                        ]
                      }
                    }
                  ],
                  linkId: 'regularmedications-summary-new-reasoncode',
                  text: 'Clinical indication',
                  type: 'open-choice',
                  repeats: true,
                  answerValueSet: '#medication-reason-taken-1'
                },
                {
                  linkId: 'regularmedications-summary-new-comment',
                  text: 'Comment',
                  type: 'text',
                  repeats: false
                }
              ]
            }
          ]
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age <= 12'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'radio-button'
                  }
                ]
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation',
              valueCode: 'horizontal'
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Does your child take any regular medications?'
            }
          ],
          linkId: '6eb59145-ed9a-4184-af83-3506d47e4d4e',
          text: 'Does your child take any regular medications (prescribed, over-the-counter, traditional, complementary and alternative)?',
          type: 'choice',
          repeats: false,
          answerValueSet: '#YesNo'
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-enableWhenExpression',
              valueExpression: {
                language: 'text/fhirpath',
                expression: '%age > 12'
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
              valueCodeableConcept: {
                coding: [
                  {
                    system: 'http://hl7.org/fhir/questionnaire-item-control',
                    code: 'radio-button'
                  }
                ]
              }
            },
            {
              url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-choiceOrientation',
              valueCode: 'horizontal'
            },
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Do you take any regular medications?'
            }
          ],
          linkId: '3a2d27b6-e918-4df5-aca9-b374fcf9faad',
          text: 'Do you take any regular medications (prescribed, over-the-counter, traditional, complementary and alternative)?',
          type: 'choice',
          repeats: false,
          answerValueSet: '#YesNo'
        },
        {
          linkId: '874ec8db-95c9-4cc0-95db-e45edaa3cd12',
          text: 'Check the health record is up to date',
          type: 'boolean',
          repeats: false
        },
        {
          extension: [
            {
              url: 'http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-shortText',
              valueString: 'Understanding and adherence checked'
            }
          ],
          linkId: '36290837-ad70-48b2-9c66-31533fec918b',
          text: 'Check medication understanding and adherence with patient',
          type: 'boolean',
          enableWhen: [
            {
              question: '6eb59145-ed9a-4184-af83-3506d47e4d4e',
              operator: '=',
              answerCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0136',
                code: 'Y'
              }
            },
            {
              question: '3a2d27b6-e918-4df5-aca9-b374fcf9faad',
              operator: '=',
              answerCoding: {
                system: 'http://terminology.hl7.org/CodeSystem/v2-0136',
                code: 'Y'
              }
            }
          ],
          enableBehavior: 'any',
          repeats: false
        },
        {
          linkId: 'aa9ff2ed-bcd2-406d-a9ff-89c201df2605',
          text: 'Health priorities, actions and follow-up',
          type: 'text',
          repeats: false
        },
        {
          linkId: 'MarkComplete-23',
          text: 'Mark section as complete',
          _text: {
            extension: [
              {
                url: 'http://hl7.org/fhir/StructureDefinition/rendering-xhtml',
                valueString:
                  '<div xmlns="http://www.w3.org/1999/xhtml">\r\n<head>\r\n    <style type="text/css">\r\n        .alert {\r\n            padding: 0.875rem;\r\n            margin-bottom: 1rem;\r\n            font-size: 0.875rem;\r\n            color: #29712D;\r\n            border-radius: 0.5rem;\r\n            background-color: #D9E8DA;\r\n            font-weight: 700;\r\n        max-width: 205px;\r\n        }\r\n    </style>\r\n</head>\r\n<body>\r\n<div class="alert">Mark section as complete</div>\r\n</body>\r\n</div>'
              }
            ]
          },
          type: 'boolean',
          repeats: false
        }
      ]
    }
  ]
};

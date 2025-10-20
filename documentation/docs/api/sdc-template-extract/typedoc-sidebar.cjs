// @ts-check
/** @type {import("@docusaurus/plugin-content-docs").SidebarsConfig} */
const typedocSidebar = {
  items: [
    {
      type: "category",
      label: "Interfaces",
      items: [
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/CustomDebugInfoParameter",
          label: "CustomDebugInfoParameter"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/ExtractResult",
          label: "ExtractResult"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/FetchQuestionnaireCallback",
          label: "FetchQuestionnaireCallback"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/FetchQuestionnaireRequestConfig",
          label: "FetchQuestionnaireRequestConfig"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/FetchQuestionnaireResolver",
          label: "FetchQuestionnaireResolver"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/FhirPatchParameterEntry",
          label: "FhirPatchParameterEntry"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/FhirPatchParameters",
          label: "FhirPatchParameters"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/InAppExtractOutput",
          label: "InAppExtractOutput"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/InputParameters",
          label: "InputParameters"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/IssuesParameter",
          label: "IssuesParameter"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/OutputParameters",
          label: "OutputParameters"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/ReturnParameter",
          label: "ReturnParameter"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/TemplateExtractDebugInfo",
          label: "TemplateExtractDebugInfo"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/TemplateExtractPathJsObject",
          label: "TemplateExtractPathJsObject"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/interfaces/TemplateExtractValueEvaluation",
          label: "TemplateExtractValueEvaluation"
        }
      ]
    },
    {
      type: "category",
      label: "Type Aliases",
      items: [
        {
          type: "doc",
          id: "api/sdc-template-extract/type-aliases/QuestionnaireOrCallback",
          label: "QuestionnaireOrCallback"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/type-aliases/TemplateExtractPathJsObjectTuple",
          label: "TemplateExtractPathJsObjectTuple"
        }
      ]
    },
    {
      type: "category",
      label: "Functions",
      items: [
        {
          type: "doc",
          id: "api/sdc-template-extract/functions/canBeTemplateExtracted",
          label: "canBeTemplateExtracted"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/functions/createInputParameters",
          label: "createInputParameters"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/functions/extract",
          label: "extract"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/functions/extractResultIsOperationOutcome",
          label: "extractResultIsOperationOutcome"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/functions/inAppExtract",
          label: "inAppExtract"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/functions/logTemplateExtractPathMapFull",
          label: "logTemplateExtractPathMapFull"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/functions/logTemplateExtractPathMapJsObjectFull",
          label: "logTemplateExtractPathMapJsObjectFull"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/functions/logTemplateExtractPathMapJsObjectResults",
          label: "logTemplateExtractPathMapJsObjectResults"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/functions/logTemplateExtractPathMapResults",
          label: "logTemplateExtractPathMapResults"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/functions/objIsTemplateExtractDebugInfo",
          label: "objIsTemplateExtractDebugInfo"
        },
        {
          type: "doc",
          id: "api/sdc-template-extract/functions/parametersIsFhirPatch",
          label: "parametersIsFhirPatch"
        }
      ]
    }
  ]
};
module.exports = typedocSidebar.items;
// @ts-check
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const typedocSidebar = { items: [
  {
    "type": "category",
    "label": "Interfaces",
    "items": [
      {
        "type": "doc",
        "id": "api/sdc-assemble/interfaces/FetchQuestionnaireCallback",
        "label": "FetchQuestionnaireCallback"
      },
      {
        "type": "doc",
        "id": "api/sdc-assemble/interfaces/InputParameters",
        "label": "InputParameters"
      },
      {
        "type": "doc",
        "id": "api/sdc-assemble/interfaces/OutcomeParameter",
        "label": "OutcomeParameter"
      },
      {
        "type": "doc",
        "id": "api/sdc-assemble/interfaces/OutputParameters",
        "label": "OutputParameters"
      }
    ]
  },
  {
    "type": "category",
    "label": "Functions",
    "items": [
      {
        "type": "doc",
        "id": "api/sdc-assemble/functions/assemble",
        "label": "assemble"
      },
      {
        "type": "doc",
        "id": "api/sdc-assemble/functions/isInputParameters",
        "label": "isInputParameters"
      }
    ]
  }
]};
module.exports = typedocSidebar.items;
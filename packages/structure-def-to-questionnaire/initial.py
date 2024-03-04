def add_item_initial(item, element):
    if element.get("fixedUri") is not None and element.get("fixedUri") != "":
        item["initial"] = [{"valueString": element["fixedUri"]}]

    return item


def add_initial_expression(item, element, structure_definition_url=None):
    # skip adding initial expression if item has item.initial
    if item.get("initial") is not None:
        return item

    if item.get("extension", None) is None:
        item["extension"] = []

    initialExpressionString = ""
    if element["path"].startswith("Extension") and structure_definition_url is not None:
        preInitialExpressionExtensionString = (
            item["linkId"].lower().split("extension")[0].replace(":", ".") + "extension"
        )

        initialExpressionString = f"%{preInitialExpressionExtensionString}.where(url='{structure_definition_url}').value"
    else:
        initialExpressionString = f"%{item['linkId'].lower()}"

    item = add_display_instructions(item, initialExpressionString)

    item["extension"].append(
        {
            "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression",
            "valueExpression": {
                "language": "text/fhirpath",
                "expression": initialExpressionString,
            },
        }
    )

    return item


def add_display_instructions(item, displayInstructionString):
    if item.get("type") != "group":
        item["item"] = [
            {
                "extension": [
                    {
                        "url": "http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory",
                        "valueCodeableConcept": {
                            "coding": [
                                {
                                    "system": "http://hl7.org/fhir/questionnaire-display-category",
                                    "code": "instructions",
                                }
                            ]
                        },
                    }
                ],
                "linkId": f"{item['linkId']}-display-instructions",
                "text": displayInstructionString,
                "type": "display",
            }
        ]

    return item

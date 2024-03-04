import re


def get_path_segments(linkId):
    words = re.split(r"[^a-zA-Z0-9]+", linkId)

    return [word for word in words if word]


def get_snapshot_elements_dict(structure_definition):
    return dict(
        zip(
            [element["id"] for element in structure_definition["snapshot"]["element"]],
            structure_definition["snapshot"]["element"],
        )
    )


def add_launch_context_to_questionnaire(questionnaire, profile_resource_type):
    questionnaire["extension"] = [
        {
            "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-launchContext",
            "extension": [
                {
                    "url": "name",
                    "valueCoding": {
                        "system": "http://hl7.org/fhir/uv/sdc/CodeSystem/launchContext",
                        "code": profile_resource_type.lower(),
                    },
                },
                {"url": "type", "valueCode": profile_resource_type},
                {
                    "url": "description",
                    "valueString": f"The {profile_resource_type.lower()} that is to be used to pre-populate the form",
                },
            ],
        }
    ]

    return questionnaire


def get_element_name_without_resource(element, root_level=True):
    if root_level:
        return ".".join(element["id"].split(".")[1:])

    if ":" not in element["id"]:
        return element["id"]

    # if element is not at root level (i.e. it was further obtained via profile resolution), only use the last part of the id
    return element["id"].split(":")[1]

import json
from datetime import date
import platform
from complexItems import (
    create_item,
    create_address_item,
    create_period_item,
    create_human_name_item,
    create_contact_point_item,
    create_identifier_item,
)

from readTableElements import read_table_elements
from slotItemIntoQuestionnaire import slot_item_into_questionnaire
from helperFunctions import (
    get_snapshot_elements_dict,
    add_launch_context_to_questionnaire,
)

from removeEmptyItems import remove_empty_groups

import requests

if platform.system() == "Windows":
    # ANSI doesn't work on Windows
    HEADER = ""
    ERROR_RED = ""
    WARNING_YELLOW = ""
    OK_GREEN = ""
    INFO_BLUE = ""
    END_C = ""
else:
    # Define colors for console output
    HEADER = "\033[95m"
    ERROR_RED = "\033[91m"
    WARNING_YELLOW = "\033[93m"
    OK_GREEN = "\033[92m"
    INFO_BLUE = "\033[94m"
    END_C = "\033[0m"

profile_resource_type = None


def get_item_type(type_code, type_extension=None):
    if (
        type_code == "http://hl7.org/fhirpath/System.String"
        and type_extension is not None
    ):
        type_extension_value_url = type_extension[0]["valueUrl"]
        return type_extension_value_url

    if (
        type_code == "http://hl7.org/fhirpath/System.Date"
        and type_extension is not None
    ):
        type_extension_value_url = type_extension[0]["valueUrl"]
        return type_extension_value_url
        # add regex

    if (
        type_code == "http://hl7.org/fhirpath/System.Date"
        and type_extension is not None
    ):
        type_extension_value_url = type_extension[0]["valueUrl"]
        return type_extension_value_url
        # add regex

    # item.type=boolean
    if type_code == "boolean":
        return "boolean"

    # item.type=url
    if type_code == "uri":
        return "url"

    # item.type=date
    if type_code == "date":
        return "date"

    # item.type=dateTime
    if type_code == "dateTime":
        return "dateTime"

    # type=code or type=CodeableConcept
    if type_code == "code" or type_code == "CodeableConcept" or type_code == "Coding":
        return "choice"

    # type=Attachment
    if type_code == "Attachment":
        return "attachment"

    if type_code == "Reference":
        return "reference"

    # Complex type
    if (
        type_code == "Meta"
        or type_code == "Narrative"
        or type_code == "Resource"
        or type_code == "Extension"
        or type_code == "HumanName"
        or type_code == "Address"
        or type_code == "BackboneElement"
        or type_code == "ContactPoint"
        or type_code == "Period"
        or type_code == "Identifier"
    ):
        return "group"

    # defaults to item.type=string
    return "string"


def get_element_name_without_resource(element, root_level=True):
    if root_level:
        return ".".join(element["id"].split(".")[1:])

    if ":" not in element["id"]:
        return element["id"]

    # if element is not at root level (i.e. it was further obtained via profile resolution), only use the last part of the id
    return element["id"].split(":")[1]


def get_profile_link(profile_links, root_level=True):
    if root_level:
        return profile_links[0]

    # not root level, resolve via appending profie name to end of base url (hardcoded)
    temp_link = None
    for link in profile_links:
        if "datatype" in link:
            continue

        if "extension" in link:
            return link

        if "StructureDefinition" in link:
            try:
                # Split the URL by "StructureDefinition-" and ".html"
                part = link.split("StructureDefinition-")[1].split(".html")[0]
                return (
                    "https://build.fhir.org/ig/hl7au/au-fhir-base/StructureDefinition-"
                    + part
                    + ".json"
                )
            except IndexError:
                print("Fail to get profile link ", link)
                return None

    return temp_link


def get_profile_definition(profile_link):
    if ".html" in profile_link:
        profile_link = profile_link.replace(".html", ".json")

    try:
        response = requests.get(profile_link, timeout=10)
        response.raise_for_status()
        # Check the response status code
        if str(response.status_code) == "200":
            res = response.json()

            print(
                f"{OK_GREEN}GET request successful at {profile_link}: {response.status_code} OK{END_C}"
            )
        else:
            print(
                f"{ERROR_RED}ERROR: GET request failed at {profile_link}: {response.status_code} ERR{END_C}"
            )

        return res

    except requests.exceptions.HTTPError as e:
        print(f"{ERROR_RED}ERROR: HTTP ERROR THROWN:{END_C}", e, "\n")
        print(profile_link)
    except Exception as e:
        print(f"{ERROR_RED}ERROR: An error occurred, details:", e, "\n")

    return None


def process_item_by_code(item, element):
    if "code" in element["type"][0]:
        code = element["type"][0]["code"]

        # if element["id"] == "communication":

        if code == "Address":
            return create_address_item(element, item)

        if code == "Period":
            return create_period_item(element, item)

        if code == "HumanName":
            return create_human_name_item(element, item)

        if code == "ContactPoint":
            return create_contact_point_item(element, item)

        if code == "Identifier":
            return create_identifier_item(element, item)

    return item


def process_complex_types(item, element, table_elements, root_level=True):
    item["item"] = []

    if "profile" in element["type"][0]:
        element_name = get_element_name_without_resource(element, root_level)

        if element_name not in table_elements:
            return item

        element_profile = table_elements[element_name]

        profile_links = [
            link for link in list(element_profile.values()) if link.startswith("http")
        ]

        # Get the first profile link
        profile_link = get_profile_link(profile_links, root_level)
        profile_definition = get_profile_definition(profile_link)
        if profile_definition is None:
            return item

        # get table elements
        child_table_elements = read_table_elements(profile_definition)

        transformed_elements = transform_elements(
            profile_definition,
            child_table_elements,
            parent_link_id=item["linkId"],
            root_level=False,
        )

        item["item"] = transformed_elements

        return item

    # Not a profile, process "code"
    return process_item_by_code(item, element)


def add_initial_expression(item, element):
    if item.get("extension") is None:
        item["extension"] = []

    initialExpressionString = ""
    if "profile" in element["type"][0]:
        initialExpressionString = f"%{element['path'].lower()}.where(url='{element['type'][0]['profile'][0]}').value"
    elif "fixedUri" in element:
        initialExpressionString = (
            f"%{element['path'].lower()}.where(url='{element['fixedUri']}').value"
        )
    else:
        initialExpressionString = f"%{item['linkId'].lower()}"

    initialExpressionString = initialExpressionString.replace(":", ".")

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
                "text": initialExpressionString,
                "type": "display",
            }
        ]

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


def transform_element(
    element,
    table_elements,
    parent_link_id=None,
    root_level=True,
):
    item = create_item(element, parent_link_id)

    # multiple types
    if len(element["type"]) > 1:
        item["type"] = "group"
        item["item"] = []
        # add the types to the group as items
    else:
        if "code" not in element["type"][0]:
            return None

        type_code = element["type"][0]["code"]
        item_type = get_item_type(type_code)
        item["type"] = item_type

        # Rename ids ending with value[x]
        if "value[x]" in item["linkId"]:
            modified_id = item["linkId"].replace(
                "value[x]", "value" + element["type"][0]["code"].capitalize()
            )
            item["linkId"] = modified_id
            item["text"] = modified_id

        # Complex type
        if item_type == "group":
            item = process_complex_types(item, element, table_elements, root_level)

        # convert id to string
        if item_type == "id":
            item["type"] = "string"

        # if present, add answerValueSet to choice items
        if item_type == "choice":
            # answerValueSet
            if "valueSet" in element.get("binding", {}):
                item["answerValueSet"] = element["binding"]["valueSet"]

        # add initialExpression
        item = add_initial_expression(item, element)

    return item


def transform_elements(
    structure_definition,
    table_elements,
    parent_link_id="",
    root_level=True,
):
    snapshot_elements_dict = get_snapshot_elements_dict(structure_definition)

    q_items = []
    for element in structure_definition["differential"]["element"]:
        element_id = element["id"]
        element = snapshot_elements_dict[element_id]

        # skip elements without an id or type
        if id is None or element.get("type") is None:
            continue

        # if mustSupportFlag is True, skip non-must have elements
        if root_level == True and element.get("mustSupport", False) is False:
            continue

        # transform element into item
        item = transform_element(element, table_elements, parent_link_id, root_level)

        # Slot item into questionnaire if it is the root level
        if root_level == True:
            q_items = slot_item_into_questionnaire(element, item, q_items)
        else:
            q_items.append(item)

    return q_items


def create_questionnaire(
    structure_definition, table_elements, questionnaire_id, questionnaire_title
):
    resource_type = structure_definition.get("resourceType", None)
    if resource_type != "StructureDefinition":
        return None

    questionnaire = {
        "resourceType": "Questionnaire",
        "status": "active",
        "date": date.today().strftime("%Y-%m-%d"),
        "item": [],
    }

    questionnaire["id"] = questionnaire_id
    questionnaire["title"] = questionnaire_title
    questionnaire = add_launch_context_to_questionnaire(
        questionnaire, structure_definition["type"]
    )

    # recursively process elements at the root-level
    questionnaire["item"] = transform_elements(
        structure_definition, table_elements, parent_link_id="", root_level=True
    )

    # recursively remove empty groups
    questionnaire["item"] = remove_empty_groups(questionnaire["item"])

    return questionnaire


if __name__ == "__main__":
    structure_definition_file = "./input/StructureDefinition-au-core-patient.json"
    questionnaire_id = "AuCorePatient"
    questionnaire_title = "AU Core Patient Test Questionnaire"

    with open(structure_definition_file, "r") as file:
        structure_definition = json.load(file)

        table_elements = read_table_elements(structure_definition)

        questionnaire = create_questionnaire(
            structure_definition, table_elements, questionnaire_id, questionnaire_title
        )

        with open("./output/generated_questionnaire.json", "w") as file:
            json.dump(questionnaire, file, indent=2)

import json
from datetime import date
import platform
from transformDatatypes import (
    create_item,
    create_address_item,
    create_period_item,
    create_human_name_item,
    create_contact_point_item,
)

from bs4 import BeautifulSoup

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


def slot_item_into_qitems(element, item, q_items, previous_element):
    # If id ends with extension, don't append. If the extension item is needed it will be added later when there are child items
    if element["id"].endswith("extension"):
        return q_items

    # If the element id is the same as the path, append the item to q_items
    if element["id"] == element["path"]:
        q_items.append(item)
        return q_items

    # Find the parent item in q_items and append the item to it
    parent_item_id = ""
    if ":" in element["id"]:
        parent_item_id = element["id"].split(":")[0]
    elif "." in element["id"]:
        parent_item_id = element["id"].split(".")[:-1]

    print(parent_item_id)
    print()
    for q_item in q_items:
        if q_item["linkId"] == parent_item_id:
            q_item["item"].append(item)
            return q_items

    # Parent item id does not exist in q_items yet, possibly due to not having a mustSupport element
    # Create a new parent item and append the item to it
    parent_item = create_item(previous_element)
    parent_item["type"] = "group"
    parent_item["item"] = [item]
    q_items.append(parent_item)

    return q_items


def get_element_name_without_resource(element, root_level=False):
    if root_level:
        return ".".join(element["id"].split(".")[1:])

    if ":" not in element["id"]:
        return element["id"]

    # if element is not at root level (i.e. it was further obtained via profile resolution), only use the last part of the id
    print(element["id"])
    return element["id"].split(":")[1]


def get_profile_link(profile_links, element_name, root_level=False):
    if root_level:
        return profile_links[0]

    # not root level, resolve via appending profie name to end of base url (hardcoded)
    temp_link = None
    for link in profile_links:
        if "extension" in link:
            return link

        #     return "https://build.fhir.org/ig/hl7au/au-fhir-base/e"
        if "StructureDefinition" in link:
            print(link)
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
    except Exception as e:
        print(f"{ERROR_RED}ERROR: An error occurred, details:", e, "\n")

    return None


def process_item_by_code(item, element):
    if "code" in element["type"][0]:
        code = element["type"][0]["code"]

        if element["id"] == "communication":


        if code == "Address":
            return create_address_item(element, item)

        if code == "Period":
            return create_period_item(element, item)

        if code == "HumanName":
            return create_human_name_item(element, item)

        if code == "ContactPoint":
            return create_contact_point_item(element, item)

    return item


def process_complex_types(item, element, table_elements, root_level=False):
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
        profile_link = get_profile_link(profile_links, element_name)

        profile_definition = get_profile_definition(profile_link)
        if profile_definition is None:
            return item

        # get profile elements
        child_table_elements = {}
        if profile_definition.get("text", {}).get("div") is not None:
            child_table_elements = get_table_elements(profile_definition["text"]["div"])

        item["item"] = process_elements(profile_definition, child_table_elements)

        return item

    # Not a profile, process "code"
    return process_item_by_code(item, element)


def create_item(element):
    item = {
        "linkId": element["id"],
        "text": element["id"],
        "type": "string",
        "required": False,
        "repeats": False,
    }

    # required
    if element.get("min", 0) > 0:
        item["required"] = True

    # repeats
    if element.get("max", 0) == "*":
        item["repeats"] = True

    return item


def add_initial_expression_with_profile(item, element):
    if item.get("extension") is None:
        item["extension"] = []

    initialExpression = {
        "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression",
        "valueExpression": {
            "language": "text/fhirpath",
            "expression": f"%{element.get('path').lower()}",
        },
    }

    item["extension"].append(initialExpression)

    return item


def add_initial_expression(item, element):
    if item.get("extension") is None:
        item["extension"] = []

    if "profile" in element["type"][0]:
        initialExpression = {
            "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression",
            "valueExpression": {
                "language": "text/fhirpath",
                "expression": f"%{element['path'].lower()}.where(url='{element['type'][0]['profile'][0]}').value",
            },
        }
        print("initialExpression 1st")
        print(initialExpression)
        print()
    else:
        initialExpression = {
            "url": "http://hl7.org/fhir/uv/sdc/StructureDefinition/sdc-questionnaire-initialExpression",
            "valueExpression": {
                "language": "text/fhirpath",
                "expression": f"%{element.get('path').lower()}",
            },
        }

        print("initialExpression 2nd")
        print(initialExpression)
        print()

    item["extension"].append(initialExpression)

    return item


def process_element(element, table_elements, root_level=False):
    item = create_item(element)

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
        if "value[x]" in element["id"]:
            modified_id = element["id"].replace(
                "value[x]", "value" + item_type.capitalize()
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


def process_elements(profile_definition, table_elements, root_level=False):
    q_items = []
    previous_element = None
    for element in profile_definition["snapshot"]["element"]:

        # skip elements without an id or type
        if element.get("id") is None or element.get("type") is None:
            previous_element = element
            continue

        # if mustSupportFlag is True, skip non-must have elements
        if root_level and element.get("mustSupport", False) is False:
            previous_element = element
            continue

        item = process_element(element, table_elements, root_level)

        # determine path to place item
        q_items = slot_item_into_qitems(element, item, q_items, previous_element)
        previous_element = element

    return q_items


def create_questionnaire(structure_definition, table_elements):
    resource_type = structure_definition.get("resourceType", None)
    if resource_type != "StructureDefinition":
        return None

    today = date.today().strftime("%Y-%m-%d")
    questionnaire = {
        "resourceType": "Questionnaire",
        "status": "active",
        "date": today,
        "item": [],
    }

    questionnaire["item"] = process_elements(
        structure_definition, table_elements, root_level=True
    )

    # add LaunchContext
    profile_resource_type = structure_definition["type"]
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


def html_string_to_html(html_string):
    return BeautifulSoup(html_string, "html.parser")


def get_table_elements(text_div):
    # Find all table rows, skipping the header row and final row
    soup = BeautifulSoup(text_div, "html.parser")
    rows = soup.find_all("tr")[1:-1]

    # Create a list of dictionaries, each containing the element name and a dictionary of element names and URLs
    table_elements = {}
    previous_element = ""
    for row in rows:
        # Find all <a> tags within the row
        a_tags = row.find_all("a")

        # Get element name
        a_tag_element_name = a_tags[0].text.strip()
        if a_tag_element_name.startswith("extension") and previous_element != "":
            a_tag_element_name = previous_element + "." + a_tag_element_name

        # Create a dictionary of element names and URLs
        a_tags_dict = {
            a_tag.text.strip(): a_tag.get("href")
            for a_tag in a_tags
            if a_tag.text.strip() != "" or a_tag.get("href") is not None
        }

        # Set the previous element to the current element to recognise the next potential extension's parent
        if (
            "extension" not in a_tag_element_name
            and not a_tag_element_name[0].isupper()
        ):
            previous_element = a_tag_element_name

        # Add profile element
        if not all(key[0].isupper() for key in a_tags_dict.keys()):
            table_elements[a_tag_element_name] = a_tags_dict

    return table_elements


if __name__ == "__main__":
    # Replace 'your_directory_path' with the path to the directory containing JSON files
    structure_definition_file = "./input/StructureDefinition-au-core-patient.json"

    with open(structure_definition_file, "r") as file:
        structure_definition = json.load(file)

        profile_elements = {}
        if structure_definition.get("text", {}).get("div") is not None:
            table_elements = get_table_elements(structure_definition["text"]["div"])

        for el in table_elements:
            print(el, table_elements[el])
        print("_______________________________")

        questionnaire = create_questionnaire(structure_definition, table_elements)

        with open("./output/generated_questionnaire.json", "w") as file:
            json.dump(questionnaire, file, indent=2)

    #     questionnaire = create_questionnaire(struc_def_json)

    #     with open("./generated_questionnaire.json", "w") as file:
    #         json.dump(questionnaire, file, indent=2)

    # resolve_profile("http://hl7.org/fhir/StructureDefinition/patient-birthPlace")

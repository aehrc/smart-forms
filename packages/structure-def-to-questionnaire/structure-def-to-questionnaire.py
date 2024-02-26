import json
from datetime import date
import platform
from transformDatatypes import create_item, create_address_item

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

    # item.type=date
    if type_code == "date":
        return "datetime"

    # type=code or type=CodeableConcept
    if type_code == "code" or type_code == "CodeableConcept":
        return "choice"

    # type=Attachment
    if type_code == "Attachment":
        return "attachment"

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
        or type_code == "Reference"
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
    parent_item_id = element["id"].split(":")[0]
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


# def resolve_profile(profile_string):
#     try:
#         response = requests.get(profile_string, headers=header)
#         print(response)
#         print(response.status_code, response.headers["location"])
#         response.raise_for_status()
#         # print(response.json())

#         # Check the response status code
#         if str(response.status_code) == "200":
#             # Extract the bundle from the response
#             print(response.json())

#             # Append the bundle to the list of all bundles
#             # all_bundles.append(bundle)
#             print(f"{OK_GREEN}{END_C}")
#         else:
#             print(f"{ERROR_RED}{END_C}")

#     except requests.exceptions.HTTPError as e:
#         print(f"{ERROR_RED}ERROR: HTTP ERROR THROWN:{END_C}", e, "\n")
#     except Exception as e:
#         print(f"{ERROR_RED}ERROR: An error occurred, details:", e, "\n")


def get_element_name_without_resource(element):
    return ".".join(element["id"].split(".")[1:])


def get_profile_definition(profile_link, encoding="utf-8"):
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


def process_complex_types(item, element, profile_elements):
    item["item"] = []

    if "profile" in element["type"][0]:
        element_name = get_element_name_without_resource(element)

        if element_name not in profile_elements:
            return item

        element_profile = profile_elements[element_name]
        profile_links = [
            link for link in list(element_profile.values()) if link.startswith("http")
        ]

        # Get the first profile link
        profile_link = profile_links[0]

        # TODO work on visiting the profile link then extract the structure and form it into a questionnaire item
        # TODO can potentially use a recursive

        profile_definition = get_profile_definition(profile_link)

        if profile_definition is None:
            return item

        item["item"] = process_profile_elements(profile_definition, profile_elements)

        print()
        return item

    if "code" in element["type"][0]:
        if element["type"][0]["code"] == "Address":
            return create_address_item(element, item)

    return item


def process_profile_elements(
    profile_definition, profile_elements, mustSupportFlag=False
):
    q_items = []
    previous_element = None
    for element in profile_definition["snapshot"]["element"]:

        # skip elements without an id or type
        if element.get("id") is None or element.get("type") is None:
            previous_element = element
            continue

        # if mustSupportFlag is True, skip non-must have elements
        if mustSupportFlag and element.get("mustSupport", False) is False:
            previous_element = element
            continue

        item = process_profile_element(element, profile_elements)

        # determine path to place item
        q_items = slot_item_into_qitems(element, item, q_items, previous_element)
        previous_element = element

    return q_items


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


def process_profile_element(element, profile_elements):
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

        # Complex type
        if item_type == "group":
            item = process_complex_types(item, element, profile_elements)

        # convert id to string
        if item_type == "id":
            item["type"] = "string"

        # if present, add answerValueSet to choice items
        if item_type == "choice":
            # answerValueSet
            if "valueSet" in element.get("binding", {}):
                item["answerValueSet"] = element["binding"]["valueSet"]

    return item


def create_questionnaire(structure_definition, profile_elements):
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

    questionnaire["item"] = process_profile_elements(
        structure_definition, profile_elements, mustSupportFlag=True
    )

    return questionnaire


def html_string_to_html(html_string):
    return BeautifulSoup(html_string, "html.parser")


def get_profile_elements_from_table(text_div):
    # Find all table rows, skipping the header row and final row
    soup = BeautifulSoup(text_div, "html.parser")
    rows = soup.find_all("tr")[1:-1]

    # Create a list of dictionaries, each containing the element name and a dictionary of element names and URLs
    profile_elements = {}
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
            profile_elements[a_tag_element_name] = a_tags_dict

    return profile_elements


if __name__ == "__main__":
    # Replace 'your_directory_path' with the path to the directory containing JSON files
    struc_def_file = "./input/StructureDefinition-au-core-patient.json"

    with open(struc_def_file, "r") as file:
        struc_def_json = json.load(file)

        if struc_def_json.get("text", {}).get("div") is not None:
            profile_elements = get_profile_elements_from_table(
                struc_def_json["text"]["div"]
            )

            for item in profile_elements:
                print(item, profile_elements[item])
            print(len(profile_elements))

            questionnaire = create_questionnaire(struc_def_json, profile_elements)

            with open("./output/generated_questionnaire.json", "w") as file:
                json.dump(questionnaire, file, indent=2)

    #     questionnaire = create_questionnaire(struc_def_json)

    #     with open("./generated_questionnaire.json", "w") as file:
    #         json.dump(questionnaire, file, indent=2)

    # resolve_profile("http://hl7.org/fhir/StructureDefinition/patient-birthPlace")

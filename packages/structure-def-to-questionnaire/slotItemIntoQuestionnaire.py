import json
import platform
from helperFunctions import get_path_segments


def create_new_item_name(parent_link_id, first_segment):
    if parent_link_id == "":
        return first_segment

    if parent_link_id.endswith("extension"):
        return f"{parent_link_id}:{first_segment}"

    return f"{parent_link_id}.{first_segment}"


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


def create_group_item_and_slot_recursive(
    element, item, target_path, parent_link_id, q_items
):
    # seems like we need to compare the parent_link_id to the first segment of the target path
    target_path_segments = get_path_segments(target_path)

    # Base case, we have reached the end of the target path - append item to this group
    if len(target_path_segments) == 1:
        q_items.append(item)
        return q_items

    first_segment = target_path_segments[0]
    remaining_target_path = target_path.replace(first_segment, "", 1).lstrip(".:")
    print(
        f"{INFO_BLUE}enter recursive function - {first_segment}, {remaining_target_path}{END_C}"
    )

    # if group doesnt exist, create it
    new_item_name = create_new_item_name(parent_link_id, first_segment)

    print()
    print(
        f"Checking... {item['linkId']} == {first_segment}, New item name: {new_item_name}, List: {[q_item['linkId'] for q_item in q_items]}"
    )  # figure out a way to append the previous item linkId to the current linkId
    if new_item_name not in [q_item["linkId"] for q_item in q_items]:
        print(
            f"group doesn't exist, append new item {WARNING_YELLOW}{new_item_name}{END_C}"
        )  # figure out a way to append the previous item linkId to the current linkId
        new_item = {
            "linkId": new_item_name,
            "text": new_item_name,
            "type": "group",
            "item": [],
        }

        new_item["item"] = create_group_item_and_slot_recursive(
            element, item, remaining_target_path, new_item_name, new_item["item"]
        )

        q_items.append(new_item)
        return q_items

    # Group exists
    print(
        f"group exist, look for q_item {INFO_BLUE}{new_item_name}{END_C}"
    )  # figure out a way to append the previous item linkId to the current linkId
    for q_item in q_items:
        # We are on the correct path, slot in the item
        if q_item["linkId"] == item["linkId"]:
            if q_item["item"] is None:
                q_item["item"] = [item]
            else:
                q_item["item"].append(item)
            return q_items

        if q_item["linkId"] == new_item_name:
            if q_item["item"] is None:
                q_item["item"] = []

            # continue traversing
            print(f"group exists, traversing {q_item['linkId']}")
            q_item["item"] = create_group_item_and_slot_recursive(
                element, item, remaining_target_path, q_item["linkId"], q_item["item"]
            )
            return q_items

    # First segment (Patient) is not in items, create a new one and append it to q_items
    new_item = {"linkId": new_item_name, "text": new_item_name, "item": []}
    new_item["item"] = create_group_item_and_slot_recursive(
        element, item, remaining_target_path, new_item_name, new_item["item"]
    )

    q_items.append(new_item)

    return q_items


def slot_item_into_questionnaire(element, item, q_items):
    # target path item not found in q_items, recursively create groups and slot in item
    q_items = create_group_item_and_slot_recursive(
        element, item, target_path=item["linkId"], parent_link_id="", q_items=q_items
    )

    return q_items

def remove_empty_groups(q_items):
    new_q_items = []
    for q_item in q_items:
        q_item = remove_empty_groups_recursive(q_item)

        if q_item["item"] is not None:
            new_q_items.append(q_item)

    return new_q_items


def remove_empty_groups_recursive(q_item):
    if q_item.get("item", None) is None:
        return q_item

    if len(q_item["item"]) == 0 and q_item["type"] == "group":
        return None

    child_q_items = q_item["item"]

    new_q_items = []
    for child_q_item in child_q_items:
        new_child_q_item = remove_empty_groups_recursive(child_q_item)
        if new_child_q_item is not None:
            new_q_items.append(new_child_q_item)

    q_item["item"] = new_q_items

    return q_item

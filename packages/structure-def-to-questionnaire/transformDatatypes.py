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


def create_address_item(element, item):
    item["type"] = "group"

    item["item"] = [
        {
            "linkId": f"{element['id']}.use",
            "text": "Address.use",
            "type": "choice",
            "required": "false",
            "repeats": "false",
            "answerValueSet": "http://hl7.org/fhir/ValueSet/address-use|4.0.1",
        },
        {
            "linkId": f"{element['id']}.type",
            "text": "Address.type",
            "type": "choice",
            "required": False,
            "repeats": False,
            "answerValueSet": "http://hl7.org/fhir/ValueSet/address-type|4.0.1",
        },
        {
            "linkId": f"{element['id']}.text",
            "text": "Address.text",
            "type": "string",
            "required": False,
            "repeats": False,
        },
        {
            "linkId": f"{element['id']}.line",
            "text": "Address.line",
            "type": "string",
            "required": False,
            "repeats": True,
        },
        {
            "linkId": f"{element['id']}.city",
            "text": "Address.city",
            "type": "string",
            "required": False,
            "repeats": False,
        },
        {
            "linkId": f"{element['id']}.district",
            "text": "Address.district",
            "type": "string",
            "required": False,
            "repeats": False,
        },
        {
            "linkId": f"{element['id']}.state",
            "text": "Address.state",
            "type": "string",
            "required": False,
            "repeats": False,
        },
        {
            "linkId": f"{element['id']}.postalCode",
            "text": "Address.postalCode",
            "type": "string",
            "required": False,
            "repeats": False,
        },
        {
            "linkId": f"{element['id']}.country",
            "text": "Address.country",
            "type": "string",
            "required": False,
            "repeats": False,
        },
        {
            "linkId": f"{element['id']}.period",
            "text": "Address.period",
            "type": "group",
            "required": False,
            "repeats": False,
            "item": [],
        },
    ]

    return item

def create_item(element, parent_link_id=None):
    link_id = element["id"]

    if link_id.startswith("Extension"):
        link_id = parent_link_id + link_id.replace("Extension", "")

    item = {
        "linkId": link_id,
        "text": link_id,
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
    if item["type"] == "group":
        period_item = {
            "linkId": f"{element['id']}.period",
            "text": "Address.period",
            "type": "group",
            "required": False,
            "repeats": False,
        }
        period_item = create_period_item(element, period_item)

        item["item"] = [
            {
                "linkId": f"{element['id']}.use",
                "text": "Address.use",
                "type": "choice",
                "required": False,
                "repeats": False,
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
            period_item,
        ]

    return item


def create_period_item(element, item):
    if item["type"] == "group":
        item["item"] = [
            {
                "linkId": f"{element['id']}.start",
                "text": "Period.start",
                "type": "dateTime",
                "required": False,
                "repeats": False,
            },
            {
                "linkId": f"{element['id']}.end",
                "text": "Period.end",
                "type": "dateTime",
                "required": False,
                "repeats": False,
            },
        ]

    return item


def create_human_name_item(element, item):
    if item["type"] == "group":

        period_item = {
            "linkId": f"{element['id']}.period",
            "text": "HumanName.period",
            "type": "group",
            "required": False,
            "repeats": False,
        }
        period_item = create_period_item(element, period_item)

        item["item"] = [
            {
                "linkId": f"{element['id']}.use",
                "text": "HumanName.use",
                "type": "choice",
                "required": False,
                "repeats": False,
                "answerValueSet": "http://hl7.org/fhir/ValueSet/name-use|4.0.1",
            },
            {
                "linkId": f"{element['id']}.text",
                "text": "HumanName.text",
                "type": "string",
                "required": False,
                "repeats": False,
            },
            {
                "linkId": f"{element['id']}.family",
                "text": "HumanName.family",
                "type": "string",
                "required": False,
                "repeats": True,
            },
            {
                "linkId": f"{element['id']}.given",
                "text": "HumanName.given",
                "type": "string",
                "required": False,
                "repeats": True,
            },
            {
                "linkId": f"{element['id']}.prefix",
                "text": "HumanName.prefix",
                "type": "string",
                "required": False,
                "repeats": True,
            },
            {
                "linkId": f"{element['id']}.suffix",
                "text": "HumanName.suffix",
                "type": "string",
                "required": False,
                "repeats": True,
            },
            period_item,
        ]

    return item


def create_contact_point_item(element, item):
    if item["type"] == "group":

        period_item = {
            "linkId": f"{element['id']}.period",
            "text": "ContactPoint.period",
            "type": "group",
            "required": False,
            "repeats": False,
        }
        period_item = create_period_item(element, period_item)

        item["item"] = [
            {
                "linkId": f"{element['id']}.system",
                "text": "ContactPoint.system",
                "type": "choice",
                "required": False,
                "repeats": False,
                "answerValueSet": "http://hl7.org/fhir/ValueSet/contact-point-system|4.0.1",
            },
            {
                "linkId": f"{element['id']}.value",
                "text": "ContactPoint.value",
                "type": "string",
                "required": False,
                "repeats": False,
            },
            {
                "linkId": f"{element['id']}.use",
                "text": "ContactPoint.use",
                "type": "choice",
                "required": False,
                "repeats": False,
                "answerValueSet": "http://hl7.org/fhir/ValueSet/contact-point-use|4.0.1",
            },
            {
                "linkId": f"{element['id']}.rank",
                "text": "ContactPoint.rank",
                "type": "integer",
                "required": False,
                "repeats": False,
                "extension": [
                    {
                        "url": "http://hl7.org/fhir/StructureDefinition/minValue",
                        "valueInteger": 1,
                    }
                ],
            },
            period_item,
        ]

    return item


def create_identifier_item(element, item):
    if item["type"] == "group":

        codeable_concept_item = {
            "linkId": f"{element['id']}.type",
            "text": "Identifier.type",
            "type": "group",
            "required": False,
            "repeats": False,
        }
        codeable_concept_item = create_codeable_concept_item(
            element,
            codeable_concept_item,
            "http://hl7.org/fhir/ValueSet/identifier-type|4.0.1",
        )

        period_item = {
            "linkId": f"{element['id']}.period",
            "text": "ContactPoint.period",
            "type": "group",
            "required": False,
            "repeats": False,
        }
        period_item = create_period_item(element, period_item)

        item["item"] = [
            {
                "linkId": f"{element['id']}.use",
                "text": "Identifier.use",
                "type": "choice",
                "required": False,
                "repeats": False,
                "answerValueSet": "http://hl7.org/fhir/ValueSet/identifier-use|4.0.1",
            },
            codeable_concept_item,
            {
                "linkId": f"{element['id']}.system",
                "text": "Identifier.system",
                "type": "uri",
                "required": False,
                "repeats": False,
            },
            {
                "linkId": f"{element['id']}.value",
                "text": "Identifier.value",
                "type": "string",
                "required": False,
                "repeats": False,
            },
            period_item,
            {
                "linkId": f"{element['id']}.assigner",
                "text": "Identifier.assigner",
                "type": "reference",
                "required": False,
                "repeats": False,
            },
        ]

    return item


def create_codeable_concept_item(element, item, value_set_url):
    if item["type"] == "group":
        item["item"] = [
            {
                "linkId": f"{element['id']}.coding",
                "text": "CodeableConcept.coding",
                "type": "choice",
                "required": False,
                "repeats": True,
                "answerValueSet": value_set_url,
            },
            {
                "linkId": f"{element['id']}.text",
                "text": "CodeableConcept.text",
                "type": "string",
                "required": False,
                "repeats": False,
            },
        ]

    return item

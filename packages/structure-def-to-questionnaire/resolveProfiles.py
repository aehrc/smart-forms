import re


def get_all_profile_links(table_element):
    profile_links = []
    # get links with 'http' in them
    for value_i in table_element.values():
        for value_j in value_i.values():
            if value_j is not None and "http" in value_j:
                if value_j.startswith("http"):
                    profile_links.append(value_j)
                else:
                    profile_links.append("http" + value_j.split("http")[-1])

    # clean links that does not start with 'http'
    return profile_links


def get_first_profile_link(table_element):
    # retrieve links from table element
    profile_links = get_all_profile_links(table_element)

    # not root level, resolve via appending profie name to end of base url (hardcoded)
    for link in profile_links:
        if "extension" in link:
            return link

        if "StructureDefinition" in link:
            try:
                # Split the URL by "StructureDefinition-" and ".html"
                re_match = re.search(
                    r"(?:StructureDefinition[/\-])(.*?)(?:\.html|\/|$)", link
                )
                if re_match:
                    profile_name = re_match.group(1)

                    return (
                        "https://build.fhir.org/ig/hl7au/au-fhir-base/StructureDefinition-"
                        + profile_name
                        + ".json"
                    )

                print("Fail to get profile link ", link)
                return None
            except IndexError:
                print("Fail to get profile link ", link)
                return None

    return None


def is_value_set_link(key, value):
    if key in value and value[key] is not None and "ValueSet" in value[key]:
        return True

    return False


def get_all_valueset_links(table_element):
    profile_links = []
    for value in table_element.values():
        if is_value_set_link(key="title", value=value):
            profile_links.append(value["title"])
        elif is_value_set_link(key="href", value=value):
            profile_links.append(value["href"])

    return profile_links


def get_coding_terminology_binding(table_element):
    if "Coding" in table_element:
        valueset_links = get_all_valueset_links(table_element)

        if len(valueset_links) > 0:
            return valueset_links[0]

    return None

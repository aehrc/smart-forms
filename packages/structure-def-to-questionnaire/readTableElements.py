from bs4 import BeautifulSoup


def read_table_elements(structure_definition):
    table_elements = {}
    if structure_definition.get("text", {}).get("div") is None:
        return {}

    # Find all table rows, skipping the header row and final row
    soup = BeautifulSoup(structure_definition["text"]["div"], "html.parser")
    rows = soup.find_all("tr")[1:-1]

    # Create a list of dictionaries, each containing the element name and a dictionary of element names and URLs
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

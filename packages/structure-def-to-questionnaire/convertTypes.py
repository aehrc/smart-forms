# Convert structure definition type codes to appropriate questionnaire item types
def convert_to_appropriate_type(item_type):
    # convert id to string
    if item_type == "id":
        return "string"

    # convert uri to url
    if item_type == "uri":
        return "url"

    return item_type

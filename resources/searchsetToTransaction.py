#  Copyright 2023 Commonwealth Scientific and Industrial Research
#  Organisation (CSIRO) ABN 41 687 119 230.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

import json

def get_resources_from_searchset(searchset_filename):
    with open(searchset_filename, "r") as file:
        searchset_json = json.load(file)

        resource_list = []
        for entry in searchset_json["entry"]:
            resource_list.append(entry["resource"])

    return resource_list


def create_transaction(resource_list):
    transaction = {"resourceType": "Bundle", "type": "transaction", "entry": []}

    for resource in resource_list:
        if resource.get("id", None) is None:
            continue

        transaction["entry"].append(
            {
                "resource": resource,
                "request": {
                    "method": "PUT",
                    "url": f"{resource['resourceType']}/{resource['id']}",
                },
            }
        )

    return transaction


if __name__ == "__main__":
    # Replace 'your_directory_path' with the path to the directory containing JSON files
    resources = get_resources_from_searchset("./FormsServerBundle.json")

    transaction = create_transaction(resources)

    # Write JSON data to the file
    with open("./FormsServerTransaction.json", "w") as file:
        json.dump(transaction, file, indent=2)


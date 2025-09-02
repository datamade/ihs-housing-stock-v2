import csv
import json
import string


"""
From top to bottom, the following `with` statement asks for:
- a single geojson file with geometries and names from all relevant shapefiles
- the file containing the community area level data to insert into the geojson
- the file containing the municipality level data to insert into the geojson
- a destination path for the resulting rollup geojson file

This is intended to be run from the root directory.
"""
with (
    open("data/communities_and_municipalities.geojson") as gj_infile,
    open("data/ihs_comm_area_data.csv") as ihs_comm_area,
    open("data/ihs_municipality_data.csv") as ihs_municipality,
    open("data/ihs_rollup.geojson", "w+") as outfile,
):

    data = json.load(gj_infile)
    features = data["features"]
    input_fields = [
        "SFH",
        "Condo",
        "2to4",
        "U5to49",
        "U50",
        "Total",
        "SFH_p",
        "Condo_p",
        "2to4_p",
        "U5to49_p",
        "U50_p",
        "UmultiFam",
    ]

    result_gj = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"},
        },
        "features": [],
    }

    for data_to_import in [ihs_comm_area, ihs_municipality]:
        print(f"importing from {data_to_import.name}")
        reader = csv.DictReader(data_to_import)

        for row in reader:
            # search for the matching feature in the geojson
            found_f = None

            for f in features:
                name = f["properties"].get("ca_name") or f["properties"].get("NAME20")

                # ensure we can match on o'hare (apostrophe),
                # and lakeview (missing space)
                formatted_name = name.translate(
                    str.maketrans("", "", string.punctuation)
                ).replace(" ", "")

                if "ihs_comm_area" in data_to_import.name:
                    if formatted_name.lower() == row["CCA"].lower().replace(" ", ""):
                        found_f = f
                        break
                else:  # municipalities
                    if formatted_name.lower() == row["Place"].lower().replace(" ", ""):
                        found_f = f
                        break

            if not found_f:
                print(f"could not find {row.get('CCA') or row.get('Place')}")
                continue

            result_feature = {
                "type": "Feature",
                "properties": {
                    "name": name,
                },
                "geometry": found_f["geometry"],
            }

            for field in input_fields:
                result_feature["properties"][field] = row[field]

            result_gj["features"].append(result_feature)

    json.dump(result_gj, outfile)
    print("~~ Done ~~")

import exifread


def map_exif_tags(image_file):
    tags = exifread.process_file(image_file)

    image_tags = {
        "Make": None,
        "Model": None,
        "LensModel": None,
        "FocalLength": None,
        "Flash": None,
        "FNumber": None,
        "GPSLatitude": None,
        "GPSLongitude": None,
        "ISOSpeedRatings": None,
        "ShutterSpeedValue": None,
        "DateTimeOriginal": None,
        "ExifImageWidth": None,
        "ExifImageHeight": None
    }

    for tag_id in tags:
        tag_name = tag_id.split(" ")[1]
        if tag_name in image_tags:
            if tag_name == "ISOSpeedRatings" or "FocalLength":
                image_tags[tag_name] = tags[tag_id].values[0] if isinstance(tags[tag_id].values, list) else tags[tag_id].values
            elif tag_name == "FocalLength":
                image_tags[tag_name] = tags[tag_id].values[0] if isinstance(tags[tag_id].values, list) else tags[tag_id].values
            else:
                image_tags[tag_name] = tags[tag_id]

    return image_tags
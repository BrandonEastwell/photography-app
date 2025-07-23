from django.contrib.gis.geos import Point
from django.http import JsonResponse


def get_search_point(coordinates):
    if coordinates is None:
        return JsonResponse( { "error": "You must provide a location" }, status=404 )

    lat_str, lon_str = coordinates.split(",")
    lat = float(lat_str.strip())
    lon = float(lon_str.strip())

    return Point(lon, lat, srid=4326)

def _convert_to_degrees(value):
    # Each value is a Ratio object (ex: 52/1, 30/1)
    d = float(value[0].num) / float(value[0].den)
    m = float(value[1].num) / float(value[1].den)
    s = float(value[2].num) / float(value[2].den)
    return d + (m / 60.0) + (s / 3600.0)

def get_filters(req):
    # TODO Filter options need to be sanitized + check if lens and camera exist in DB (predefined options)
    filter_options = {
        "Make": "camera__make",
        "Model": "camera__model",
        "LensModel": "lens__model",
        "FocalLength": "focal_length",
        "Flash": "flash",
        "FNumber": "f_stop",
        "ISOSpeedRatings": "ISO",
        "ShutterSpeedValue": "shutter_speed"
    }

    filters = {}
    for key in req.GET.keys():
        if key in filter_options:
            value = req.GET.get(key)
            if key == "Flash":
                filters[filter_options[key]] = True if value == "true" else False
            else:
                filters[filter_options[key]] = value


    return filters
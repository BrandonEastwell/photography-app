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
    filter_options = ["camera", "lens", "focal_length", "flash", "f_stop", "ISO", "shutter_speed"]
    filters = {}
    for key in req.GET.keys():
        if filter_options.count(key) == 1:
            value = req.GET.get(key)
            if key == "camera":
                filters["camera__model"] = value
            elif key == "lens":
                filters["lens__model"] = value
            else:
                filters[key] = value

    return filters
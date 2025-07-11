import logging

from django.http import JsonResponse
from django.views import View
from media.models import Lens


class LensView(View):
    def get(self, req):
        return get_lens()

    def post(self, req):
        return get_lens()


def get_lens():
    try:
        lens = Lens.objects.all()
        lens_serialised = [
            {
                "id": lens.id,
                "model": lens.model,
            }
            for lens in lens
        ]
        return JsonResponse({ "items": len(lens_serialised), "results": lens_serialised }, safe=False, status=200)
    except Exception as e:
        logging.exception(e)
        return JsonResponse({ "error": "Cannot retrieve lens at this time." }, status=500)
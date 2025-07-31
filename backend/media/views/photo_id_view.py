import logging

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from ..models import Photo
from photoapp.middleware.auth_middleware import JWTAuthenticationMiddleware

@method_decorator(csrf_exempt, name='dispatch')
class ImageIdView(View):
    def delete(self, req, *args, **kwargs):
        try:
            image_id = kwargs.get('image_id')
            return delete_photo(req, image_id)
        except Exception as e:
            logging.exception(e)
            return JsonResponse({ "success": False, "error": "Internal Server Error" }, status=500)

    def get(self, req, image_id):
        try:
            image = Photo.objects.get(id=image_id)
            if image is None:
                return JsonResponse({ "success": False, "error": "Image does not exist" }, status=400)

            return JsonResponse(image, status=200)

        except Photo.DoesNotExist:
            return JsonResponse({ "success": False, "error": "Image does not exist" }, status=400)
        except Exception as e:
            logging.exception(e)
            return JsonResponse({ "success": False, "error": "Internal Server Error" }, status=500)

@JWTAuthenticationMiddleware
def delete_photo(req, image_id):
    try:
        user_id = req.user_id
        image = Photo.objects.get(id=image_id)
        if image is None:
            return JsonResponse({ "success": False, "error": "Image does not exist" }, status=400)

        if image.user.id != user_id:
            return JsonResponse({ "success": False, "error": "You are not authorized to do that" }, status=401)

        image.delete()
        return JsonResponse({"success": True, "message": "Successfully removed photo"}, status=200)

    except Photo.DoesNotExist:
        return JsonResponse({ "success": False, "error": "Image does not exist" }, status=400)
    except Exception as e:
        logging.exception(e)
        return JsonResponse({ "success": False, "error": "Internal Server Error" }, status=500)


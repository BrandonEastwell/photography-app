from datetime import timedelta

from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.measure import D
from django.db.models import When, Q, Value, Sum, IntegerField, Case
from django.utils import timezone


class PhotoService:
    @staticmethod
    def filter_by_time(qs, time_period):
        SORT_FIELDS_TIME = { "today": 1, "this_week": 7, "this_month": 30, "this_year": 365 }
        qs = qs.filter(uploaded_at__gte=timezone.now() - timedelta(days=SORT_FIELDS_TIME[time_period] if SORT_FIELDS_TIME.get(time_period) is not None else 7))
        return qs


    @staticmethod
    def filter_by_exif(qs, filter_options):
        for field, value in filter_options.items():
            if value is not None:
                qs = qs.filter(**{field: value})
        return qs


    # Sort photos by EXIF data
    @staticmethod
    def sort_by_exif(qs, filters, search_point=None):
        conditions = []
        for field, value in filters.items():
            if value:
                if field == "camera__model":
                    conditions.append(When(Q(camera__model=value), then=Value(4)))
                elif field == "lens__model":
                    conditions.append(When(Q(lens__model=value), then=Value(4)))
                elif field == "ISO":
                    conditions.append(When(Q(ISO__lte=int(value)+100) & Q(ISO__gte=int(value)-100), then=Value(3)))
                elif field == "focal_length":
                    conditions.append(When(Q(focal_length=value), then=Value(3)))
                elif field == "shutter_speed":
                    conditions.append(When(Q(shutter_speed__lte=value+(value/2)) & Q(shutter_speed__gte=value-(value/2)), then=Value(2)))
                else:
                    conditions.append(When(Q(**{field: value}), then=Value(1)))

        if search_point:
            qs = qs.annotate(distance=Distance("location", search_point)) # includes distance weight
            conditions += [
                When(distance__lte=D(m=100), then=Value(10)),
                When(distance__gt=D(m=100), distance__lte=D(m=1000), then=Value(8)),
                When(distance__gt=D(m=1000), distance__lte=D(m=10000), then=Value(6)),
                When(distance__gt=D(m=10000), distance__lte=D(m=100000), then=Value(3)),
                When(distance__gt=D(m=100000), distance__lte=D(m=1000000), then=Value(1)),
            ]
            print(conditions)

        if conditions:
            qs = qs.annotate(relevance=Sum(
                Case(*conditions, output_field=IntegerField())
            ))
            return qs.order_by("-relevance")
        return qs
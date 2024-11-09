from django.urls import path, re_path, include
from rest_framework import routers

from lti.api import TextbookViewSet
from lti.auth_views import oauth_complete, oauth_login
from lti.views import (
    config,
    get_jwks,
    launch,
    login,
)

app_name = "lti"

router = routers.DefaultRouter()

router.register(r"textbooks", TextbookViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    re_path(r"^login/$", login, name="login"),
    re_path(r"^launch/$", launch, name="launch"),
    re_path(r"^jwks/$", get_jwks, name="jwks"),
    re_path(r"^config/", config, name="config"),
    path("oauth_login/", oauth_login, name="oauth_login"),
    re_path(r"oauth_complete/", oauth_complete, name="oauth_complete"),
]
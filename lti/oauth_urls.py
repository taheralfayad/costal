from django.urls import path, re_path

from lti.auth_views import oauth_complete, oauth_login

app_name = "lti"

urlpatterns = [
    path("oauth_login/", oauth_login, name="oauth_login"),
    re_path(
        r"oauth_complete/",
        oauth_complete,
        name="oauth_complete",
    ),
]
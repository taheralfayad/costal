import time

from django.conf import settings
from django.http import QueryDict
from django.shortcuts import redirect, render
from dotenv import load_dotenv

from lti.models import CanvasUser, Course
from lti.oauth.auth_utils import (
    build_redirect_uri,
    exchange_code_for_token,
    update_session_refresh,
    test_api_key,
)

load_dotenv()


def authenticate(request, user, expiration, response_data):
    """Validate if the user's token is still valid or refresh it"""
    if int(time.time()) <= expiration and "api_key" in request.session:
        if test_api_key(request):
            return render(request, "index.html", response_data)
    else:
        print("Refreshing access token.")
        updated_res_data = update_session_refresh(request, user, response_data)
        if updated_res_data:
            return render(request, "index.html", updated_res_data)

    return reauthenticate(request=request)


def oauth_login(request):
    """Redirect user to canvas-lms oauth login"""
    query_params = QueryDict(mutable=True)
    query_params.update(
        {
            "client_id": settings.API_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": build_redirect_uri(request),
        }
    )

    return redirect(
        f"{settings.CANVAS_URL}/login/oauth2/auth?{query_params.urlencode()}"
    )


def oauth_complete(request):
    """After login, handle the oauth callback and store the access token"""

    if request.GET.get("error") or not request.GET.get("code"):
        return render(request, "oauthFailure.html")

    token_data = exchange_code_for_token(request.GET.get("code"), request)

    if not token_data:
        return render(request, "oauthFailure.html")

    request.session.update(
        {"api_key": token_data["access_token"], "expires_in": token_data["expiration"]}
    )

    user, created = CanvasUser.objects.get_or_create(uid=request.session["uid"])
    user.refresh_token = token_data["refresh_token"]
    user.expires_in = token_data["expiration"]
    user.save()

    Course.objects.get(course_id=request.session["course_id"]).users.add(user)

    return render(request, "index.html")


def reauthenticate(request):
    print("Performing reauthenticate")
    return oauth_login(request)

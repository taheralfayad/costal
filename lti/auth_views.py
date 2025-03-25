import time

import requests
from django.conf import settings
from django.http import QueryDict
from django.shortcuts import redirect, render
from django.urls import reverse
from dotenv import load_dotenv

from lti.models import CanvasUser, Course

load_dotenv()


def oauth_login(request):
    query_params = QueryDict(mutable=True)
    query_params["client_id"] = settings.API_CLIENT_ID
    query_params["response_type"] = "code"
    redirect_uri = (
        request.build_absolute_uri(reverse("lti:oauth_complete"))
        .replace("http://", "https://")
        .rstrip("/")
    )
    query_params["redirect_uri"] = redirect_uri
    print(f"Redirect URI: {redirect_uri}")
    query_string = query_params.urlencode()
    return redirect(settings.CANVAS_URL + "/login/oauth2/auth?" + query_string)


# After returning from login
def oauth_complete(request):
    # If they hit cancel or some other error
    if request.GET.get("error") or not request.GET.get("code"):
        return render(request, "oauthFailure.html")

    payload = {
        "client_id": settings.API_CLIENT_ID,
        "redirect_uri": request.build_absolute_uri(
            reverse("lti:oauth_complete")
        ).replace("http://", "https://"),
        "client_secret": settings.API_CLIENT_ID_SECRET,
        "code": request.GET.get("code"),
        "replace_tokens": 1,
    }

    auth_response = requests.post(
        settings.CANVAS_URL + "/login/oauth2/token", data=payload
    )

    json_auth_response = auth_response.json()

    # Useful Variables
    refresh_token = json_auth_response.get("refresh_token")
    current_time = int(
        time.time()
    )  # Add current time to expires_in time to get expiration time
    expires_in = current_time + json_auth_response.get("expires_in")

    request.session["api_key"] = json_auth_response["access_token"]
    request.session["expires_in"] = expires_in

    # these should be set upon launch
    canvas_user_id = request.session["uid"]

    if CanvasUser.objects.filter(uid=canvas_user_id).exists():
        user_object = CanvasUser.objects.get(uid=canvas_user_id)
        # Update User
        user_object.expires_in = expires_in
        user_object.refresh_token = refresh_token
        user_object.save()
    else:
        # Does not exist create User in DB
        user_object = CanvasUser(
            uid=canvas_user_id,
            refresh_token=refresh_token,
            expires_in=expires_in,
        )
        # Save in the db
        user_object.save()

    course_object = Course.objects.get(course_id=request.session["course_id"])
    course_object.users.add(user_object)

    return render(request, "index.html")


def refresh_access_token(request, user_object):
    """
    Use a user's refresh token to get a new access token.

    :rtype: dict
    :returns: Dictionary with keys 'access_token' and 'expiration_date'.
        Values will be `None` if refresh fails.
    """

    payload = {
        "grant_type": "refresh_token",
        "client_id": settings.API_CLIENT_ID,
        "redirect_uri": request.build_absolute_uri(reverse("lti:oauth_complete")),
        "client_secret": settings.API_CLIENT_ID_SECRET,
        "refresh_token": user_object.refresh_token,
    }

    # If DEBUG = True we turn off the SSL verification.
    verify = not settings.DEBUG
    response = requests.post(
        settings.CANVAS_URL + "/login/oauth2/token", data=payload, verify=verify
    )

    try:
        response.raise_for_status()
    except requests.HTTPError:
        print("Failed refresh. Probably bad refresh token.")
        return {"access_token": None, "expiration_date": None}

    try:
        response_json = response.json()
    except ValueError:
        print("Unable to load JSON response of refresh. Possibly bad refresh token.")
        return {"access_token": None, "expiration_date": None}

    if "access_token" not in response_json:
        print("Access Token Error")
        return {"access_token": None, "expiration_date": None}

    api_key = response_json["access_token"]
    print("New access token created for User")

    if "expires_in" not in response_json:
        print("Expires In Error")
        return {"access_token": None, "expiration_date": None}

    current_time = int(time.time())
    new_expiration_date = current_time + response_json["expires_in"]

    try:
        # Update expiration date in db
        user_object.expires_in = new_expiration_date
        user_object.save()
    except Exception:
        return {"access_token": None, "expiration_date": None}

    return {"access_token": api_key, "expiration_date": new_expiration_date}


def verify_auth(request, user, expiration_date, response_data):

    if int(time.time()) > expiration_date or "api_key" not in request.session:
        print("Expired Key or no API key, refreshing access token.")
        # This line maybe on some kind of race-condition.
        refresh = refresh_access_token(request, user)
        if refresh["access_token"] and refresh["expiration_date"]:
            request.session.update(
                {
                    "api_key": refresh["access_token"],
                    "expires_in": refresh["expiration_date"],
                }
            )
            response_data["access_token"] = refresh["access_token"]

            return render(request, "index.html", response_data)
        else:
            print("reAuthenticating due to refresh failure")
            return reauthenticate(request=request)
    else:
        # API key that shouldn't be expired. Test it.
        auth_header = {"Authorization": "Bearer " + request.session["api_key"]}
        r = requests.get(
            settings.CANVAS_URL + "/api/v1/users/%s/profile" % (request.session["uid"]),
            headers=auth_header,
        )
        # check for WWW-Authenticate
        # https://canvas.instructure.com/doc/api/file.oauth.html
        if "WWW-Authenticate" not in r.headers and r.status_code != 401:
            return render(request, "index.html", response_data)
        else:
            new_token = refresh_access_token(request, user).get("access_token")
            if new_token:
                request.session["api_key"] = new_token
                response_data["access_token"] = new_token
                return render(request, "index.html", response_data)

            else:
                print("reAuthenticating due to bad key")
                return reauthenticate(request=request)


def reauthenticate(request):
    print("Performing reauthenticate")
    return oauth_login(request)

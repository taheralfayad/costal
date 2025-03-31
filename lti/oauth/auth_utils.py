import time
import requests
from django.conf import settings
from django.urls import reverse


def exchange_code_for_token(code, request):
    """Use auth code to retrieve access and refresh tokens"""
    payload = {
        "client_id": settings.API_CLIENT_ID,
        "client_secret": settings.API_CLIENT_ID_SECRET,
        "code": code,
        "replace_tokens": 1,
        "redirect_uri": build_redirect_uri(request),
    }

    response = requests.post(f"{settings.CANVAS_URL}/login/oauth2/token", data=payload)

    if response.status_code != 200:
        return None

    json_data = response.json()
    return {
        "access_token": json_data.get("access_token"),
        "refresh_token": json_data.get("refresh_token"),
        "expiration": int(time.time()) + json_data.get("expires_in", 0),
    }


def refresh_access_token(request, user):
    """Refresh user's access token using their refresh token"""
    payload = {
        "grant_type": "refresh_token",
        "client_id": settings.API_CLIENT_ID,
        "client_secret": settings.API_CLIENT_ID_SECRET,
        "refresh_token": user.refresh_token,
        "redirect_uri": build_redirect_uri(request),
    }

    response = requests.post(
        f"{settings.CANVAS_URL}/login/oauth2/token",
        data=payload,
        verify=(not settings.DEBUG),
    )
    invalid_response = {"access_token": None, "expiration_date": None}

    try:
        response.raise_for_status()
        json_data = response.json()
    except requests.HTTPError as http_err:
        print(f"Failed refresh. HTTP error: {http_err}")
        return invalid_response
    except ValueError as json_err:
        print(f"Unable to parse JSON response: {json_err}")
        return invalid_response

    if "access_token" not in json_data:
        print("Error retrieving access token")
        return invalid_response

    if "expires_in" not in json_data:
        print("Error retrieving expiration time")
        return invalid_response

    new_expiration = int(time.time()) + json_data.get("expires_in", 0)

    try:
        user.expires_in = new_expiration
        user.save()
    except Exception as db_err:
        print(f"Error saving new expiration date to DB: {db_err}")
        return invalid_response

    return json_data.get("access_token"), new_expiration


def update_session_refresh(request, user, response_data):
    """Update session and return updated response data"""
    new_token, new_exp = refresh_access_token(request, user)
    if new_token and new_exp:
        request.session["api_key"] = new_token
        request.session["expires_in"] = new_exp
        response_data["access_token"] = new_token

        return response_data
    return None


def test_api_key(request):
    """Test if the API key in the session is valid"""
    header = {"Authorization": "Bearer " + request.session["api_key"]}
    response = requests.get(
        f"{settings.CANVAS_URL}/api/v1/users/{request.session['uid']}/profile",
        headers=header,
    )

    if response.status_code == 401 or "WWW-Authenticate" in response.headers:
        return False

    return True


def build_redirect_uri(request):
    return (
        request.build_absolute_uri(reverse("lti:oauth_complete"))
        .replace("http://", "https://")
        .rstrip("/")
    )

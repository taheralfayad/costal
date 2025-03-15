import os

from urllib.parse import urlparse
from django.core.cache import cache
from django.http import HttpResponseRedirect, JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from pylti1p3.contrib.django import (
    DjangoCacheDataStorage,
    DjangoMessageLaunch,
    DjangoOIDCLogin,
)
from pylti1p3.tool_config import ToolConfDict

from lti.auth_views import reauthenticate, verify_auth
from lti.models import (
    CanvasUser,
    Course,
    Registration,
)


class ExtendedDjangoMessageLaunch(DjangoMessageLaunch):

    def validate_nonce(self):
        """
        Used to bypass nonce validation for canvas.

        """
        iss = self.get_iss()
        deep_link_launch = self.is_deep_link_launch()
        if iss == "https://canvas.instructure.com" and deep_link_launch:
            return self
        return super().validate_nonce()


# Helper functions for LTI 1.3 processes
def get_lti_config():
    registrations = Registration.objects.all()

    from collections import defaultdict

    settings = defaultdict(list)
    for registration in registrations:
        settings[registration.issuer].append(
            {
                "client_id": registration.client_id,
                "auth_login_url": registration.platform_login_auth_endpoint,
                "auth_token_url": registration.platform_service_auth_endpoint,
                "auth_audience": "null",
                "key_set_url": registration.platform_jwks_endpoint,
                "key_set": None,
                "deployment_ids": [
                    deployment.deployment_id
                    for deployment in registration.deployments.all()
                ],
            }
        )

    tool_conf = ToolConfDict(settings)
    for registration in registrations:
        # Currently pylti1.3 only allows one key per client id. For now just set first one.
        key = registration.key_set.keys.all()[0]
        tool_conf.set_private_key(
            registration.issuer,
            # ensure type is string not bytes (varies based on DB type)
            (
                key.private_key
                if isinstance(key.private_key, str)
                else key.private_key.decode("utf-8")
            ),
            client_id=registration.client_id,
        )
        tool_conf.set_public_key(
            registration.issuer,
            # ensure type is string not bytes (varies based on DB type)
            (
                key.public_key
                if isinstance(key.public_key, str)
                else key.public_key.decode("utf-8")
            ),
            client_id=registration.client_id,
        )
    return tool_conf


def get_launch_data_storage():
    return DjangoCacheDataStorage()


def get_launch_url(request):
    target_link_uri = request.POST.get(
        "target_link_uri", request.GET.get("target_link_uri")
    )
    if not target_link_uri:
        raise Exception('Missing "target_link_uri" param')
    return target_link_uri

@csrf_exempt
def login(request):
    get_token(request)
    tool_conf = get_lti_config()
    launch_data_storage = get_launch_data_storage()

    oidc_login = DjangoOIDCLogin(
        request, tool_conf, launch_data_storage=launch_data_storage
    )
    target_link_uri = get_launch_url(request)
    return oidc_login.enable_check_cookies().redirect(target_link_uri)


@csrf_exempt
def launch(request):
    tool_conf = get_lti_config()
    launch_data_storage = get_launch_data_storage()
    message_launch = ExtendedDjangoMessageLaunch(
        request, tool_conf, launch_data_storage=launch_data_storage
    )
    message_launch_data = message_launch.get_launch_data()
    course_id = message_launch_data["https://purl.imsglobal.org/spec/lti/claim/custom"][
        "canvas_course_id"
    ]
    user_id = message_launch_data["https://purl.imsglobal.org/spec/lti/claim/custom"][
        "canvas_user_id"
    ]

    course_name = message_launch_data['https://purl.imsglobal.org/spec/lti/claim/context']['title']


    is_professor = 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Instructor' in message_launch_data['https://purl.imsglobal.org/spec/lti/claim/roles']

    try: 
        course = Course.objects.get(course_id=course_id)

        if (
            "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor"
            in message_launch_data["https://purl.imsglobal.org/spec/lti/claim/roles"]
        ):
            user = CanvasUser.objects.get(uid=user_id)
            if user not in course.teachers.all():
                course.teachers.add(user)
                course.save()

    except Course.DoesNotExist:
        print("Course does not exist")
        pass

    except CanvasUser.DoesNotExist:
        print("User does not exist")
        pass

    course_id = str(course_id)

    request.session["uid"] = user_id
    request.session["course_id"] = course_id

    cache.set("course_id", course_id, 3600)

    course = Course.objects.filter(course_id=course_id)

    response_data = {
        "is_deep_link_launch": message_launch.is_deep_link_launch(),
        "launch_data": message_launch.get_launch_data(),
        "launch_id": message_launch.get_launch_id(),
        "course_id": course_id,
        "course_name": course_name,
        "is_professor": is_professor,
        "user_id": user_id,
    }


    course, created = Course.objects.get_or_create(course_id=course_id, name=course_name)
    if created:
        course.save()

    # Authenticate on new user
    user_exists = CanvasUser.objects.filter(uid=user_id).exists()
    if not user_exists:
        return HttpResponseRedirect(reverse("lti:oauth_login"))


    # Get the expiration date
    try:
        user_object = CanvasUser.objects.get(uid=user_id)
        expiration_date = user_object.expires_in
    except Exception:
        print("User not found, reAuthenticating.")

        return reauthenticate(request=request)

    return verify_auth(request, user_object, expiration_date, response_data)


def get_jwks(request):
    tool_conf = get_lti_config()
    return JsonResponse(tool_conf.get_jwks(), safe=False)


def config(request):
    hosted_path = os.getenv("HOSTED_PATH")
    domain = urlparse(request.build_absolute_uri()).netloc
    url_scheme = request.scheme
    context = {
        "domain": domain,
        "url_scheme": url_scheme,
    }
    if hosted_path:
        context["hosted_path"] = hosted_path + "/"

    return render(request, "lti.json", context, content_type="application/json")

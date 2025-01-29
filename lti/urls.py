from django.urls import path, re_path, include
from rest_framework import routers

from lti.api import TextbookViewSet, AssignmentViewSet, QuestionViewSet, SkillViewSet, PossibleAnswersViewSet, GetCourseProfessorName, ModuleViewSet
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
router.register(r"assignments", AssignmentViewSet)
router.register(r"questions", QuestionViewSet)
router.register(r"skills", SkillViewSet)
router.register(r"possible_answers", PossibleAnswersViewSet)
router.register(r"modules", ModuleViewSet)


urlpatterns = [
    path('api/', include(router.urls)),
    path('api/get_course_professor_name/', GetCourseProfessorName.as_view(), name='get_course_professor_name'),
    re_path(r"^login/$", login, name="login"),
    re_path(r"^launch/$", launch, name="launch"),
    re_path(r"^jwks/$", get_jwks, name="jwks"),
    re_path(r"^config/", config, name="config"),
    path("oauth_login/", oauth_login, name="oauth_login"),
    re_path(r"oauth_complete/", oauth_complete, name="oauth_complete"),
]
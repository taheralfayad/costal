from django.urls import re_path
import lti.views as views

urlpatterns = [
    re_path(r'^$', views.index, name='index'),
]
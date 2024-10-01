import datetime

from django.db import models

# Canvas Models

class CanvasUser(models.Model):
    uid = models.CharField(max_length=200)
    refresh_token = models.CharField(null=True, max_length=255)
    expires_in = models.BigIntegerField(default=0)


class Course(models.Model):
    course_id = models.CharField(max_length=200)
    users = models.ManyToManyField(CanvasUser)
    teachers = models.ManyToManyField(CanvasUser, related_name="teaching_courses")


# LTI Key Models

class Key(models.Model):
    public_key = models.TextField()
    private_key = models.TextField()
    alg = models.TextField(default="RS256")  # defaults to RS256


class KeySet(models.Model):
    keys = models.ManyToManyField("Key", related_name="key_sets", blank=True)


class Registration(models.Model):
    issuer = models.CharField(max_length=255)
    client_id = models.CharField(max_length=255)
    platform_login_auth_endpoint = models.CharField(max_length=255)
    platform_service_auth_endpoint = models.CharField(max_length=255)
    platform_jwks_endpoint = models.CharField(max_length=255)
    deployments = models.ManyToManyField(
        "Deployment", related_name="registrations", blank=True
    )
    key_set = models.ForeignKey(
        "KeySet",
        related_name="registrations",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["issuer", "client_id"], name="unique_issuer_client_id"
            )
        ]


class Deployment(models.Model):
    deployment_id = models.CharField(max_length=255)
    registration = models.ForeignKey("Registration", on_delete=models.CASCADE)
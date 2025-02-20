from django.db import models


class Textbook(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    published_date = models.DateField(null=True, blank=True)
    isbn = models.CharField(max_length=13, unique=True, blank=True, null=True)
    file = models.FileField(upload_to="textbooks/", null=True, blank=True)

    def __str__(self):
        return self.title


# Canvas Models


class CanvasUser(models.Model):
    uid = models.CharField(max_length=200)
    refresh_token = models.CharField(null=True, max_length=255)
    expires_in = models.BigIntegerField(default=0)


class Course(models.Model):
    course_id = models.CharField(max_length=200, primary_key=True)
    users = models.ManyToManyField(CanvasUser)
    teachers = models.ManyToManyField(CanvasUser, related_name="teaching_courses")


# Models


class Assignment(models.Model):
    assignment_name = models.CharField(max_length=255)
    course = models.ForeignKey(
        Course, to_field="course_id", on_delete=models.CASCADE, blank=True, null=True
    )
    questions = models.ManyToManyField("Question", blank=True)

    def __str__(self):
        return self.assignment_name


class Skill(models.Model):
    skill_name = models.TextField()
    course = models.ForeignKey(
        Course, to_field="course_id", on_delete=models.CASCADE, null=True, blank=True
    )
    questions = models.ManyToManyField("Question", blank=True)

    def __str__(self):
        return self.skill_name


class Question(models.Model):
    question_text = models.TextField()
    associated_skill = models.ForeignKey(
        Skill, on_delete=models.CASCADE, null=True, blank=True
    )
    assignments = models.ManyToManyField("Assignment", blank=True)
    possible_answers = models.ManyToManyField("PossibleAnswers", blank=True)

    def __str__(self):
        return self.question_text


class PossibleAnswers(models.Model):
    related_question = models.ForeignKey(
        Question, on_delete=models.CASCADE, null=True, blank=True
    )
    possible_answer = models.TextField(default="")
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.possible_answer


class Response(models.Model):
    user = models.ForeignKey(CanvasUser, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    response = models.ForeignKey(PossibleAnswers, on_delete=models.CASCADE)
    number_of_seconds_to_answer = models.IntegerField(default=0)

    def __str__(self):
        return (
            f"{self.user} answered {self.response} to {self.question}\n"
            f"in {self.number_of_seconds_to_answer} seconds"
        )

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

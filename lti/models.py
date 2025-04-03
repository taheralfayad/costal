import datetime
from enum import Enum
from django.db import models


class DeadlineType(Enum):
    WEEK = "WEEK"
    MONTH = "MONTH"
    END_OF_SESSION = "END_OF_SESSION"


class Textbook(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    published_date = models.DateField(null=True, blank=True)
    isbn = models.CharField(max_length=13, unique=True, blank=True, null=True)
    file = models.FileField(upload_to="textbooks/", null=True, blank=True)
    # need to add a field for the course id that the book is associated with.
    course = models.ForeignKey(
        "Course", on_delete=models.CASCADE, blank=True, null=True
    )

    def __str__(self):
        return self.title


# Canvas Models


class CanvasUser(models.Model):
    uid = models.CharField(max_length=200)
    refresh_token = models.CharField(null=True, max_length=255)
    expires_in = models.BigIntegerField(default=0)


class Course(models.Model):
    name = models.CharField(max_length=255, default="Course")
    course_id = models.CharField(max_length=200, primary_key=True)
    users = models.ManyToManyField(CanvasUser)
    teachers = models.ManyToManyField(CanvasUser, related_name="teaching_courses")
    partial_completion = models.BooleanField(default=False)
    late_completion = models.BooleanField(default=False)
    deadline = models.CharField(
        max_length=20,
        choices=[(tag, tag.value) for tag in DeadlineType],
        default=DeadlineType.WEEK.value,
    )
    penalty = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)


# Models

class Module(models.Model):
    name = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, blank=True, null=True)
    assignments = models.ManyToManyField("Assignment", blank=True)
    skills = models.ManyToManyField("Skill", blank=True)
    prequiz = models.OneToOneField("Prequiz", null=True, on_delete=models.SET_NULL, blank=True)

    def __str__(self):
        return self.name


class Assignment(models.Model):
    canvas_id = models.CharField(max_length=200, null=True, blank=True)
    name = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, blank=True, null=True)
    questions = models.ManyToManyField("Question", blank=True)
    start_date = models.DateTimeField(default=datetime.datetime.now)
    end_date = models.DateTimeField(default=datetime.datetime.now)
    assessment_type = models.TextField(default="Homework")
    associated_module = models.ForeignKey(
        Module, on_delete=models.CASCADE, null=True, blank=True
    )

    def __str__(self):
        return self.name


class AssignmentAttempt(models.Model):
    NOT_STARTED = 0
    ONGOING = 1
    COMPLETE = 2

    STATUS_CHOICES = [
        (NOT_STARTED, "Not Started"),
        (ONGOING, "Ongoing"),
        (COMPLETE, "Complete")
    ]

    user = models.ForeignKey(CanvasUser, on_delete=models.CASCADE, blank=True, null=True)
    attempted_questions = models.ManyToManyField("QuestionAttempt", blank=True)
    current_question_attempt = models.ForeignKey("Question", on_delete=models.CASCADE, null=True, blank=True)
    total_grade = models.IntegerField(default=0)
    total_time_spent = models.IntegerField(default=0)
    associated_assignment = models.ForeignKey("Assignment", on_delete=models.CASCADE, null=True, blank=True)
    completion_percentage = models.FloatField(default=0.0)
    status = models.SmallIntegerField(choices=STATUS_CHOICES, default=NOT_STARTED)

class QuestionAttempt(models.Model):
    user = models.ForeignKey(CanvasUser, on_delete=models.CASCADE, blank=True, null=True)
    associated_assignment_attempt = models.ForeignKey("AssignmentAttempt", blank=True, null=True, on_delete=models.CASCADE)
    associated_assignment = models.ForeignKey("Assignment", blank=True, null=True ,on_delete=models.CASCADE)
    associated_question = models.ForeignKey("Question", blank=True, null=True, on_delete=models.CASCADE)
    grade_for_question_attempt = models.IntegerField(default=0)
    associated_possible_answer = models.ForeignKey("PossibleAnswer", blank=True, null= True, on_delete=models.CASCADE)
    time_spent_on_question = models.IntegerField(default=0)
    number_of_hints = models.IntegerField(default=0)


class Prequiz(Assignment):
    def __str__(self):
        return self.name
    
    def is_valid(self):
        for skill in self.associated_module.skills.all():
            if not self.questions.filter(associated_skill=skill).exists():
                return False
        return True
    
    def missing_skills(self):
        missing_skills = []
        for skill in self.associated_module.skills.all():
            if not self.questions.filter(associated_skill=skill).exists():
                missing_skills.append(skill)
        return missing_skills

class Skill(models.Model):
    name = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    questions = models.ManyToManyField("Question", blank=True)
    assignments = models.ManyToManyField("Assignment", blank=True)

    def __str__(self):
        return self.name


class Question(models.Model):
    name = models.CharField(max_length=255, default="Question")
    text = models.TextField()
    associated_skill = models.ForeignKey(
        Skill, on_delete=models.CASCADE, null=True, blank=True
    )
    assignments = models.ManyToManyField("Assignment", blank=True)
    possible_answers = models.ManyToManyField("PossibleAnswer", blank=True)
    difficulty = models.IntegerField(default=0)
    num_points = models.IntegerField(default=1)
    type = models.TextField(default="multiple")

    def __str__(self):
        return self.name


class PossibleAnswer(models.Model):
    related_question = models.ForeignKey(
        Question, on_delete=models.CASCADE, null=True, blank=True
    )
    answer = models.TextField(default="")
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return self.answer


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

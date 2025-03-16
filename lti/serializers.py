from rest_framework import serializers

from lti.models import (
    Course,
    Assignment,
    Prequiz,
    Textbook,
    Question,
    PossibleAnswer,
    Skill,
    Module,
)


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = "__all__"

class Prequiz(serializers.ModelSerializer):
    class Meta:
        model = Prequiz
        fields = "__all__"

class TextbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Textbook
        fields = "__all__"


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = "__all__"


class PossibleAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PossibleAnswer
        fields = "__all__"


class QuestionSerializer(serializers.ModelSerializer):
    possible_answers = PossibleAnswerSerializer(read_only=True, many=True)

    class Meta:
        model = Question
        fields = "__all__"


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = "__all__"

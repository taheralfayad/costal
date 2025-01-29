from rest_framework import serializers

from lti.models import Assignment, Textbook, Question, PossibleAnswer, Skill, Module

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
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
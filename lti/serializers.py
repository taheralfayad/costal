from rest_framework import serializers

from lti.models import Assignment, Textbook, Question, PossibleAnswers, Objective

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = "__all__"


class TextbookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Textbook
        fields = "__all__"


class PossibleAnswersSerializer(serializers.ModelSerializer):
    class Meta:
        model = PossibleAnswers
        fields = "__all__"


class QuestionSerializer(serializers.ModelSerializer):
    possible_answers = PossibleAnswersSerializer(read_only=True, many=True)
    class Meta:
        model = Question
        fields = "__all__"


class ObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objective
        fields = "__all__"
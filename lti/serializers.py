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
    AssignmentAttempt,
    QuestionAttempt,
)

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = "__all__"

class PrequizSerializer(serializers.ModelSerializer):
    topic = serializers.CharField(source='name')
    start = serializers.DateTimeField(source='start_date')
    end = serializers.DateTimeField(source='end_date')
    class Meta:
        model = Prequiz
        fields = ['id', 'topic', 'start', 'end', 'assessment_type']

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
        fields = ('id', 'answer', 'related_question')


class QuestionSerializer(serializers.ModelSerializer):
    possible_answers = PossibleAnswerSerializer(read_only=True, many=True)

    class Meta:
        model = Question
        fields = "__all__"


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = "__all__"


class AssignmentAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentAttempt
        fields = "__all__"


class QuestionAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAttempt
        fields = "__all__"


import os
import requests

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from lti.models import (
    Assignment,
    CanvasUser,
    Textbook,
    Question,
    PossibleAnswers,
    Skill,
    Response as StudentResponse,
)

from lti.serializers import (
    AssignmentSerializer,
    QuestionSerializer,
    TextbookSerializer,
    PossibleAnswersSerializer,
    SkillSerializer,
)


class TextbookViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = TextbookSerializer
    queryset = Textbook.objects.all()

    def get_queryset(self):
        queryset = Textbook.objects.all()
        return queryset

    @action(detail=False, methods=["get"], url_path="isbn/(?P<isbn>[^/.]+)")
    def get_by_isbn(self, request, isbn=None):
        try:
            textbook = Textbook.objects.get(isbn=isbn)
            serializer = TextbookSerializer(textbook)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Textbook.DoesNotExist:
            return Response(
                {"error": "Textbook not found"}, status=status.HTTP_404_NOT_FOUND
            )


# Need an endpoint to create assignments
class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = AssignmentSerializer
    queryset = Assignment.objects.all()

    def get_queryset(self):
        queryset = Assignment.objects.all()
        return queryset

    @action(detail=False, methods=["post"], url_path="create_assignment")
    def create_assignment(self, request):
        data = request.data
        assignment = Assignment.objects.create(
            assignment_name=data["assignment_name"], course_id=data["course_id"]
        )

        assignment.save()
        serializer = AssignmentSerializer(assignment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="add_question")
    def add_question(self, request):
        data = request.data
        assignment = Assignment.objects.get(id=data["assignment_id"])
        question = Question.objects.get(id=data["question_id"])
        assignment.questions.add(question)
        assignment.save()
        serializer = AssignmentSerializer(assignment)
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = QuestionSerializer
    queryset = Question.objects.all()

    def get_queryset(self):
        queryset = Question.objects.all()
        return queryset

    @action(detail=False, methods=["post"], url_path="create_question")
    def create_question(self, request):
        data = request.data
        question = Question.objects.create(
            question_text=data["question_text"],
        )

        try:
            assignment = Assignment.objects.get(id=data["assignment_id"])
            question.assignments.add(assignment)
        except Assignment.DoesNotExist:
            return Response(
                {
                    "error": f"Assignment with ID {data['assignment_id']} does not exist."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        possible_answers = data["possible_answers"]
        skill_id = data["skill_id"]

        for answer in possible_answers:
            possible_answer = PossibleAnswers.objects.create(
                possible_answer=answer["possible_answer"],
                is_correct=answer["is_correct"],
                related_question=question,
            )
            possible_answer.save()
            question.possible_answers.add(possible_answer)

        question.associated_skill = Skill.objects.get(id=skill_id)

        question.save()
        serializer = QuestionSerializer(question)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="add_question_list")
    def add_question_list(self, request):
        data = request.data
        course = Course.objects.get(id=data["course_id"])
        for question in data:
            question = Question(question_text=question["question_text"])
            skill_name = question["sub_category"]

            skill = Skill.objects.get(skill_name=skill_name)

            if skill:
                question.associated_skill = skill
            else:
                skill = Skill.objects.create(skill_name=skill_name)
                skill.questions.add(question)
                skill.course = course
                skill.save()
                question.associated_skill = skill

            for answer in question["possible_answers"]:
                possible_answer = PossibleAnswers.objects.create(
                    possible_answer=answer["possible_answer"],
                    is_correct=answer["is_correct"],
                    related_question=question,
                )
                possible_answer.save()
                question.possible_answers.add(possible_answer)

            question.save()

        return Response(status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="answer_question")
    def answer_question(self, request):
        data = request.data
        user = CanvasUser.objects.get(id=data["user_id"])
        question = Question.objects.get(id=data["question_id"])
        answer_choice = PossibleAnswers.objects.get(id=data["answer_choice"])
        number_of_seconds_to_answer = data["number_of_seconds_to_answer"]
        response = StudentResponse(
            user=user,
            question=question,
            response=answer_choice,
            number_of_seconds_to_answer=number_of_seconds_to_answer,
        )

        request_to_adaptive_engine = {
            "user_id": user.id,
            "skill_name": question.associated_skill.skill_name,
            "correct": answer_choice.is_correct,
        }

        print(request_to_adaptive_engine)

        response_from_adaptive_engine = requests.post(
            os.environ.get("ADAPTIVE_ENGINE_URL") + "/run-model-on-response/",
            json=request_to_adaptive_engine,
        )

        print(response)

        response.save()
        return Response(status=status.HTTP_201_CREATED)


class PossibleAnswersViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = PossibleAnswersSerializer
    queryset = PossibleAnswers.objects.all()

    def get_queryset(self):
        queryset = PossibleAnswers.objects.all()
        return queryset


class SkillViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = SkillSerializer
    queryset = Skill.objects.all()

    def get_queryset(self):
        queryset = Skill.objects.all()
        return queryset

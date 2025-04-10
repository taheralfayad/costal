import os
import requests
import datetime
import json
import random
from django.utils import timezone
from canvasapi import Canvas
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError, NotFound
from rest_framework.parsers import MultiPartParser, FormParser
from lti.oauth.auth_utils import refresh_access_token


from qgservice.engine import LLMEngine  # Import LLM service

from lti.models import (
    Assignment,
    Prequiz,
    CanvasUser,
    Course,
    Textbook,
    Question,
    PossibleAnswer,
    Skill,
    Module,
    AssignmentAttempt,
    QuestionAttempt,
)

from lti.serializers import (
    AssignmentSerializer,
    AssignmentAttemptSerializer,
    QuestionAttemptSerializer,
    QuestionSerializer,
    TextbookSerializer,
    PossibleAnswerSerializer,
    PrequizSerializer,
    SkillSerializer,
    ModuleSerializer,
    CourseSerializer,
)

llm_service = LLMEngine()


def get_assignment_completion_percentage(assignment, user):
    total_questions = assignment.questions.count()
    completed_questions = 0

    for question in assignment.questions.all():
        q_attempts = QuestionAttempt.objects.filter(
            user=user,
            associated_assignment=assignment,
            associated_question=question,
        )
        success = q_attempts.filter(grade_for_question_attempt__gt=0).exists()
        fail = q_attempts.filter(grade_for_question_attempt=0).count() >= 3

        if success or fail:
            completed_questions += 1

    if total_questions == 0:
        return 0  # Avoid division by zero, or maybe return 100%

    percentage = (completed_questions / total_questions) * 100
    return round(percentage, 2)  # Round to 2 decimal places


def check_if_assignment_is_completed(assignment, user):
    completed = True

    for question in assignment.questions.all():
        q_attempts = QuestionAttempt.objects.filter(
            user=user,
            associated_assignment=assignment,
            associated_question=question,
        )
        success = q_attempts.filter(grade_for_question_attempt__gt=0).exists()
        fail = q_attempts.filter(grade_for_question_attempt=0).count() >= 3

        if not success or fail:
            completed = False
            break

    return completed


def get_valid_random_question(assignment, user):
    all_questions = assignment.questions.all()

    valid_question_ids = []

    for question in all_questions:
        attempts = QuestionAttempt.objects.filter(
            user=user, associated_assignment=assignment, associated_question=question
        )

        correct_attempt_exists = attempts.filter(
            grade_for_question_attempt__gt=0
        ).exists()
        failed_attempts_count = attempts.filter(grade_for_question_attempt=0).count()

        if not correct_attempt_exists and failed_attempts_count < 3:
            valid_question_ids.append(question.id)

    if not valid_question_ids:
        return None

    # Pick random question
    random_question_id = random.choice(valid_question_ids)
    return assignment.questions.get(id=random_question_id)


def add_assignment_to_canvas(course_id, assignment, api_key):
    try:
        canvas = Canvas(os.environ.get("CANVAS_URL"), api_key)
        course = canvas.get_course(course_id)

        created_assignment = course.create_assignment(
            {
                "name": assignment.name,
                "points_possible": 100,
                "due_at": assignment.end_date,
                "description": "This assignment has been automatically created by COSTAL.",
                "submission_types": ["external_tool"],
                "published": True,
            }
        )

        assignment.canvas_id = created_assignment.id
        assignment.save()

    except Exception as e:
        print(f"Error creating assignment: {assignment.name} in Canvas: {e}")


def update_assignment_in_canvas(course_id, assignment, api_key):
    try:
        canvas = Canvas(os.environ.get("CANVAS_URL"), api_key)
        course = canvas.get_course(course_id)

        canvas_assignment = course.get_assignment(assignment.canvas_id)
        update_params = {}

        if canvas_assignment.name != assignment.name:
            update_params["name"] = assignment.name

        if canvas_assignment.due_at != assignment.end_date:
            update_params["due_at"] = assignment.end_date

        if update_params:
            canvas_assignment.edit(assignment=update_params)

    except Exception as e:
        print(f"Error updating assignment: {assignment.name} in Canvas: {e}")


def submit_grade_to_canvas(request, course_id, assignment, api_key, grade, student_id):
    prof_token = get_professor_access_token(request, course_id, api_key)

    if not prof_token:
        print(
            f"No professor found in course {course_id}. Not submitting grade to Canvas"
        )
        return

    try:
        canvas = Canvas(os.environ.get("CANVAS_URL"), prof_token)
        course = canvas.get_course(course_id)

        canvas_assignment = course.get_assignment(assignment.canvas_id)
        canvas_assignment.submit(
            submission={
                "user_id": student_id,
                "submission_type": "basic_lti_launch",
                "url": "https://localhost/lti/login",
            }
        )
        submission = canvas_assignment.get_submission(student_id)
        submission.edit(submission={"posted_grade": str(grade)})

    except Exception as e:
        print(
            f"Error submitting grade for assignment: {assignment.name} in Canvas: {e}"
        )


def get_professor_access_token(request, course_id, api_key):
    try:
        canvas = Canvas(os.environ.get("CANVAS_URL"), api_key)
        course = canvas.get_course(course_id)
        users = course.get_users(enrollment_type=["teacher"])
        if not users:
            print("No teachers found", flush=True)
            return None

        prof_usr_obj = CanvasUser.objects.get(uid=users[0].id)
        new_token, new_exp = refresh_access_token(request, prof_usr_obj)

        if not new_token:
            print("Failed to refresh access token.")
            return None

        return new_token

    except Exception as e:
        print(f"Error getting professor ID: in Canvas: {e}")
        return None


def get_professor_id(course_id):
    course = Course.objects.get(course_id=course_id)
    teachers = course.teachers.all()

    if not teachers:
        print("No teachers found")
        return None

    return teachers[0].uid


def delete_assignment_from_canvas(course_id, assignment, api_key):
    try:
        canvas = Canvas(os.environ.get("CANVAS_URL"), api_key)
        course = canvas.get_course(course_id)

        canvas_assignment = course.get_assignment(assignment.canvas_id)
        canvas_assignment.delete()
    except Exception as e:
        print(f"Error deleting assignment: {assignment.name} in Canvas: {e}")


class TextbookViewSet(viewsets.ModelViewSet):
    """ViewSet for managing textbooks"""

    serializer_class = TextbookSerializer
    queryset = Textbook.objects.all()
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = Textbook.objects.all()
        return queryset

    @action(detail=False, methods=["get"], url_path="course/(?P<course_id>[^/.]+)")
    def get_by_course(self, request, course_id=None):
        textbooks = Textbook.objects.filter(course=course_id)
        serializer = self.get_serializer(textbooks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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

    def create(self, request, *args, **kwargs):
        print(">>> Incoming request.data:", request.data)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)  # 👈 This shows the problem
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CourseViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = CourseSerializer
    queryset = Course.objects.all()

    def get_queryset(self):
        queryset = Course.objects.all()
        return queryset

    @action(
        detail=False, methods=["get"], url_path="get_course_by_id/(?P<course_id>[^/.]+)"
    )
    def get_course_by_id(self, request, course_id=None):
        try:
            course = Course.objects.get(course_id=course_id)
            course_data = CourseSerializer(course).data
            course_data["deadline"] = course.deadline

            return Response(course_data, status=status.HTTP_200_OK)
        except Course.DoesNotExist:
            return Response(
                {"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(
        detail=False, methods=["post"], url_path="edit_settings/(?P<course_id>[^/.]+)"
    )
    def edit_settings(self, request, course_id=None):
        data = request.data
        course = Course.objects.get(course_id=course_id)

        if "partial_completion" in data:
            course.partial_completion = data["partial_completion"] == "true"
        if "late_completion" in data:
            course.late_completion = data["late_completion"] == "true"
        if "deadline" in data:
            course.deadline = data["deadline"]
        if "penalty" in data:
            course.penalty = data["penalty"]

        course.save()
        return Response(
            {"message": "Course updated successfully"}, status=status.HTTP_200_OK
        )


# Need an endpoint to create assignments
class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = AssignmentSerializer
    queryset = Assignment.objects.all()

    def get_queryset(self):
        queryset = Assignment.objects.all()
        return queryset

    @action(detail=False, methods=["get"], url_path="get_weekly_homework_average")
    def get_weekly_homework_average(self, request):
        course_id = request.query_params.get("course_id")
        today = timezone.now()
        start_of_week = today - datetime.timedelta(days=today.weekday())
        end_of_week = start_of_week + datetime.timedelta(days=6)

        weekly_homework = Assignment.objects.filter(
            course_id=course_id,
            start_date__gte=start_of_week,
            end_date__lte=end_of_week,
            assessment_type="Homework",
        )

        if not weekly_homework.exists():
            return Response(
                {
                    "message": "No homework assignments found for this week",
                    "average_grade": 0,
                },
                status=status.HTTP_200_OK,
            )

        result = []

        for assignment in weekly_homework:
            attempts = AssignmentAttempt.objects.filter(
                associated_assignment=assignment
            )
            assignment_questions = assignment.questions.all()
            assignment_total_points = sum(
                question.num_points for question in assignment_questions
            )
            student_grades = []
            if attempts.exists() and assignment_total_points > 0:
                for attempt in attempts:
                    student_grades.append(attempt.total_grade / assignment_total_points)

                assignment_average = sum(student_grades) / len(student_grades)
            else:
                assignment_average = 0

            result.append(
                {
                    "assignment_id": assignment.id,
                    "name": assignment.name,
                    "grade": int(assignment_average * 100),
                }
            )

        overall_average_grade = (
            0  # total_grade / total_attempts if total_attempts > 0 else 0
        )

        print(overall_average_grade)

        return Response(
            {"overall_average_grade": overall_average_grade, "assignments": result},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="get_overall_grade")
    def get_overall_grade(self, request):
        course_id = request.query_params.get("course_id")
        type = request.query_params.get("type")

        assignments = Assignment.objects.filter(assessment_type=type)
        current_total_assignments = assignments.count()
        total_assignments = Assignment.objects.filter(
            course_id=course_id, assessment_type=type
        ).count()

        result = []

        for assignment in assignments:
            attempts = AssignmentAttempt.objects.filter(
                associated_assignment=assignment
            )
            assignment_questions = assignment.questions.all()
            assignment_total_points = sum(
                question.num_points for question in assignment_questions
            )
            student_grades = []
            if attempts.exists() and assignment_total_points > 0:
                for attempt in attempts:
                    student_grades.append(attempt.total_grade / assignment_total_points)
                    result.append(
                        {
                            "assignment_id": assignment.id,
                            "name": assignment.name,
                            "grade": int(
                                (attempt.total_grade / assignment_total_points) * 100
                            ),
                        }
                    )

        overall_average_grade = (
            sum(assignment["grade"] for assignment in result) / len(result)
            if len(result) > 0
            else 0
        )

        return Response(
            {
                "overall_average_grade": int(overall_average_grade),
                "assignments": result,
                "current_total_assignments": current_total_assignments,
                "total_assignments": total_assignments,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="get_assignment_by_id/(?P<assignment_id>[^/.]+)",
    )
    def get_assignment_by_id(self, request, assignment_id=None):
        try:
            assignment = Assignment.objects.get(id=assignment_id)
            questions = assignment.questions.all()
            assignment_serializer = AssignmentSerializer(assignment)
            questions_serializer = QuestionSerializer(questions, many=True)

            data = assignment_serializer.data
            data["questions"] = questions_serializer.data
            total_points = sum(
                question["num_points"] for question in questions_serializer.data
            )
            data["total_points"] = total_points

            return Response(data, status=status.HTTP_200_OK)
        except Assignment.DoesNotExist:
            return Response(
                {"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["get"], url_path="get_course_assignments")
    def get_course_assignments(self, request):
        try:
            course_id = request.query_params.get("course_id")
            assignments = Assignment.objects.filter(course_id=course_id)
            serializer = AssignmentSerializer(assignments, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)
        except Assignment.DoesNotExist:
            return Response(
                {"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except IndexError:
            return Response(
                {"error": "No assignments found for this course"},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=False, methods=["post"], url_path="create_assignment")
    def create_assignment(self, request):
        data = request.data

        start_date = datetime.datetime.strptime(data["start_date"], "%Y-%m-%dT%H:%M")
        end_date = datetime.datetime.strptime(data["end_date"], "%Y-%m-%dT%H:%M")

        course_id, module_id = data["course_id"], data["module_id"]
        canvas_api_key = request.session["api_key"]
        course = Course.objects.get(course_id=course_id)
        module = Module.objects.get(id=module_id)

        assignment = Assignment(
            name=data["name"],
            course=course,
            start_date=start_date,
            end_date=end_date,
            assessment_type=data["assessment_type"],
            associated_module=module,
        )
        add_assignment_to_canvas(course_id, assignment, canvas_api_key)

        assignment.save()
        module.assignments.add(assignment)
        return Response(
            {"message": "Assignment created successfully"},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], url_path="get_prequiz/(?P<module_id>[^/.]+)")
    def get_prequiz(self, request, module_id=None):
        module = Module.objects.get(id=module_id)
        prequiz = module.prequiz

        if prequiz:
            prequiz_serializer = PrequizSerializer(prequiz)
            return Response(prequiz_serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {"message": "No prequiz found for this module"},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=False, methods=["post"], url_path="create_prequiz")
    def create_prequiz(self, request):
        data = request.data

        start_date = datetime.datetime.strptime(data["start_date"], "%Y-%m-%dT%H:%M")
        end_date = datetime.datetime.strptime(data["end_date"], "%Y-%m-%dT%H:%M")

        course = Course.objects.get(course_id=data["course_id"])
        module = Module.objects.get(id=data["module_id"])

        prequiz = Prequiz(
            name=data["name"],
            course=course,
            start_date=start_date,
            end_date=end_date,
            assessment_type=data["assessment_type"],
            associated_module=module,
        )

        prequiz.save()
        module.prequiz = prequiz
        module.save()
        return Response(
            {"message": "Prequiz created successfully"},
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="edit_assignment/(?P<assignment_id>[^/.]+)",
    )
    def edit_assignment(self, request, assignment_id=None):
        data = request.data
        assignment = Assignment.objects.get(id=assignment_id)

        if "name" in data:
            assignment.name = data["name"]
        if "start_date" in data:
            assignment.start_date = datetime.datetime.strptime(
                data["start_date"], "%Y-%m-%dT%H:%M"
            )
        if "end_date" in data:
            assignment.end_date = datetime.datetime.strptime(
                data["end_date"], "%Y-%m-%dT%H:%M"
            )
        if "assessment_type" in data:
            assignment.assessment_type = data["assessment_type"]

        assignment.save()
        if assignment.assessment_type != "prequiz":
            update_assignment_in_canvas(
                assignment.course_id, assignment, request.session["api_key"]
            )

        return Response(
            {"message": "Assignment updated successfully"}, status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["post"], url_path="add_question")
    def add_question(self, request):

        data = request.data
        assignment = Assignment.objects.get(id=data["assignment_id"])
        question = Question.objects.get(id=data["question_id"])
        assignment.questions.add(question)
        assignment.save()
        serializer = AssignmentSerializer(assignment)

        if assignment.assessment_type == "Homework":
            request_to_adaptive_engine = {
                "question_id": question.id,
                "assignment_id": assignment.id,
                "course_id": assignment.course_id,
            }

            requests.post(
                os.environ.get("ADAPTIVE_ENGINE_URL") + "/add-arm-to-mab/",
                json=request_to_adaptive_engine,
            )

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="delete_assignment")
    def delete_assignment(self, request):
        data = request.data
        assignment = Assignment.objects.get(id=data["assignment_id"])
        assignment.delete()

        if assignment.assessment_type != "prequiz":
            delete_assignment_from_canvas(
                assignment.course_id, assignment, request.session["api_key"]
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=False,
        methods=["get"],
        url_path="get_current_assignment_attempt/(?P<assignment_id>[^/.]+)",
    )
    def get_current_assignment_attempt(self, request, assignment_id=None):
        user_id = request.query_params.get("user_id")

        user = get_object_or_404(CanvasUser, uid=user_id)
        assignment = get_object_or_404(Assignment, id=assignment_id)

        assignment_attempt = AssignmentAttempt.objects.filter(
            associated_assignment=assignment, user=user
        )

        if not assignment_attempt.exists():
            assignment_attempt = AssignmentAttempt(
                user=user, associated_assignment=assignment
            )
            assignment_attempt.save()
        else:
            assignment_attempt = assignment_attempt.first()

        assignment_attempt_serializer = AssignmentAttemptSerializer(assignment_attempt)

        total_assignment_points = sum(
            question.num_points for question in assignment.questions.all()
        )

        data = assignment_attempt_serializer.data
        data["possible_points"] = total_assignment_points

        return Response(data, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        url_path="student_has_completed_prequizzes/(?P<user_id>[^/.]+)",
    )
    def student_has_completed_prequizzes(self, request, user_id=None):
        user = CanvasUser.objects.get(uid=user_id)
        course_id = request.query_params.get("course_id")
        course = Course.objects.get(course_id=course_id)
        course_modules = Module.objects.filter(course=course)

        modules_with_completed_prequizzes = []

        for module in course_modules:
            prequiz = module.prequiz
            if prequiz:
                assignment_attempt = AssignmentAttempt.objects.filter(
                    user=user, associated_assignment=prequiz
                )
                if (
                    assignment_attempt.exists()
                    and assignment_attempt.first().status == 2
                ):
                    modules_with_completed_prequizzes.append(module.id)

        return Response(modules_with_completed_prequizzes, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        url_path="get_mastery_level_per_objective/(?P<user_id>[^/.]+)",
    )
    def get_mastery_level_per_objective(self, request, user_id=None):
        user = CanvasUser.objects.get(uid=user_id)
        assignment_id = request.query_params.get("assignment_id")
        assignment = Assignment.objects.get(id=assignment_id)

        assignment_objectives = assignment.questions.values_list(
            "associated_skill", flat=True
        ).distinct()

        mastery = {}

        for objective in assignment_objectives:
            request_to_adaptive_engine = {
                "user_id": user.id,
                "course_id": assignment.course_id,
                "module_id": assignment.associated_module.id,
                "skill_name": objective,
            }

            response_from_adaptive_engine = requests.post(
                os.environ.get("ADAPTIVE_ENGINE_URL") + "/get-mastery-level/",
                json=request_to_adaptive_engine,
            )

            response = response_from_adaptive_engine.json()

            if response_from_adaptive_engine.status_code == 200:
                if "message" in response and response["message"] == "Model not found":
                    return Response(
                        {"message": "No data found for module"},
                        status=status.HTTP_200_OK,
                    )
                else:
                    mastery[objective] = response["mastery"]

        return Response(mastery, status=status.HTTP_200_OK)


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = QuestionSerializer
    queryset = Question.objects.all()

    def get_queryset(self):
        queryset = Question.objects.all()
        return queryset

    @action(
        detail=False,
        methods=["get"],
        url_path="possible_answer_is_correct/(?P<possible_answer_id>[^/.]+)",
    )
    def possible_answer_is_correct(self, request, possible_answer_id=None):
        possible_answer = PossibleAnswer.objects.get(id=possible_answer_id)
        return Response(
            {"is_correct": possible_answer.is_correct}, status=status.HTTP_200_OK
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="get_question_by_id/(?P<question_id>[^/.]+)",
    )
    def get_question_by_id(self, request, question_id=None):
        try:
            question = Question.objects.get(id=question_id)
            question_serializer = QuestionSerializer(question)

            return Response(question_serializer.data, status=status.HTTP_200_OK)
        except Question.DoesNotExist:
            return Response(
                {"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=["post"], url_path="delete_question")
    def delete_question(self, request):
        data = request.data
        question = Question.objects.get(id=data["question_id"])
        assignment = question.assignments.first()

        request_to_adaptive_engine = {
            "question_id": question.id,
            "assignment_id": assignment.id,
            "course_id": question.assignments.first().course_id,
        }

        if assignment.assessment_type == "Homework":
            requests.post(
                os.environ.get("ADAPTIVE_ENGINE_URL") + "/delete-arm-from-mab/",
                json=request_to_adaptive_engine,
            )

        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["post"], url_path="delete_question_from_assignment")
    def delete_question_from_assignment(self, request):
        data = request.data
        try:
            assignment = Assignment.objects.get(id=data["assignment_id"])
            question = Question.objects.get(id=data["question_id"])

            if question in assignment.questions.all():
                assignment.questions.remove(question)
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response(
                    {"error": "Question not found in the assignment"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Assignment.DoesNotExist:
            return Response(
                {"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Question.DoesNotExist:
            return Response(
                {"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(
        detail=False, methods=["post"], url_path="edit_question/(?P<question_id>[^/.]+)"
    )
    def edit_question(self, request, question_id):
        data = request.data
        question = Question.objects.get(id=question_id)

        skill = Skill.objects.get(id=data["skill_id"])

        if "name" in data:
            question.name = data["name"]
        if "text" in data:
            question.text = data["text"]
        if "explanation" in data:
            question.explanation = data["explanation"]
        if "difficulty" in data:
            difficulty_map = {"easy": 1, "medium": 2, "hard": 3}

            difficulty = difficulty_map[data["difficulty"].lower()]
            question.difficulty = difficulty
        if "type" in data:
            question.type = data["type"]
        if "num_points" in data:
            question.num_points = data["num_points"]
        if skill:
            question.associated_skill = skill
        if "possible_answers" in data:
            possible_answers = json.loads(data["possible_answers"])
            question.possible_answers.set([])

            for answer in possible_answers:
                possible_answer = PossibleAnswer(
                    answer=answer["possible_answer"],
                    is_correct=answer["is_correct"],
                    related_question=question,
                )
                possible_answer.save()
                question.possible_answers.add(possible_answer)

        question.save()
        return Response(
            {"message": "Assignment updated successfully"}, status=status.HTTP_200_OK
        )

    @action(detail=False, methods=["post"], url_path="generate_hint")
    def generate_hint(self, request):
        try:
            question_text = request.data.get("question_text")
            question_answer_choices = request.data.get("question_answer_choices")
            if not question_text:
                return Response(
                    {"error": "Missing 'question' text."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            hint = llm_service.generate_hint(question_text, question_answer_choices)
            return Response({"hint": hint}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["post"], url_path="create_question")
    def create_question(self, request):
        data = request.data

        skill = Skill.objects.get(id=data["skill_id"])

        difficulty_map = {"easy": 1, "medium": 2, "hard": 3}

        difficulty = difficulty_map[data["difficulty"].lower()]

        question = Question(
            name=data["name"],
            text=data["text"],
            difficulty=difficulty,
            type=data["type"],
            num_points=data["points"],
            associated_skill=skill,
            explanation=data["explanation"],
        )

        question.save()

        try:
            assignment = Assignment.objects.get(id=data["assignment_id"])
            question.assignments.add(assignment)
            assignment.questions.add(question)
        except Assignment.DoesNotExist:
            return Response(
                {
                    "error": f"Assignment with ID {data['assignment_id']} does not exist."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if assignment.assessment_type == "Homework":
            request_to_adaptive_engine = {
                "question_id": question.id,
                "assignment_id": assignment.id,
                "course_id": assignment.course_id,
            }

            requests.post(
                os.environ.get("ADAPTIVE_ENGINE_URL") + "/add-arm-to-mab/",
                json=request_to_adaptive_engine,
            )

        possible_answers = json.loads(data["possible_answers"])

        for answer in possible_answers:
            possible_answer = PossibleAnswer(
                answer=answer["possible_answer"],
                is_correct=answer["is_correct"],
                related_question=question,
            )
            possible_answer.save()
            question.possible_answers.add(possible_answer)

        return Response(status=status.HTTP_201_CREATED)

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
                possible_answer = PossibleAnswer.objects.create(
                    possible_answer=answer["possible_answer"],
                    is_correct=answer["is_correct"],
                    related_question=question,
                )
                possible_answer.save()
                question.possible_answers.add(possible_answer)

            question.save()

        return Response(status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="generate_question")
    def generate_question(self, request):
        try:
            data = request.data
            print(data)
            course_name = data.get("course_name")
            text = data.get("text")
            num_questions = int(data.get("num_questions", 1))
            previous_questions = data.get("previous_questions", [])

            if not course_name or not text:
                return Response(
                    {"error": "course_name and text are required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            questions_json = llm_service.generate_questions(
                course_name=course_name,
                topic=text,
                num_questions=num_questions,
                previous_questions=previous_questions,
            )

            return Response(json.loads(questions_json), status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["post"], url_path="answer_question")
    def answer_question(self, request):
        data = request.data
        assignment = Assignment.objects.get(id=data["assignment_id"])
        user = CanvasUser.objects.get(uid=data["user_id"])
        question = Question.objects.get(id=data["question_id"])
        number_of_seconds_to_answer = int(data["number_of_seconds_to_answer"])
        assignment_attempt = AssignmentAttempt.objects.get(
            id=data["assignment_attempt_id"]
        )
        number_of_hints = 0  # TODO: track the number of hints

        if "answer_choice" in data:
            answer_choice = PossibleAnswer.objects.get(id=data["answer_choice"])
        else:
            answer_choice = None
            answer_text = data["answer_text"]
            possible_answers = question.possible_answers.all()

            for possible_answer in possible_answers:
                if possible_answer.answer == answer_text:
                    answer_choice = possible_answer
                    break

            if answer_choice is None:
                # Will not be adding a related question since this is a custom answer
                # This allows PossibleAnswer to be reusable for both multiple choice and custom
                answer_choice = PossibleAnswer(answer=answer_text, is_correct=False)
                answer_choice.save()

        response = QuestionAttempt(
            user=user,
            associated_question=question,
            associated_assignment=assignment,
            associated_assignment_attempt=assignment_attempt,
            time_spent_on_question=number_of_seconds_to_answer,
            grade_for_question_attempt=(
                question.num_points if answer_choice.is_correct else 0
            ),
            associated_possible_answer=answer_choice,
            number_of_hints=number_of_hints,
        )

        response.save()

        assignment_attempt.attempted_questions.add(response)
        assignment_attempt.total_time_spent += response.time_spent_on_question
        assignment_attempt.total_grade += (
            question.num_points if answer_choice.is_correct else 0
        )

        request_to_adaptive_engine = {
            "user_id": user.id,
            "course_id": assignment.course_id,
            "assignment_id": assignment.id,
            "skill_name": question.associated_skill.id,
            "correct": answer_choice.is_correct,
            "difficulty": question.difficulty,
            "hints_used": number_of_hints,
            "seconds_taken": number_of_seconds_to_answer,
            "module_id": assignment.associated_module.id,
            "question_id": question.id,
        }

        response_from_adaptive_engine = requests.post(
            os.environ.get("ADAPTIVE_ENGINE_URL") + "/run-model-on-response/",
            json=request_to_adaptive_engine,
        )

        next_question_id = response_from_adaptive_engine.json()["next_question"]
        next_question = Question.objects.get(id=next_question_id)

        question_attempts = QuestionAttempt.objects.filter(
            user=user,
            associated_assignment=assignment,
            associated_question=next_question,
        )

        successful_attempt = question_attempts.filter(
            grade_for_question_attempt__gt=0
        ).exists()
        failed_attempts = (
            question_attempts.filter(grade_for_question_attempt=0).count() >= 3
        )

        assignment_completion_percentage = get_assignment_completion_percentage(
            assignment, user
        )

        if check_if_assignment_is_completed(assignment, user):
            course = assignment.course

            print(course.__dict__)

            if course.deadline == "WEEK" or course.deadline == "MONTH":
                current_date = timezone.now()
                end_date = assignment.end_date
                if current_date > end_date:
                    assignment_attempt.total_grade -= (
                        assignment_attempt.total_grade * float(course.penalty)
                    )
                    assignment_attempt.save()

            assignment_attempt.status = 2
            assignment_attempt.save()

            if assignment.assessment_type != "prequiz":
                total_assignment_grade = sum(
                    question.num_points for question in assignment.questions.all()
                )
                grade = assignment_attempt.total_grade / total_assignment_grade * 100
                submit_grade_to_canvas(
                    request,
                    assignment.course_id,
                    assignment,
                    request.session["api_key"],
                    int(grade),
                    data["user_id"],
                )

            return Response(
                {
                    "message": "Assignment completed",
                    "assessment_status": "completed",
                    "is_correct": answer_choice.is_correct,
                },
                status=status.HTTP_200_OK,
            )

        elif successful_attempt or failed_attempts:
            random_question = get_valid_random_question(assignment, user)
            if random_question is None:
                if assignment.assessment_type != "prequiz":
                    total_assignment_grade = sum(
                        question.num_points for question in assignment.questions.all()
                    )
                    grade = (
                        assignment_attempt.total_grade / total_assignment_grade * 100
                    )
                    submit_grade_to_canvas(
                        request,
                        assignment.course_id,
                        assignment,
                        request.session["api_key"],
                        int(grade),
                        data["user_id"],
                    )
                course = assignment.course
                if course.deadline == "WEEK" or course.deadline == "MONTH":
                    current_date = timezone.now()
                    end_date = assignment.end_date
                    if current_date > end_date:
                        assignment_attempt.total_grade -= (
                            assignment_attempt.total_grade * float(course.penalty)
                        )
                        assignment_attempt.save()
                assignment_attempt.status = 2
                assignment_attempt.save()
                return Response(
                    {
                        "message": "No more questions to ask",
                        "assessment_status": "completed",
                        "is_correct": answer_choice.is_correct,
                    },
                    status=status.HTTP_200_OK,
                )
            assignment_attempt.current_question_attempt = random_question
            assignment_attempt.save()
            question_serializer = QuestionSerializer(random_question)
            objective = Skill.objects.get(id=random_question.associated_skill.id)
            skill_serializer = SkillSerializer(objective)
            question_data = question_serializer.data.copy()
            question_data["associated_skill"] = skill_serializer.data

            assignment_attempt.current_question_attempt = next_question
            assignment_attempt.completion_percentage = assignment_completion_percentage
            assignment_attempt.save()
            data = {
                "question": question_data,
                "assignment_completion_percentage": assignment_completion_percentage,
                "is_correct": answer_choice.is_correct,
            }

            return Response(data, status=status.HTTP_200_OK)

        question_serializer = QuestionSerializer(next_question)
        objective = Skill.objects.get(id=next_question.associated_skill.id)
        skill_serializer = SkillSerializer(objective)
        question_data = question_serializer.data.copy()
        question_data["associated_skill"] = skill_serializer.data

        assignment_attempt.current_question_attempt = next_question
        assignment_attempt.completion_percentage = assignment_completion_percentage
        assignment_attempt.save()

        data = {
            "question": question_data,
            "assignment_completion_percentage": assignment_completion_percentage,
            "is_correct": answer_choice.is_correct,
        }

        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="answer_quiz_question")
    def answer_quiz_question(self, request):
        data = request.data
        assignment = Assignment.objects.get(id=data["assignment_id"])
        assignment_attempt = AssignmentAttempt.objects.get(
            id=data["assignment_attempt_id"]
        )
        user = CanvasUser.objects.get(uid=data["user_id"])
        question = Question.objects.get(id=data["question_id"])

        if "answer_choice" in data:
            answer_choice = PossibleAnswer.objects.get(id=data["answer_choice"])
        else:
            answer_choice = None
            answer_text = data["answer_text"]
            possible_answers = question.possible_answers.all()

            for possible_answer in possible_answers:
                if possible_answer.answer == answer_text:
                    answer_choice = possible_answer
                    break

            if answer_choice is None:
                # Will not be adding a related question since this is a custom answer
                # This allows PossibleAnswer to be reusable for both multiple choice/custom
                answer_choice = PossibleAnswer(answer=answer_text, is_correct=False)
                answer_choice.save()

        number_of_seconds_to_answer = int(data["number_of_seconds_to_answer"])

        question_attempt = QuestionAttempt(
            user=user,
            associated_question=question,
            associated_assignment=assignment,
            associated_assignment_attempt=assignment_attempt,
            time_spent_on_question=number_of_seconds_to_answer,
            grade_for_question_attempt=question.num_points,
            associated_possible_answer=answer_choice,
            number_of_hints=0,  # TODO: track the number of hints
        )

        question_attempt.save()

        assignment_attempt.attempted_questions.add(question_attempt)
        assignment_attempt.total_time_spent += question_attempt.time_spent_on_question
        assignment_attempt.total_grade += (
            question.num_points if answer_choice.is_correct else 0
        )

        assignment_attempt.save()
        request_to_adaptive_engine = {
            "user_id": user.id,
            "course_id": assignment.course_id,
            "module_id": assignment.associated_module.id,
            "skill_name": question.associated_skill.id,
            "correct": answer_choice.is_correct,
        }

        requests.post(
            os.environ.get("ADAPTIVE_ENGINE_URL") + "/fit-model/",
            json=request_to_adaptive_engine,
        )

        # Return a question that has not already been attempted
        attempted_question_ids = assignment_attempt.attempted_questions.values_list(
            "associated_question__id", flat=True
        )

        # Filter questions for this assignment, exclude already attempted
        next_question = (
            Question.objects.filter(
                assignments=assignment_attempt.associated_assignment
            )
            .exclude(id__in=attempted_question_ids)
            .first()
        )

        # If there are no more questions to ask, return a message
        if next_question is None:
            course = assignment.course

            if course.deadline == "WEEK" or course.deadline == "MONTH":
                current_date = timezone.now()
                end_date = assignment.end_date
                if current_date > end_date:
                    print(course.penalty)
                    assignment_attempt.total_grade -= (
                        assignment_attempt.total_grade * float(course.penalty)
                    )
                    print(assignment_attempt.total_grade)
                    assignment_attempt.save()

            assignment_attempt.status = 2
            assignment_attempt.current_question_attempt = None
            assignment_attempt.save()
            return Response(
                {
                    "message": "No more questions to ask",
                    "assessment_status": "completed",
                },
                status=status.HTTP_200_OK,
            )

        assignment_attempt.current_question_attempt = next_question
        assignment_attempt.save()

        question_serializer = QuestionSerializer(next_question)
        objective = Skill.objects.get(id=next_question.associated_skill.id)
        skill_serializer = SkillSerializer(objective)
        question_data = question_serializer.data.copy()
        question_data["associated_skill"] = skill_serializer.data

        assignment_completion_percentage = get_assignment_completion_percentage(
            assignment, user
        )

        assignment_attempt.current_question_attempt = next_question
        assignment_attempt.completion_percentage = assignment_completion_percentage
        assignment_attempt.save()

        data = {
            "question": question_data,
            "assignment_completion_percentage": assignment_completion_percentage,
        }

        return Response(data, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        url_path="get_first_question_for_assignment/(?P<assignment_id>[^/.]+)",
    )
    def get_first_question_for_assignment(self, request, assignment_id=None):
        assignment_attempt_id = request.query_params.get("assignment_attempt_id")

        assignment = Assignment.objects.get(id=assignment_id)
        assignment_attempt = AssignmentAttempt.objects.get(id=assignment_attempt_id)

        question = None

        if assignment_attempt.status == 0 or assignment_attempt.status == 2:
            question = assignment.questions.order_by("?").first()
            assignment_attempt.current_question_attempt = question
            assignment_attempt.status = 1

            assignment_attempt.save()
        else:
            question = assignment_attempt.current_question_attempt

        objective = Skill.objects.get(id=question.associated_skill.id)

        question_serializer = QuestionSerializer(question)

        skill_serializer = SkillSerializer(objective)
        question_data = question_serializer.data.copy()
        question_data["associated_skill"] = skill_serializer.data

        return Response(question_data, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        url_path="retrieve_question_attempts/(?P<assignment_id>[^/.]+)",
    )
    def retrieve_question_attempts(self, request, assignment_id=None):
        assignment = Assignment.objects.get(id=assignment_id)
        user_id = request.query_params.get("user_id")

        user = CanvasUser.objects.get(uid=user_id)

        question_attempts = QuestionAttempt.objects.filter(
            user=user, associated_assignment=assignment
        )

        serializer = QuestionAttemptSerializer(question_attempts, many=True)

        data = serializer.data

        data = data.copy()

        for question_attempt in data:
            question = Question.objects.get(id=question_attempt["associated_question"])
            question_serializer = QuestionSerializer(question)
            question_attempt["associated_question"] = question_serializer.data

        for question_attempt in data:
            possible_answer = PossibleAnswer.objects.get(
                id=question_attempt["associated_possible_answer"]
            )
            possible_answer_serializer = PossibleAnswerSerializer(possible_answer)
            question_attempt["associated_possible_answer"] = (
                possible_answer_serializer.data
            )
            question_attempt["associated_possible_answer"][
                "is_correct"
            ] = possible_answer.is_correct

        return Response(data, status=status.HTTP_200_OK)


class PossibleAnswersViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = PossibleAnswerSerializer
    queryset = PossibleAnswer.objects.all()

    def get_queryset(self):
        queryset = PossibleAnswer.objects.all()
        return queryset


class ModuleViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = ModuleSerializer
    queryset = Module.objects.all()

    def get_queryset(self):
        queryset = Module.objects.all()
        return queryset

    @action(detail=False, methods=["post"], url_path="delete_module")
    def delete_module(self, request):
        try:
            data = request.data
            module = Module.objects.get(id=data["module_id"])
            module.delete()
            return Response(
                {"message": "Module deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Module.DoesNotExist:
            return Response(
                {"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,
        methods=["get"],
        url_path="get_modules_by_course_id/(?P<course_id>[^/.]+)",
    )
    def get_modules_by_course_id(self, request, course_id=None):
        try:
            response = []

            modules = Module.objects.filter(course_id=course_id)

            for module in modules:
                module_response = {
                    "id": module.id,
                    "name": module.name,
                }

                if module.prequiz:
                    module_response["prequiz"] = {
                        "id": module.prequiz.id,
                        "is_valid": module.prequiz.is_valid(),
                        "missing_skills": SkillSerializer(
                            module.prequiz.missing_skills(), many=True
                        ).data,
                    }

                if module.skills.exists():
                    module_response["skills"] = SkillSerializer(
                        module.skills.all(), many=True
                    ).data

                module_response["rows"] = []

                for assignment in module.assignments.all():
                    module_response["rows"].append(
                        {
                            "id": assignment.id,
                            "topic": assignment.name,
                            "start": assignment.start_date,
                            "end": assignment.end_date,
                            "assessment_type": assignment.assessment_type,
                        }
                    )

                response.append(module_response)

            return Response(response, status=status.HTTP_200_OK)
        except Module.DoesNotExist:
            return Response(
                {"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except IndexError:
            return Response(
                {"error": "No modules found for this course"},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(
        detail=False,
        methods=["post"],
        url_path="update_assignment_order/(?P<module_id>[^/.]+)",
    )
    def update_assignment_order(self, request, module_id=None):
        try:
            module = Module.objects.get(id=module_id)
            new_order = request.data["assignment_ids"]

            if not isinstance(new_order, list):
                return Response(
                    {"error": "Invalid format for assignment_ids"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            assignments = {
                assignment.id: assignment for assignment in module.assignments.all()
            }

            for index, assignment_id in enumerate(new_order):
                if assignment_id in assignments:
                    assignments[assignment_id].order = index
                    assignments[assignment_id].save()

            return Response(
                {"message": "Assignment order updated successfully"},
                status=status.HTTP_200_OK,
            )

        except Module.DoesNotExist:
            return Response(
                {"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,
        methods=["get"],
        url_path="get_modules_with_skills/(?P<course_id>[^/.]+)",
    )
    def get_modules_with_skills(self, request, course_id=None):
        try:
            response = []

            modules = Module.objects.filter(course_id=course_id)

            for module in modules:
                module_response = {
                    "id": module.id,
                    "name": module.name,
                }

                module_response["skills"] = []

                for skill in module.skills.all():
                    module_response["skills"].append(
                        {"id": skill.id, "name": skill.name}
                    )

                response.append(module_response)

            return Response(response, status=status.HTTP_200_OK)
        except Module.DoesNotExist:
            return Response(
                {"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except IndexError:
            return Response(
                {"error": "No modules found for this course"},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(
        detail=False,
        methods=["get"],
        url_path="get_questions_by_module/(?P<module_id>[^/.]+)/(?P<assignment_id>[^/.]+)?",
    )
    def get_questions_by_module(self, request, module_id=None, assignment_id=None):
        try:
            module = Module.objects.get(id=module_id)
            response = {
                "id": module.id,
                "name": module.name,
                "questions": [],
            }

            assignment_filter = None
            selected_question_ids = set()

            if assignment_id:
                assignment_filter = Assignment.objects.filter(id=assignment_id, associated_module=module).first()

                response['assignment_name'] = assignment_filter.name
                assignment_filter = Assignment.objects.filter(
                    id=assignment_id, associated_module=module
                ).first()
                response["assignment_name"] = assignment_filter.name
                if not assignment_filter:
                    return Response({"error": "Assignment not found in this module"}, status=status.HTTP_404_NOT_FOUND)
                selected_question_ids = set(assignment_filter.questions.values_list("id", flat=True))

            serializer = QuestionSerializer(module.prequiz.questions.all(), many=True)
            for question in serializer.data:
                question["is_selected"] = question["id"] in selected_question_ids
                response["questions"].append(question)
        
            for assignment in module.assignments.all():
                serializer = QuestionSerializer(assignment.questions.all(), many=True)
                for question in serializer.data:
                    question["is_selected"] = question["id"] in selected_question_ids
                    response["questions"].append(question)

            return Response(response, status=status.HTTP_200_OK)
        except Module.DoesNotExist:
            return Response(
                {"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], url_path="create_module")
    def create_module(self, request):
        data = request.data

        module = Module(name=data["name"], course_id=data["course_id"])

        module.save()
        return Response(status=status.HTTP_201_CREATED)

    @action(
        detail=False,
        methods=["post"],
        url_path="add_objective_to_module/(?P<module_id>[^/.]+)",
    )
    def add_objective_to_module(self, request, module_id=None):
        module = Module.objects.get(id=module_id)
        course_id = module.course.course_id

        objective = Skill(name=request.data["title"], course_id=course_id)

        objective.save()

        module.skills.add(objective)

        return Response(status=status.HTTP_200_OK)


class SkillViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = SkillSerializer
    queryset = Skill.objects.all()

    def get_queryset(self):
        queryset = Skill.objects.all()
        return queryset

    @action(detail=False, methods=["post"], url_path="delete_skill")
    def delete_skill(self, request):
        try:
            data = request.data
            skill = Skill.objects.get(id=data["skill_id"])
            skill.delete()
            return Response(
                {"message": "Skill deleted successfully"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except Skill.DoesNotExist:
            return Response(
                {"error": "Skill not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(
        detail=False,
        methods=["get"],
        url_path="get_skill_by_assignment_id/(?P<assignment_id>[^/.]+)",
    )
    def get_skill_by_assignment_id(self, request, assignment_id=None):
        try:
            module = Module.objects.filter(assignments__id=assignment_id).first()

            # If the assignment is not in the list of a module's assignments, then
            # it could also be its prequiz assignment
            if module is None:
                prequiz = Prequiz.objects.filter(id=assignment_id).first()
                if prequiz is not None:
                    module = prequiz.associated_module
                else:
                    return Response(
                        {
                            "error": "Assignment is neither a module assignment nor a prequiz"
                        },
                        status=status.HTTP_404_NOT_FOUND,
                    )

            assignment = Assignment.objects.get(id=assignment_id)
            questions = assignment.questions
            skill_serializer = SkillSerializer(module.skills, many=True)
            questions_serializer = QuestionSerializer(questions, many=True)
            for question in questions_serializer.data:
                for skill in skill_serializer.data:
                    if skill["id"] == question["associated_skill"]:
                        skill["questions"].append(question)
            return Response(skill_serializer.data, status=status.HTTP_200_OK)
        except Assignment.DoesNotExist:
            return Response(
                {"error": "Assignment not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except IndexError:
            return Response(
                {"error": "No questions found for this assignment"},
                status=status.HTTP_404_NOT_FOUND,
            )


class GetCourseProfessorName(APIView):
    """
    API endpoint to fetch the name(s) of professor(s) for a given course.
    """

    def get(self, request, *args, **kwargs):
        canvas = Canvas(os.environ.get("CANVAS_URL"), request.session["api_key"])
        course_id = request.query_params.get("course_id")
        if not course_id:
            raise ValidationError({"error": "course_id parameter is required."})

        try:
            # Fetch the course using Canvas API
            course = canvas.get_course(course_id)
            prof_id = get_professor_id(course_id)
            if not prof_id:
                return Response({"message": "No professors found for this course."})

            teacher = course.get_user(prof_id)
            if not teacher:
                return Response(
                    {
                        "message": "No professors found for this course.",
                        "professor": None,
                    }
                )

            return Response(
                {
                    "course_id": course_id,
                    "professor": teacher.name,
                    "start": course.start_at,
                    "end": course.end_at,
                }
            )

        except Exception as e:
            raise NotFound({"error": str(e)})

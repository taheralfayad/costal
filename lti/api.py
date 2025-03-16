import os
import requests
import datetime
import json

from canvasapi import Canvas
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError, NotFound


from lti.models import (
    Assignment,
    Prequiz,
    CanvasUser,
    Course,
    Textbook,
    Question,
    PossibleAnswer,
    Skill,
    Response as StudentResponse,
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
    SkillSerializer,
    ModuleSerializer,
    CourseSerializer,
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
            total_points = sum(question['num_points'] for question in questions_serializer.data)
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

        course = Course.objects.get(course_id=data["course_id"])
        module = Module.objects.get(id=data["module_id"])

        assignment = Assignment(
            name=data["name"],
            course=course,
            start_date=start_date,
            end_date=end_date,
            assessment_type=data["assessment_type"],
            associated_module=module,
        )

        assignment.save()
        module.assignments.add(assignment)
        return Response(
            {"message": "Assignment created successfully"},
            status=status.HTTP_201_CREATED,
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
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='get_current_assignment_attempt/(?P<assignment_id>[^/.]+)')
    def get_current_assignment_attempt(self, request, assignment_id=None):
        user_id = request.query_params.get('user_id')

        user = get_object_or_404(CanvasUser, id=user_id)
        assignment = get_object_or_404(Assignment, id=assignment_id)

        assignment_attempt = AssignmentAttempt.objects.filter(associated_assignment=assignment, user=user)

        if not assignment_attempt.exists():  
            assignment_attempt = AssignmentAttempt(user=user, associated_assignment=assignment)
            assignment_attempt.save()
        else:
            assignment_attempt = assignment_attempt.first()
        
        assignment_attempt_serializer = AssignmentAttemptSerializer(assignment_attempt)


        return Response(assignment_attempt_serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        url_path="get_assignment_objectives/(?P<assignment_id>[^/.]+)",
    )
    def get_assignment_objectives(self, request, assignment_id=None):
        assignment = Assignment.objects.get(id=assignment_id)
        questions = assignment.questions
        print(questions)
        return Response(status=status.HTTP_200_OK)


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = QuestionSerializer
    queryset = Question.objects.all()

    def get_queryset(self):
        queryset = Question.objects.all()
        return queryset
    
    @action(detail=False, methods=['get'], url_path='get_question_by_id/(?P<question_id>[^/.]+)')
    def get_question_by_id(self, request, question_id=None):
        try:
            question = Question.objects.get(id=question_id)
            question_serializer = QuestionSerializer(question)

            return Response(question_serializer.data, status=status.HTTP_200_OK)
        except Question.DoesNotExist:
            return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='delete_question')
    def delete_question(self, request):
        data = request.data
        question = Question.objects.get(id=data['question_id'])

        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'], url_path='edit_question/(?P<question_id>[^/.]+)')
    def edit_question(self, request, question_id):
        data = request.data
        question = Question.objects.get(id=question_id)
        
        skill = Skill.objects.get(id=data['skill_id'])

        if 'name' in data:
            question.name = data['name']
        if 'text' in data:
            question.text = data['text']
        if 'difficulty' in data:
            difficulty_map = {
                "easy": 1,
                "medium": 2,
                "hard": 3
            }

            difficulty = difficulty_map[data['difficulty'].lower()]
            question.difficulty = difficulty
        if 'type' in data:
            question.type = data['type']
        if 'num_points' in data:
            question.num_points = data['num_points']
        if skill:
            question.associated_skill = skill
        if 'possible_answers' in data:
            possible_answers = json.loads(data['possible_answers'])
            question.possible_answers.set([])

            for answer in possible_answers:
                possible_answer = PossibleAnswer(
                    answer=answer['possible_answer'],
                    is_correct=answer['is_correct'],
                    related_question=question
                )
                possible_answer.save()
                question.possible_answers.add(possible_answer)
        

        question.save()
        return Response({"message": "Assignment updated successfully"}, status=status.HTTP_200_OK)

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

    @action(detail=False, methods=["post"], url_path="answer_question")
    def answer_question(self, request):
        data = request.data
        assignment = Assignment.objects.get(id=data["assignment_id"])
        user = CanvasUser.objects.get(id=data["user_id"])
        question = Question.objects.get(id=data["question_id"])
        answer_choice = PossibleAnswer.objects.get(id=data["answer_choice"])
        number_of_seconds_to_answer = data["number_of_seconds_to_answer"]
        response = StudentResponse(
            user=user,
            question=question,
            response=answer_choice,
            number_of_seconds_to_answer=number_of_seconds_to_answer,
        )

        if assignment.assessment_type == "Homework":

            request_to_adaptive_engine = {
                "user_id": user.id,
                "course_id": assignment.course_id,
                "assignment_id": assignment.id,
                "skill_name": question.associated_skill.id,
                "correct": answer_choice.is_correct,
                "difficulty": question.difficulty,
                "hints_used": data["hints_used"],
                "seconds_taken": data["number_of_seconds_to_answer"],
                "module_id": assignment.associated_module.id,
                "question_id": question.id,
            }

            response_from_adaptive_engine = requests.post(
                os.environ.get("ADAPTIVE_ENGINE_URL") + "/run-model-on-response/",
                json=request_to_adaptive_engine,
            )

            next_question = response_from_adaptive_engine.json()["next_question"]
            state_prediction = response_from_adaptive_engine.json()["state_prediction"]
        else:
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

            return Response(status=status.HTTP_200_OK)

<<<<<<< HEAD

        json = {
            'next_question': next_question,
            'state_prediction': state_prediction
        }
=======
        print(next_question)
        print(state_prediction)

        json = {"next_question": next_question, "state_prediction": state_prediction}
>>>>>>> aaafbab855e2dd2f7e4b1d8bfc8f2fa8d03cbac8

        response.save()

        return Response(json, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="answer_quiz_question")
    def answer_quiz_question(self, request):
        # data = request.data
        # assignment = Assignment.objects.get(id=data["assignment_id"])
        # user = CanvasUser.objects.get(id=data["user_id"])
        # question = Question.objects.get(id=data["question_id"])
        # answer_choice = PossibleAnswer.objects.get(id=data["answer_choice"])
        # number_of_seconds_to_answer = data["number_of_seconds_to_answer"]

        # request_to_adaptive_engine = {
        #     "user_id": user.id,
        #     "course_id": assignment.course_id,
        #     "assignment_id": assignment.id,
        #     "skill_name": question.associated_skill.skill_name,
        #     "correct": answer_choice.is_correct,
        # }

        return Response(json, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='get_first_question_for_assignment/(?P<assignment_id>[^/.]+)')
    def get_first_question_for_assignment(self, request, assignment_id=None):
        assignment_attempt_id = request.query_params.get('assignment_attempt_id')

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
<<<<<<< HEAD
            return Response({'error': 'No modules found for this course'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=['post'], url_path='update_assignment_order/(?P<module_id>[^/.]+)')
    def update_assignment_order(self, request, module_id=None):
        try:
            module = Module.objects.get(id=module_id)
            new_order = request.data['assignment_ids']

            if not isinstance(new_order, list):
                return Response({'error': 'Invalid format for assignment_ids'}, status=status.HTTP_400_BAD_REQUEST)

            assignments = {assignment.id: assignment for assignment in module.assignments.all()}

            print(assignments)

            for index, assignment_id in enumerate(new_order):
                if assignment_id in assignments:
                    assignments[assignment_id].order = index
                    assignments[assignment_id].save()

            return Response({'message': 'Assignment order updated successfully'}, status=status.HTTP_200_OK)

        except Module.DoesNotExist:
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='get_modules_with_skills/(?P<course_id>[^/.]+)')
=======
            return Response(
                {"error": "No modules found for this course"},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(
        detail=False,
        methods=["get"],
        url_path="get_modules_with_skills/(?P<course_id>[^/.]+)",
    )
>>>>>>> aaafbab855e2dd2f7e4b1d8bfc8f2fa8d03cbac8
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

    @action(
        detail=False,
        methods=["get"],
        url_path="get_skill_by_assignment_id/(?P<assignment_id>[^/.]+)",
    )
    def get_skill_by_assignment_id(self, request, assignment_id=None):
        try:
            module = Module.objects.filter(assignments__id=assignment_id).first()
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

            # Fetch enrollments with TeacherEnrollment type
            teacher_names = []
            enrollments = course.get_enrollments(type=["TeacherEnrollment"])
            for enrollment in enrollments:
                teacher_names.append(enrollment.user["name"])

            # Return response with professor names
            if not teacher_names:
                return Response(
                    {
                        "message": "No professors found for this course.",
                        "professors": [],
                    }
                )

            return Response({"course_id": course_id, "professors": teacher_names})

        except Exception as e:
            raise NotFound({"error": str(e)})

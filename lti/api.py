import os
import requests
import datetime
import json

from canvasapi import Canvas
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from lti.models import (
    Assignment,
    CanvasUser,
    Course,
    Textbook,
    Question,
    PossibleAnswer,
    Skill,
    Response as StudentResponse,
    Module,
)

from lti.serializers import (
    AssignmentSerializer,
    QuestionSerializer,
    TextbookSerializer,
    PossibleAnswerSerializer,
    SkillSerializer,
    ModuleSerializer,
)

class TextbookViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = TextbookSerializer
    queryset = Textbook.objects.all()

    def get_queryset(self):
        queryset = Textbook.objects.all()
        return queryset
        
    @action(detail=False, methods=['get'], url_path='isbn/(?P<isbn>[^/.]+)')
    def get_by_isbn(self, request, isbn=None):
        try:
            textbook = Textbook.objects.get(isbn=isbn)
            serializer = TextbookSerializer(textbook)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Textbook.DoesNotExist:
            return Response({'error': 'Textbook not found'}, status=status.HTTP_404_NOT_FOUND)


# Need an endpoint to create assignments
class AssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = AssignmentSerializer
    queryset = Assignment.objects.all()

    def get_queryset(self):
        queryset = Assignment.objects.all()
        return queryset


    @action(detail=False, methods=['get'], url_path='get_course_assignments')
    def get_course_assignments(self, request):
        try:
            course_id = request.query_params.get('course_id')
            assignments = Assignment.objects.filter(course_id=course_id)
            serializer = AssignmentSerializer(assignments, many=True)

            print(serializer.data)

            return Response(serializer.data, status=status.HTTP_200_OK)
        except Assignment.DoesNotExist:
            return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)
        except IndexError:
            return Response({'error': 'No assignments found for this course'}, status=status.HTTP_404_NOT_FOUND)


    @action(detail=False, methods=['post'], url_path='create_assignment')
    def create_assignment(self, request):
        data = request.data

        start_date = datetime.datetime.strptime(data["start_date"], "%Y-%m-%dT%H:%M")
        end_date = datetime.datetime.strptime(data["end_date"], "%Y-%m-%dT%H:%M")

        assignment = Assignment(
            name=data['name'],
            course_id=data['course_id'],
            start_date=start_date,
            end_date=end_date,
            assessment_type=data['assessment_type']
        )

        assignment.save()
        return Response(status=status.HTTP_201_CREATED)
       
    @action(detail=False, methods=['post'], url_path='add_question')   
    def add_question(self, request):
        data = request.data
        assignment = Assignment.objects.get(id=data['assignment_id'])
        question = Question.objects.get(id=data['question_id'])
        assignment.questions.add(question)
        assignment.save()
        serializer = AssignmentSerializer(assignment)

        if assignment.assessment_type == "Homework":
            request_to_adaptive_engine = {
                "question_id": question.id,
                "assignment_id": assignment.id,
                "course_id": assignment.course_id
            }

            requests.post(
                os.environ.get('ADAPTIVE_ENGINE_URL') + "/add-arm-to-mab/",
                json=request_to_adaptive_engine
            )

        return Response(serializer.data, status=status.HTTP_200_OK)


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = QuestionSerializer
    queryset = Question.objects.all()

    def get_queryset(self):
        queryset = Question.objects.all()
        return queryset

    @action(detail=False, methods=['post'], url_path='create_question')
    def create_question(self, request):
        data = request.data

        skill = Skill.objects.get(id=data['skill_id'])

        difficulty_map = {
            "easy": 1,
            "medium": 2,
            "hard": 3
        }

        difficulty = difficulty_map[data['difficulty'].lower()]

        question = Question(
            name = data['name'],
            text=data['text'],
            difficulty=difficulty,
            type=data['type'],
            num_points=data['points'],
            associated_skill=skill
        )

        question.save()

        try:
            assignment = Assignment.objects.get(id=data['assignment_id'])
            question.assignments.add(assignment)
        except Assignment.DoesNotExist:
            return Response(
                {"error": f"Assignment with ID {data['assignment_id']} does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        possible_answers = json.loads(data['possible_answers'])

        for answer in possible_answers:
            possible_answer = PossibleAnswer(
                answer=answer['possible_answer'],
                is_correct=answer['is_correct'],
                related_question=question
            )
            possible_answer.save()
            question.possible_answers.add(possible_answer)

        return Response(status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], url_path='add_question_list')
    def add_question_list(self, request):
        data = request.data
        course = Course.objects.get(id=data['course_id'])
        for question in data:
            question = Question(question_text=question['question_text'])
            skill_name = question['sub_category']

            skill = Skill.objects.get(skill_name=skill_name)

            if skill:
                question.associated_skill = skill
            else:
                skill = Skill.objects.create(skill_name=skill_name)
                skill.questions.add(question)
                skill.course = course
                skill.save()
                question.associated_skill = skill

            for answer in question['possible_answers']:
                possible_answer = PossibleAnswer.objects.create(
                    possible_answer=answer['possible_answer'],
                    is_correct=answer['is_correct'],
                    related_question=question
                )
                possible_answer.save()
                question.possible_answers.add(possible_answer)
            
            question.save()
        
        return Response(status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='answer_question')           
    def answer_question(self, request):
        data = request.data
        assignment = Assignment.objects.get(id=data['assignment_id'])
        user = CanvasUser.objects.get(id=data['user_id'])
        question = Question.objects.get(id=data['question_id'])
        answer_choice = PossibleAnswer.objects.get(id=data['answer_choice'])
        number_of_seconds_to_answer = data['number_of_seconds_to_answer']
        response = StudentResponse(
            user=user,
            question=question,
            response=answer_choice,
            number_of_seconds_to_answer=number_of_seconds_to_answer
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
                "question_id": question.id
            }

            response_from_adaptive_engine = requests.post(
                os.environ.get('ADAPTIVE_ENGINE_URL') + "/run-model-on-response/",
                json=request_to_adaptive_engine
            )

            next_question = response_from_adaptive_engine.json()['next_question']
            state_prediction = response_from_adaptive_engine.json()['state_prediction']
        else:
            request_to_adaptive_engine = {
                "user_id": user.id,
                "course_id": assignment.course_id,
                "module_id": assignment.associated_module.id,
                "skill_name": question.associated_skill.id,
                "correct": answer_choice.is_correct
            }

            requests.post(
                os.environ.get('ADAPTIVE_ENGINE_URL') + "/fit-model/",
                json=request_to_adaptive_engine
            )

            return Response(status=status.HTTP_200_OK)


        print(next_question)
        print(state_prediction)

        json = {
            'next_question': next_question,
            'state_prediction': state_prediction
        }

        response.save()
        
        return Response(json, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='answer_quiz_question')
    def answer_quiz_question(self, request):
        data = request.data
        assignment = Assignment.objects.get(id=data['assignment_id'])
        user = CanvasUser.objects.get(id=data['user_id'])
        question = Question.objects.get(id=data['question_id'])
        answer_choice = PossibleAnswer.objects.get(id=data['answer_choice'])
        number_of_seconds_to_answer = data['number_of_seconds_to_answer']
        response = StudentResponse(
            user=user,
            question=question,
            response=answer_choice,
            number_of_seconds_to_answer=number_of_seconds_to_answer
        )

        request_to_adaptive_engine = {
            "user_id": user.id,
            "course_id": assignment.course_id,
            "assignment_id": assignment.id,
            "skill_name": question.associated_skill.skill_name,
            "correct": answer_choice.is_correct
        }


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
    
    @action(detail=False, methods=['get'], url_path='get_modules_by_course_id/(?P<course_id>[^/.]+)')
    def get_modules_by_course_id(self, request, course_id=None):
        try:
            response = []

            modules = Module.objects.filter(course_id=course_id)

            for module in modules:
                module_response = {
                    "id": module.id,
                    "name": module.name,
                }

                module_response['rows'] = []

                for assignment in module.assignments.all():
                    module_response['rows'].append({
                        "id": assignment.id,
                        "topic": assignment.name,
                        "start": assignment.start_date,
                        "end": assignment.end_date,
                        "assessment_type": assignment.assessment_type
                    })
                
                response.append(module_response)
                
            return Response(response, status=status.HTTP_200_OK)
        except Module.DoesNotExist:
            return Response({'error': 'Module not found'}, status=status.HTTP_404_NOT_FOUND)
        except IndexError:
            return Response({'error': 'No modules found for this course'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=['post'], url_path='create_module')
    def create_module(self, request):
        data = request.data

        module = Module(
            name=data['name'],
            course_id=data['course_id']
        )

        module.save()
        return Response(status=status.HTTP_201_CREATED)

class SkillViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = SkillSerializer
    queryset = Skill.objects.all()

    def get_queryset(self):
        queryset = Skill.objects.all()
        return queryset

    @action(detail=False, methods=['get'], url_path='get-skill-by-assignment-id/(?P<assignment_id>[^/.]+)')
    def get_skill_by_assignment_id(self, request, assignment_id=None):
        try:
            skills = Skill.objects.filter(assignments__id=assignment_id)
            serializer = SkillSerializer(skills, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)
        except Assignment.DoesNotExist:
            return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)
        except IndexError:
            return Response({'error': 'No questions found for this assignment'}, status=status.HTTP_404_NOT_FOUND)



class GetCourseProfessorName(APIView):
    """
    API endpoint to fetch the name(s) of professor(s) for a given course.
    """

    def get(self, request, *args, **kwargs):
        canvas = Canvas(os.environ.get('CANVAS_URL'), request.session['api_key'])
        course_id = request.query_params.get('course_id')
        if not course_id:
            raise ValidationError({"error": "course_id parameter is required."})

        try:
            # Fetch the course using Canvas API
            course = canvas.get_course(course_id)

            # Fetch enrollments with TeacherEnrollment type
            teacher_names = []
            enrollments = course.get_enrollments(type=['TeacherEnrollment'])
            for enrollment in enrollments:
                teacher_names.append(enrollment.user['name'])

            # Return response with professor names
            if not teacher_names:
                return Response({"message": "No professors found for this course.", "professors": []})

            return Response({"course_id": course_id, "professors": teacher_names})

        except Exception as e:
            raise NotFound({"error": str(e)})

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from lti.models import Assignment, Textbook, Question, PossibleAnswers, Objective
from lti.serializers import AssignmentSerializer, QuestionSerializer, TextbookSerializer, PossibleAnswersSerializer, ObjectiveSerializer

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

    @action(detail=False, methods=['post'], url_path='create_assignment')
    def create_assignment(self, request):
        data = request.data
        assignment = Assignment.objects.create(
            assignment_name=data['assignment_name'],
            course_id=data['course_id']
        )

        assignment.save()
        serializer = AssignmentSerializer(assignment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
       
    @action(detail=False, methods=['post'], url_path='add_question')   
    def add_question(self, request):
        data = request.data
        assignment = Assignment.objects.get(id=data['assignment_id'])
        question = Question.objects.get(id=data['question_id'])
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

    @action(detail=False, methods=['post'], url_path='create_question')
    def create_question(self, request):
        data = request.data
        question = Question.objects.create(
            question_text=data['question_text'],
        )

        try:
            assignment = Assignment.objects.get(id=data['assignment_id'])
            question.assignments.add(assignment)
        except Assignment.DoesNotExist:
            return Response(
                {"error": f"Assignment with ID {data['assignment_id']} does not exist."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        possible_answers = data['possible_answers']
        objectives = data['objectives']

        for answer in possible_answers:
            possible_answer = PossibleAnswers.objects.create(
                possible_answer=answer['possible_answer'],
                is_correct=answer['is_correct'],
                related_question=question
            )
            possible_answer.save()
            question.possible_answers.add(possible_answer)

        for objective in objectives:
            obj = Objective.objects.get(id=objective['id'])
            question.objectives.add(obj)

        question.save()
        serializer = QuestionSerializer(question)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], url_path='add_question_list')
    def add_question_list(self, request):
        data = request.data
        course = Course.objects.get(id=data['course_id'])
        for question in data:
            question = Question(question_text=question['question_text'])
            objective_name = question['objective']

            objective = Objective.objects.get(question_text=objective_name)

            if objective:
                question.objectives.add(objective) 
            else:
                objective = Objective.objects.create(objective_name=objective_name)
                objective.questions.add(question)
                objective.course = course
                objective.save()
            
            question.objectives.add(objective)

            for answer in question['possible_answers']:
                possible_answer = PossibleAnswers.objects.create(
                    possible_answer=answer['possible_answer'],
                    is_correct=answer['is_correct'],
                    related_question=question
                )
                possible_answer.save()
                question.possible_answers.add(possible_answer)
            
            question.save()
        
        return Response(status=status.HTTP_201_CREATED)
                



class PossibleAnswersViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = PossibleAnswersSerializer
    queryset = PossibleAnswers.objects.all()

    def get_queryset(self):
        queryset = PossibleAnswers.objects.all()
        return queryset


class ObjectiveViewSet(viewsets.ModelViewSet):
    """ViewSet for the ReportEntry class"""

    serializer_class = ObjectiveSerializer
    queryset = Objective.objects.all()

    def get_queryset(self):
        queryset = Objective.objects.all()
        return queryset
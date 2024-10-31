from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from lti.models import Textbook
from lti.serializers import TextbookSerializer

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
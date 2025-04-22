from rest_framework import serializers
from .models import Diagram

class DiagramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagram
        fields = ['id', 'user', 'data']  # Zawiera pola: id, użytkownik i dane diagramu

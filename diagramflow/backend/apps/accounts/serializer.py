from rest_framework import serializers
from .models import Diagram

class DiagramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagram
        fields = ['id', 'user', 'name', 'data']  # Dodajemy pole 'name'
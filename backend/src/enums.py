# backend/src/enums.py
from enum import Enum

class IntentType(str, Enum):
    CODE = "Code"
    CONCEPT = "Concept"
    PLAN = "Plan"
    GENERAL = "General"

class LayerType(str, Enum):
    RAW = "raw"
    SUMMARY = "summary"

class GraphNode(str, Enum):
    RETRIEVE = "retrieve"
    GRADE = "grade"
    GENERATE = "generate"
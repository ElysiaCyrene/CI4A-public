from dataclasses import dataclass
from datetime import datetime
from typing import List, TypeVar, Generic, Optional

from Eous.entity.type import EventType, EventStatus

T = TypeVar("T")

@dataclass
class EventMessage(Generic[T]):
    event: EventType
    status: EventStatus | None = None
    event_content: Optional[T] | None = None
    timestamp:float = datetime.now().timestamp()

    def __str__(self):
        return f"EventMessage: {self.event}, {self.status}, {self.event_content}"

    def match(self, event: EventType, status: EventStatus):
        return self.event == event and self.status == status

    def match_list(self, event: List[EventType], status: EventStatus):
        return self.event in event and self.status == status

@dataclass
class CallMessage:
    def __init__(self, call_type, call_content=None):
        self.call_type = call_type
        self.call_content = call_content
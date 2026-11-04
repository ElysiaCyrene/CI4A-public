from dataclasses import dataclass
from typing import List, Dict

from Eous.entity.info_entity import AgentPO
from Eous.tools.web_controller.action_type import AtomicActionType


@dataclass
class ActionDecisionInfo(AgentPO):
    action_thought: str
    actions: List[Dict[str, AtomicActionType | dict]]
    action_expectation: str
from dataclasses import dataclass
from enum import Enum

from Eous.entity.info_entity import AgentPO

class ActionResultType (Enum):
    A = 'Current Task Fully Accomplished'
    B = 'Current Task Partially Accomplished'
    C = 'Failure'
    D = 'No Page Change'

class ActionLoopStatus(Enum):
    Normal = "Normal"
    MayStuck = "May Stuck In Action Loop"
    TaskSwitch = "Switch To Next Task"

@dataclass
class ActionExecReflectionInfo(AgentPO):
    reflection_thought: str | None
    action_result: ActionResultType
    task_completed_part: str | None = None
    task_remaining_part: str | None = None
    error_potential_causes: str | None = None
    action_loop_status: ActionLoopStatus = ActionLoopStatus.Normal


@dataclass
class ActionExecErrorInfo(AgentPO):
    error_message: str
    action_name: str | None = None
    component_name: str | None = None
    details: str | None = None
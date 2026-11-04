import asyncio
from copy import deepcopy
from enum import Enum
from typing import List, Any, Dict

from Eous.agents.action_loop_agents.action_decider.entity import ActionDecisionInfo
from Eous.agents.action_loop_agents.action_exec_reflector.entity import ActionExecReflectionInfo, ActionLoopStatus, ActionResultType, ActionExecErrorInfo
from Eous.entity.info_entity import TaskInstructionInfo
from Eous.tools.page_perceptor.entity import PageInfo


class ActionMemoryType(Enum):
    StartPage = 1
    Action = 2
    ActionResult = 3
    EndPage = 4
    PageDiff = 5
    ErrorInfo = 6

class ActionLoopWorkingMemoryManager():
    def __init__(self, instruction: TaskInstructionInfo):
        self.instruction = instruction
        self.current_task_index: int = 0
        self.current_task_exec_error_count: int = 0
        self.current_task_exec_count: int = 0

        self.action_execution_memory_list: List[Any] = []
        self.action_execution_index = 0

        # 初始化
        self.action_execution_memory_list.append({
            'task': "Initial",  # 初始任务为Initial，索引为-1
            ActionMemoryType.StartPage: None,
            ActionMemoryType.Action: None,
            ActionMemoryType.ActionResult: None,
            ActionMemoryType.EndPage: None,
            ActionMemoryType.PageDiff: None,
            ActionMemoryType.ErrorInfo: None
        })

        self.waiting_plan_provided = asyncio.Event()

    def get_current_task(self) -> dict:
        return {
            "task": self.action_execution_memory_list[self.action_execution_index]['task'],
            "index": self.current_task_index,
            "exec_count": self.current_task_exec_count,
            "exec_error_count": self.current_task_exec_error_count,
        }

    async def new_execution_memory(self):
        start_page = self.action_execution_memory_list[self.action_execution_index][ActionMemoryType.EndPage]
        self.action_execution_memory_list.append({
            'task': f"[Round {self.current_task_index + 1}] {self.instruction.get_instruction()}",
            ActionMemoryType.StartPage: start_page,
            ActionMemoryType.Action: None,
            ActionMemoryType.ActionResult: None,
            ActionMemoryType.EndPage: None,
            ActionMemoryType.PageDiff: None,
            ActionMemoryType.ErrorInfo: None
        })
        self.action_execution_index += 1

    async def set_action_execution_memory(self, memory: [PageInfo | ActionDecisionInfo | ActionExecReflectionInfo | ActionExecErrorInfo]):
        match memory:
            case PageInfo():
                # 保存结束页面
                self.action_execution_memory_list[self.action_execution_index][ActionMemoryType.EndPage] = memory

                # 计算 PageDiff：仅统计 perception_infos.SoM_mapping 中新增 component 的序号
                start_page = self.action_execution_memory_list[self.action_execution_index][ActionMemoryType.StartPage]
                prev_mapping = None
                try:
                    if start_page is not None:
                        prev_mapping = getattr(start_page.perception_infos, 'SoM_mapping', None)
                except Exception:
                    prev_mapping = None

                new_mapping = None
                try:
                    new_mapping = getattr(memory.perception_infos, 'SoM_mapping', None)
                except Exception:
                    new_mapping = None

                if new_mapping is None:
                    page_diff = None
                else:
                    if prev_mapping is None:
                        # 如果没有上一个页面映射，全部视为新增
                        page_diff = list(range(len(new_mapping)))
                    else:
                        # 新增的 component：在 new_mapping 中但不在 prev_mapping 的那些索引
                        added_indices = []
                        for i, item in enumerate(new_mapping):
                            # 使用 dict 等值比较判断是否为新项
                            if not any(item == p for p in prev_mapping):
                                added_indices.append(i)
                        page_diff = added_indices

                self.action_execution_memory_list[self.action_execution_index][ActionMemoryType.PageDiff] = page_diff
                
            case ActionDecisionInfo():
                self.action_execution_memory_list[self.action_execution_index][ActionMemoryType.Action] = memory
            case ActionExecReflectionInfo():
                self.action_execution_memory_list[self.action_execution_index][ActionMemoryType.ActionResult] = memory

                if memory.action_result in [ActionResultType.C, ActionResultType.D]:
                    self.current_task_exec_error_count += 1 # 记录当前任务执行错误计数
                self.current_task_exec_count += 1  # 记录当前任务执行计数
                print(self.current_task_exec_count)

                # if memory.action_loop_status == ActionLoopStatus.Normal:
                await self.new_execution_memory() # 开始新的记录轮次
            case ActionExecErrorInfo():
                # 记录执行错误到本轮的 ActionResult，并更新计数
                if self.action_execution_memory_list[self.action_execution_index][ActionMemoryType.ActionResult] is None:
                    self.action_execution_memory_list[self.action_execution_index][ActionMemoryType.ErrorInfo] = [memory]
                else:
                    self.action_execution_memory_list[self.action_execution_index][ActionMemoryType.ErrorInfo].append(memory)

    def query_action_execution_memory(self, query_count) -> List[Dict[ActionMemoryType | str, PageInfo | ActionDecisionInfo | ActionExecReflectionInfo | ActionExecErrorInfo | list]]:
        return list(reversed(self.action_execution_memory_list[-query_count:]))

    def query_action_execution_memory_by_task(self, query_task) -> List[Dict[ActionMemoryType | str, PageInfo | ActionDecisionInfo | ActionExecReflectionInfo | ActionExecErrorInfo | list]]:
        return [action_execution_memory for action_execution_memory in self.action_execution_memory_list if action_execution_memory['task'] == query_task]
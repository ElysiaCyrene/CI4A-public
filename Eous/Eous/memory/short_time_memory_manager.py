import time
from enum import Enum
from Citlali.core.type import ListenerType
from Citlali.core.worker import Worker, listener
from Eous.config.eous_config import EousConfig
from Eous.entity.info_entity import TaskInstructionInfo
from Eous.entity.log_template import LogTemplate
from Eous.entity.message_entity import EventMessage, CallMessage
from Eous.memory.action_loop_working_memory_manager import ActionLoopWorkingMemoryManager
from Eous.entity.type import EventType, CallType, EventChannel, EventStatus
import pickle

class MemoryType(Enum):
    Instruction = 2
    Actions = 3

class ShortMemoryCallType(Enum):
    GET_Instruction = 1
    GET_Current_Task = 2
    GET_Action_Execution_Memory = 4

class ShortTimeMemoryManager(Worker):
    def __init__(self, runtime, config:EousConfig):
        super().__init__(runtime, "ShortTimeMemoryManager", "ShortTimeMemoryManager")
        self.log_t = LogTemplate(self)  # 日志模板

        self.archived_task_working_memory_list = []
        self.current_task_working_memory = None

        self.stm_restore_point_path = config.get_restore_point_path()

    def build_restore_point(self):
        current_time = time.strftime("%Y%m%d%H%M%S", time.localtime())
        with open(f"{self.stm_restore_point_path}/short_time_memory_backup_{current_time}.pkl", "wb") as f:
            short_time_memory = (
                    self.archived_task_working_memory_list,
                    self.current_task_working_memory,
                )
            pickle.dump(short_time_memory, f, protocol=pickle.HIGHEST_PROTOCOL)

    def load_restore_point(self, restore_point_name):
        with open(restore_point_name, "rb") as f:
            short_time_memory = pickle.load(f)
        # self.archived_task_working_memory_list, self.current_task_working_memory, self.global_memory = short_time_memory
        self.archived_task_working_memory_list, self.current_task_working_memory = short_time_memory

    def new_task_working_memory(self, instruction: TaskInstructionInfo = None):
        self.current_task_working_memory = {
            MemoryType.Instruction: instruction,
            MemoryType.Actions: ActionLoopWorkingMemoryManager(instruction),
        }

    def next_task_working_memory(self, instruction: TaskInstructionInfo = None):
        self.build_restore_point()  # 建立恢复点
        self.archived_task_working_memory_list.append(self.current_task_working_memory) # 保存当前短时记忆
        self.new_task_working_memory(instruction) # 新建一个task工作记忆

    @listener(ListenerType.ON_NOTIFIED, channel=EventChannel.WEB_CHANNEL,
              listen_filter=lambda msg: msg.match(EventType.Task, EventStatus.CREATED))
    async def create_task_memory(self, message: EventMessage, message_context):
        if len(self.archived_task_working_memory_list) == 0 and self.current_task_working_memory is None:
            self.new_task_working_memory(instruction = message.event_content)
        else:
            self.next_task_working_memory(instruction = message.event_content)

    # 当event为ActionDecision、PagePerception、Reflection时，更新当前Action的记忆
    @listener(ListenerType.ON_NOTIFIED, channel=EventChannel.WEB_CHANNEL,
              listen_filter=lambda msg: msg.match_list([EventType.ActionDecision, EventType.Reflection, EventType.PagePerception, EventType.ExecutionError], EventStatus.DONE))
    async def set_current_action_memory(self, message: EventMessage, message_context):
        await self.current_task_working_memory[MemoryType.Actions].set_action_execution_memory(message.event_content)

    @listener(ListenerType.ON_CALLED, listen_filter=lambda message: message.call_type == CallType.Memory_GET)
    async def get_memory(self, message: CallMessage, message_context):
        memory_list = {}
        for memory_call_type in message.call_content:
            memory = None
            match memory_call_type:
                case ShortMemoryCallType.GET_Instruction:
                    memory = self.current_task_working_memory.get(MemoryType.Instruction)
                case ShortMemoryCallType.GET_Current_Task:
                    memory = self.current_task_working_memory.get(MemoryType.Actions).get_current_task()
                case ShortMemoryCallType.GET_Action_Execution_Memory:
                    query = message.call_content[memory_call_type]
                    if isinstance(query, str):
                        # 若query语句是字符串，则是指定sub_goal的查询
                        memory = self.current_task_working_memory.get(MemoryType.Actions).query_action_execution_memory_by_task(query)
                    else:
                        # 若query语句是数字，则是指定数量的查询
                        memory = self.current_task_working_memory.get(MemoryType.Actions).query_action_execution_memory(query)
            memory_list[memory_call_type] = memory
        return memory_list
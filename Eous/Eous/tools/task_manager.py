from loguru import logger

from Citlali.core.type import ListenerType
from Citlali.core.worker import listener, Worker
from Eous.entity.info_entity import TaskInstructionInfo
from Eous.agents.global_planner.entity import GlobalPlanInfo
from Eous.entity.log_template import LogTemplate, LogEventType
from Eous.entity.message_entity import EventMessage, CallMessage
from Eous.tools.web_controller.action_type import AtomicActionType
from Eous.entity.type import EventType, CallType, EventChannel, EventStatus


class TaskManager(Worker):
    def __init__(self, runtime) -> None:
        super().__init__(runtime, "TaskManager")
        self.log_t = LogTemplate(self)  # 日志模板

        self.current_task = None
        self.finished_task_list = []


    @listener(ListenerType.ON_NOTIFIED, channel=EventChannel.GLOBAL_CHANNEL,
              listen_filter=lambda msg: msg.match(EventType.Plan, EventStatus.DONE))
    async def on_task_create(self, message: EventMessage, message_context):
        # GLOBAL_CHANNEL发布Task CREATE事件 & 记录日志
        await self.publish(EventChannel.GLOBAL_CHANNEL, EventMessage(EventType.Task, EventStatus.CREATED))
        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerStart)("Task Execution"))

        global_plan_info: GlobalPlanInfo = message.event_content
        self.current_task = global_plan_info.current_sub_task
        await self.navigate_to_task_website()

        instruction_info = TaskInstructionInfo(
            self.current_task['instruction'],
            global_plan_info.ins_language,
            self.current_task['website'],
            self.current_task['url'],
            self.current_task['key_info_request']
        )

        # WEB_CHANNEL发布Task CREATE事件
        await self.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.Task, EventStatus.CREATED, instruction_info))

    async def navigate_to_task_website(self):
        await (await self.call(
            "ActionExecutor",
            CallMessage(CallType.Action_EXECUTE, {
                "atomic_action": AtomicActionType.Navigate,
                "args": {"url": self.current_task['url']},
            })
        ))

    @listener(ListenerType.ON_NOTIFIED, channel=EventChannel.WEB_CHANNEL,
              listen_filter=lambda msg: msg.match(EventType.Task, EventStatus.DONE))
    async def on_task_finish(self, message: EventMessage, message_context):
        # GLOBAL_CHANNEL发布Task DONE事件 & 记录日志
        await self.publish(EventChannel.GLOBAL_CHANNEL, EventMessage(EventType.Task, EventStatus.DONE, message))
        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerCompleted)("Task Execution"))
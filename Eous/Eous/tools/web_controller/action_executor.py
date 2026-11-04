from typing import List, Dict

from loguru import logger
import asyncio

from Citlali.core.agent import Worker
from Citlali.core.type import ListenerType
from Citlali.core.worker import listener
from Eous.config.eous_config import WebControllerType, EousConfig
from Eous.entity.log_template import LogTemplate, LogEventType
from Eous.entity.message_entity import EventMessage, CallMessage
from Eous.entity.type import EventType, CallType, EventChannel, EventStatus
from Eous.tools.web_controller.playwright_tools.web_control_tool import PlaywrightWebController
from Eous.tools.web_controller.action_type import AtomicActionType
from Eous.agents.action_loop_agents.action_exec_reflector.entity import ActionExecErrorInfo


class ActionExecutor(Worker):
    def __init__(self, runtime, config: EousConfig):
        super().__init__(runtime, "ActionExecutor", "ActionExecutor")
        self.log_t = LogTemplate(self)  # 日志模板

        self.action_executor_type = config.action_executor_type
        if self.action_executor_type == WebControllerType.PlayWright:
            self.control_tool = PlaywrightWebController(config)
            
        self.step_count = 0 
        self.call_count = 0

    @listener(ListenerType.ON_CALLED, listen_filter=lambda message: message.call_type == CallType.Action_EXECUTE)
    async def do_action(self, message: CallMessage, message_context):
        return await self.execute_action(message.call_content["atomic_action"], message.call_content["args"])

    @listener(ListenerType.ON_NOTIFIED, channel=EventChannel.WEB_CHANNEL,
              listen_filter=lambda msg: msg.match(EventType.ActionDecision, EventStatus.DONE))
    async def on_action_create(self, message: EventMessage, message_context):
        # 发布ActionExecution CREATED事件 & 记录日志
        await self.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.ActionExecution, EventStatus.CREATED))
        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerStart)("Action Execution"))

        await self.execute_actions(message.event_content.actions)
                
        # 等待页面加载
        await asyncio.sleep(3)

        # 发布ActionExecution Done事件 & 记录日志
        await self.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.ActionExecution, EventStatus.DONE, message.event_content))
        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerCompleted)("Action Execution"))

    async def execute_action(self, atomic_action: AtomicActionType, args) -> str  | None | list[str]:
        result = await self.control_tool.execute_action(atomic_action, args)
        logger.bind(log_tag="eous_sys").debug(self.log_t.log(LogEventType.IntermediateResult)("Action execution result", result))

        # 如果控制器返回错误信息（字符串形式），发布 ExecutionError 事件，ShortTimeMemoryManager 会记录到当前轮记忆
        try:
            if isinstance(result, str):
                lowered = result.lower()
                if lowered.startswith("failed to") or "error:" in lowered or "exception" in lowered:
                    # 构建 error_info
                    action_name = None
                    component_name = None
                    try:
                        if isinstance(args, dict):
                            action_name = args.get("component_action") or args.get("action")
                            component_name = args.get("component_name")
                    except Exception:
                        pass
                    error_info = ActionExecErrorInfo(error_message=result, action_name=action_name, component_name=component_name, details=None)
                    await self.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.ExecutionError, EventStatus.DONE, error_info))
                    logger.bind(log_tag="eous_sys").warning(self.log_t.log(LogEventType.Notice)(f"Published ExecutionError: {result}"))
        except Exception:
            pass

        return result

    async def execute_actions(self, actions: List[Dict[str, AtomicActionType | dict]]) -> None:
        self.step_count += len(actions)
        self.call_count += 1
        if self.step_count >= 30 or self.call_count >= 15:
            logger.bind(log_tag="eous_sys").warning("Maximum steps reached. Stopping.")
            logger.bind(log_tag="agent_req").warning("Maximum steps reached. Stopping.")
            await self.stop()
            return

        await self.control_tool.execute_actions(actions)
        
        # 检查是否包含 Finish 动作
        for action in actions:
            if action["name"] == AtomicActionType.Finish.value or action["name"] == AtomicActionType.Finish:
                await self.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.Task, EventStatus.DONE))
                logger.bind(log_tag="eous_sys").info(f"\n\n{self.step_count} steps executed. Task finished successfully.")
                logger.bind(log_tag="agent_res").info(f"\n\n{self.step_count} steps executed. Task finished successfully.")
                await self.stop()
                break
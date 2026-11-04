from loguru import logger

from Citlali.core.agent import Agent
from Citlali.core.type import ListenerType
from Citlali.core.worker import listener
from Citlali.models.entity import ChatMessage
from Eous.agents.action_loop_agents.action_decider.entity import ActionDecisionInfo
from Eous.agents.action_loop_agents.action_exec_reflector.entity import ActionExecErrorInfo, ActionResultType, \
    ActionLoopStatus, ActionExecReflectionInfo
from Eous.agents.action_loop_agents.action_exec_reflector.prompt_templates import \
    content_for_reflection, order_for_reflection, reflection_output
from Eous.agents.prompt_common import output_json_object
from Eous.config.eous_config import EousConfig
from Eous.entity.info_entity import TaskInstructionInfo
from Eous.entity.log_template import LogTemplate, LogEventType
from Eous.memory.action_loop_working_memory_manager import ActionMemoryType
from Eous.memory.short_time_memory_manager import ShortMemoryCallType
from Eous.entity.message_entity import EventMessage, CallMessage
from Eous.entity.type import EventType, CallType, EventChannel, EventStatus
from Eous.tools.page_perceptor.entity import PageInfo
from Eous.utils.common_utils import llm_response_to_dict


class ActionExecReflectorAgent(Agent):
    def __init__(self, runtime, config: EousConfig) -> None:
        sys_prompt = "- Role: Action Execution Reflector, part of a web-browsing AI assistant.\n" \
                     "- Task: Compare the page states before and after an action to determine whether the action achieved its intended effect.\n" \
                     "- Workflow: (Action Decider -> You -> Action Decider -> You -> ...)(one or more rounds)" \
                     "- You are invoked after every execution round."
        system_messages = [ChatMessage(content=sys_prompt, type="SystemMessage")]
        super().__init__(runtime, "ActionExecReflectorAgent", config.model_client, system_messages)

        self.log_t = LogTemplate(self)  # 日志模板

        self.visual_mode = config.visual_mode

    @listener(ListenerType.ON_NOTIFIED, channel=EventChannel.WEB_CHANNEL,
              listen_filter=lambda msg: msg.match(EventType.PagePerception, EventStatus.DONE))
    async def do_reflection(self, message: EventMessage, message_context):

        # 发布Reflection CREATED事件 & 记录日志
        await self.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.Reflection, EventStatus.CREATED))
        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerStart)("Action Reflection"))

        # 从ShortTimeMemoryManager获取Instruction\Action_Execution_Memory
        short_term_memory_query = {
            ShortMemoryCallType.GET_Instruction: None,
            ShortMemoryCallType.GET_Current_Task: None,
            ShortMemoryCallType.GET_Action_Execution_Memory: 2,
        }

        short_memory = await (await self.call("ShortTimeMemoryManager",CallMessage(CallType.Memory_GET, short_term_memory_query)))
        instruction_info = short_memory[ShortMemoryCallType.GET_Instruction]

        current_task = short_memory[ShortMemoryCallType.GET_Current_Task]["task"]
        logger.bind(log_tag="eous_sys").debug(self.log_t.log(LogEventType.Notice)(f"Current Task: {current_task}"))
        task_index = short_memory[ShortMemoryCallType.GET_Current_Task]["index"]

        if current_task == "Initial":
            await self.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.Reflection, EventStatus.DONE, ActionExecReflectionInfo(None, ActionResultType.A, "Initial", None, None, ActionLoopStatus.Normal)))
            logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerSkip)("Action Reflection", "NOT required for the first initialization"))
            return

        task_exec_count = short_memory[ShortMemoryCallType.GET_Current_Task]["exec_count"]
        task_exec_error_count = short_memory[ShortMemoryCallType.GET_Current_Task]["exec_error_count"]

        action_execution_memory_list = short_memory[ShortMemoryCallType.GET_Action_Execution_Memory]
        last_action_info = action_execution_memory_list[0][ActionMemoryType.Action]
        start_page_info = action_execution_memory_list[0][ActionMemoryType.StartPage]
        end_page_info = action_execution_memory_list[0][ActionMemoryType.EndPage]
        page_diff_info = action_execution_memory_list[0][ActionMemoryType.PageDiff]
        error_info_list = action_execution_memory_list[0][ActionMemoryType.ErrorInfo]

        previous_progress = action_execution_memory_list[1][ActionMemoryType.ActionResult].task_completed_part if action_execution_memory_list[1]['task'] == current_task else None

        # 构建Prompt
        images = []
        if self.visual_mode:
            images.append(start_page_info.pageshot_file_info.get_pageshot_Image_file())
            images.append(end_page_info.pageshot_file_info.get_pageshot_Image_file())

        reflection_info: ActionExecReflectionInfo = await self.request_llm(
            self.build_prompt(
                self.visual_mode,
                instruction_info,
                previous_progress,
                last_action_info,
                start_page_info,
                end_page_info,
                page_diff_info,
                error_info_list
            ),
            images=images
        )

        if reflection_info.action_result in ["C", "D"]:
            task_exec_error_count += 1
        task_exec_count += 1

        if  task_exec_count>= 5 or task_exec_error_count >= 3:
            reflection_info.action_loop_status = ActionLoopStatus.MayStuck
        elif reflection_info.action_result == ActionResultType.A:
            reflection_info.action_loop_status = ActionLoopStatus.TaskSwitch
        else:
            reflection_info.action_loop_status = ActionLoopStatus.Normal

        logger.bind(log_tag="eous_sys").debug(self.log_t.log(LogEventType.Notice)(f"Task Exec Count {task_exec_count} | Error Count {task_exec_error_count}"))
        logger.bind(log_tag="eous_sys").debug(self.log_t.log(LogEventType.IntermediateResult)("Reflection result", reflection_info))

        if reflection_info.action_result == ActionResultType.A:
            logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.Notice)("\n\nTask is determined to be successful."))
            await self.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.Task, EventStatus.DONE))
            await self.stop()
            return

        # 发布Reflection DONE事件 & 记录日志
        await self.publish(EventChannel.WEB_CHANNEL,EventMessage(EventType.Reflection, EventStatus.DONE, reflection_info))
        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerCompleted)("Action Reflection"))

    def build_prompt(self,
                     visual_mode: bool,
                     instruction_info: TaskInstructionInfo,
                     previous_progress: str,
                     last_action_info: ActionDecisionInfo,
                     start_page: PageInfo,
                     end_page: PageInfo,
                     page_diff: list[int],
                     error_info_list: list[ActionExecErrorInfo]) -> str:

        prompt = f"--- Task Statement ---\n"\
                 f"- Instruction: {instruction_info.get_instruction()}\n"\
                 f"\n"

        # --- Content for Reflection ---
        prompt += content_for_reflection(visual_mode, previous_progress, last_action_info, start_page, end_page, page_diff, error_info_list)

        # --- Reflective Order ---
        prompt += order_for_reflection()

        # --- Output ---
        prompt += output_json_object(reflection_output)

        return prompt

    def parse_response(self, response: str) -> ActionExecReflectionInfo:
        response_dict = llm_response_to_dict(response)
        reflection_info = ActionExecReflectionInfo.from_dict(response_dict)
        return reflection_info
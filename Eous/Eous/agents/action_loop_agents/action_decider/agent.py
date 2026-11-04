from typing import List, Dict
from loguru import logger


from Citlali.core.agent import Agent
from Citlali.core.type import ListenerType
from Citlali.core.worker import listener
from Citlali.models.entity import ChatMessage
from Eous.agents.action_loop_agents.action_decider.entity import ActionDecisionInfo
from Eous.agents.action_loop_agents.action_decider.prompt_templates import order_for_decision_making, decision_making_tips, historical_tasks_briefing, action_decision_output, \
    parse_response_for_action_decision
from Eous.agents.action_loop_agents.action_exec_reflector.entity import ActionExecReflectionInfo, ActionLoopStatus, ActionResultType
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


class ActionDeciderAgent(Agent):
    def __init__(self, runtime, config: EousConfig) -> None:
        sys_prompt = "- Role: Action Decider, part of a web-browsing AI assistant\n" \
                     "- Task: Select one or more atomic actions—acting like a human user—to fulfill the current task, using the on‑page information.\n" \
                     "- Workflow: (You -> Action Reflector -> You -> Action Reflector -> ...)(one or more rounds)\n" \
                     "- After each round you perform, the Action Reflector reviews the result and then re‑invokes you."
        system_messages = [ChatMessage(content=sys_prompt, type="SystemMessage")]
        super().__init__(runtime, "ActionDeciderAgent", config.model_client, system_messages)

        self.log_t = LogTemplate(self)  # 日志模板

        self.convert_marks_to_coordinates = None
        self.review_execution_history_length = 5
        self.visual_mode = config.visual_mode
        self.ablation_mode = config.ablation_mode

    @listener(ListenerType.ON_NOTIFIED, channel=EventChannel.WEB_CHANNEL,
              listen_filter=lambda msg: msg.match(EventType.Reflection, EventStatus.DONE))
    async def do_action_decision_after_reflection(self, message: EventMessage[ActionExecReflectionInfo], message_context):
        # if message.event_content.action_loop_status != ActionLoopStatus.Normal:
        #     logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerSkip)("Action Decision", "Action Exection Trace Revision required."))
        #     return
        await self.do_action_decision()

    async def do_action_decision(self):
        # 发布ActionDecision CREATED事件 & 记录日志
        await self.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.ActionDecision, EventStatus.CREATED))
        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerStart)("Action Decision"))

        # 从ShortTimeMemoryManager获取Instruction\Action_Execution_Memory
        short_term_memory_query = {
            ShortMemoryCallType.GET_Instruction: None,
            ShortMemoryCallType.GET_Action_Execution_Memory: self.review_execution_history_length + 1,
        }

        short_memory = await (await self.call("ShortTimeMemoryManager",CallMessage(CallType.Memory_GET, short_term_memory_query)))
        instruction_info = short_memory[ShortMemoryCallType.GET_Instruction]

        # 独立反思模式时，Action_Loop_Memory已进入下一轮，当前轮只有StartPage已经赋值，是执行上一轮动作后的屏幕
        action_execution_memory_list = short_memory[ShortMemoryCallType.GET_Action_Execution_Memory]
        start_page_info = action_execution_memory_list[0][ActionMemoryType.StartPage]
        page_diff = action_execution_memory_list[1][ActionMemoryType.PageDiff]
        historical_action_execution_memory_list = action_execution_memory_list[1:]

        images = []
        if self.visual_mode:
            images.append(start_page_info.pageshot_file_info.get_pageshot_Image_file())

        if start_page_info.perception_infos.use_set_of_marks_mapping:
            self.convert_marks_to_coordinates = start_page_info.perception_infos.convert_marks_to_coordinates

        action_info = await self.request_llm(
            self.build_prompt(
                instruction_info,
                start_page_info,
                page_diff,
                historical_action_execution_memory_list,
            ),
            images=images
        )

        logger.bind(log_tag="eous_sys").debug(self.log_t.log(LogEventType.IntermediateResult)("Action decision result", action_info))

        # 发布ActionDecision Done事件 & 记录日志
        await self.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.ActionDecision, EventStatus.DONE, action_info))
        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerCompleted)("Action Decision"))

    def build_prompt(self,
                     instruction_info: TaskInstructionInfo,
                     start_page_info: PageInfo,
                     page_diff: list[int] | None,
                     historical_action_execution_memory_list: List[Dict[ActionMemoryType | str, PageInfo | ActionDecisionInfo | ActionExecReflectionInfo]]) -> str:

        prompt = f"--- Task Statement ---\n"\
             f"- Instruction: {instruction_info.get_instruction()}\n"\
             f"\n"

        # --- Page ---
        prompt += f"--- Page ---\n"
        if self.visual_mode:
            prompt += start_page_info.perception_infos.get_page_info_note_prompt(description_prefix="The attached image is a pageshot of the current page (after your last action) showing the current page state")
            prompt += f"\n"
        prompt += start_page_info.perception_infos.get_page_info_prompt()
        if page_diff is not None and len(page_diff) > 0:
            prompt += f"- Page Changes: The following clickable elements have changed compared to the previous page state: {', '.join([str(idx) for idx in page_diff])}.\n\n"

        # --- Current Task for Decision-making ---
        prompt += f"--- Decision-making ---\n"
        previous_action_execution = historical_action_execution_memory_list[0]
        previous_reflection_info: ActionExecReflectionInfo = previous_action_execution[ActionMemoryType.ActionResult]
        
        if previous_reflection_info.task_completed_part is not None:
            prompt += f"Completed Results from the Previous Task (Already Collected Information) {previous_reflection_info.task_completed_part}\n"

        match previous_reflection_info.action_result:
            case ActionResultType.B:
                prompt += f"- Partially Uncompleted for Previous Task: {previous_reflection_info.task_remaining_part}\n" \
                            f"Please continue with the uncompleted part.\n"
            case ActionResultType.C:
                prompt += f"Please consider rolling back the previous operation.\n"
            case ActionResultType.D:
                prompt += f"Please consider a new operation unlike any before.\n"
        prompt += f"\n"

        # --- Decision-making Order ---
        prompt += order_for_decision_making(
            SoM_mode=self.convert_marks_to_coordinates is not None,
            ablation_mode=self.ablation_mode,
            start_page=start_page_info,
            language=instruction_info.language
        )

        # --- Historical Tasks Briefing ---
        prompt += historical_tasks_briefing(historical_action_execution_memory_list, self.review_execution_history_length)

        # --- Output ---
        prompt += output_json_object(action_decision_output(self.convert_marks_to_coordinates is not None))

        return prompt

    def parse_response(self, response: str) -> ActionDecisionInfo | None:
        response_dict = llm_response_to_dict(response)
        response_dict = parse_response_for_action_decision(response_dict, self.convert_marks_to_coordinates, self.log_t)
        action_info = ActionDecisionInfo.from_dict(response_dict)
        return action_info
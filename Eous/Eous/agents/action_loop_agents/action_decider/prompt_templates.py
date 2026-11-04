import json
from collections import defaultdict
from copy import deepcopy

from loguru import logger

from typing_extensions import Dict

from Eous.agents.action_loop_agents.action_decider.tools import SoM_args_conversion
from Eous.agents.action_loop_agents.action_exec_reflector.entity import ActionResultType
from Eous.agents.prompt_common import ordered_list, unordered_list
from Eous.entity.log_template import LogEventType
from Eous.memory.action_loop_working_memory_manager import ActionMemoryType
from Eous.tools.web_controller.action_type import AtomicActionType, ATOMIC_ACTION_SIGNITURES
from Eous.tools.page_perceptor.entity import PageInfo


def order_for_decision_making(SoM_mode:bool, ablation_mode:bool, start_page:PageInfo, language:str):
    if SoM_mode:
        atomic_actions = [f"{action}({', '.join(value['SoM_arguments'])}): {value['description'](True)}" for action, value in ATOMIC_ACTION_SIGNITURES.items()]
    else:
        atomic_actions = [f"{action}({', '.join(value['arguments'])}): {value['description'](False)}" for action, value in ATOMIC_ACTION_SIGNITURES.items()]

    if ablation_mode in ("tool", "all"):
        atomic_actions = [action for action in atomic_actions if not action.startswith("AtomicActionType.ComponentApiCall")]

    prompt = f"--- Decision-making Order ---\n" \
             f"Please follow these steps to make action decisions:\n"
    prompt += ordered_list([
        "Carefully examine all the information provided above and decide on the next action to perform. If you notice an unsolved error in the previous action, think as a human user and attempt to rectify them. You must choose your action from ONE or MORE of the atomic actions (The format is `name(arguments): description`).",
        atomic_actions,
    ])
    prompt += "\n"

    prompt += f"- Action Note\n"
    if ablation_mode == "tool":
        prompt += unordered_list(    [
            "FIRST AND FOREMOST: Check if the Task (User Instruction) is already completed. If the task is completed, you MUST select and only select `Finish` IMMEDIATELY. DONT DO ANY unnecessary verification or validation-like actions.",
            "When faced with multiple options, prioritize the one that seems most likely to advance the current Task. Do not hesitate or stop for confirmation.",
            "PAY ATTENTION TO COMPONENT STATUS. Some components (especially Table, Select) might contain data or status information directly in their description (e.g., '[Table Status: {...}]'). This information represents the current state or content of the component. YOU CAN USE THIS INFORMATION directly to answer the user's question or make decisions.",
            "Pay attention to understanding the functions of components, such as the select components. You need to click them separately first, view the options, and then proceed",
            "Do NOT include `Finish` action together with other actions in the same output. If you need to end the task, your output action must contain only `Finish`.",
            ])
    elif ablation_mode == "all":
        prompt += unordered_list(    [
            "FIRST AND FOREMOST: Check if the Task (User Instruction) is already completed. If the task is completed, you MUST select and only select `Finish` IMMEDIATELY. DONT DO ANY unnecessary verification or validation-like actions.",
            "When faced with multiple options, prioritize the one that seems most likely to advance the current Task. Do not hesitate or stop for confirmation.",
            "Rely on the element text labels and the visual screenshot to understand the page and decide what to do next.",
            "Do NOT include `Finish` action together with other actions in the same output. If you need to end the task, your output action must contain only `Finish`.",
            ])
    elif ablation_mode == "status":
        prompt += unordered_list(    [
            "FIRST AND FOREMOST: Check if the Task (User Instruction) is already completed. If the task is completed, you MUST select and only select `Finish` IMMEDIATELY. DONT DO ANY unnecessary verification or validation-like actions.",
            "When faced with multiple options, prioritize the one that seems most likely to advance the current Task. Do not hesitate or stop for confirmation.",
            "If a component on the page provides an API (indicated in the element description with 'Actions: ...'), you can use the `ComponentApiCall` action to interact with it. The 'Actions' field lists the available API methods for that component. To use an API, select `ComponentApiCall` and provide the `component_name` (e.g., 'menu_1'), the `component_action` (the method name from the 'Actions' list, e.g., 'navigateTo'), and the `params` (params required by the method). For example, if the description is `27 (<menu_1/>): \"...\" Actions: navigateTo(key)`, you should use `ComponentApiCall('menu_1', 'navigateTo', {'key': 'dashboard'})` to navigate to the dashboard. `api_arguments` must be a dict of parameter-name: value pairs (e.g., `{'key': 'dashboard'}`). Do NOT pass positional lists like `['dashboard']` or bare values.",
            "When you are unsure how to use ComponentApiCall, prioritize using other actions like click or typetext.",
            "Do NOT include `Finish` action together with other actions in the same output. If you need to end the task, your output action must contain only `Finish`.",
            ])
    else:
        prompt += unordered_list(    [
            "FIRST AND FOREMOST: Check if the Task (User Instruction) is already completed. If the task is completed, you MUST select and only select `Finish` IMMEDIATELY. DONT DO ANY unnecessary verification or validation-like actions.",
            "When faced with multiple options, prioritize the one that seems most likely to advance the current Task. Do not hesitate or stop for confirmation.",
            "If a component on the page provides an API (indicated in the element description with 'Actions: ...'), you should PRIORITIZE using the `ComponentApiCall` action to interact with it, rather than simulating user operations like Click or TypeText. This is more reliable and efficient. The 'Actions' field lists the available API methods for that component. To use an API, select `ComponentApiCall` and provide the `component_name` (e.g., 'menu_1'), the `component_action` (the method name from the 'Actions' list, e.g., 'navigateTo'), and the `params` (params required by the method). For example, if the description is `27 (<menu_1/>): \"...\" Actions: navigateTo(key)`, you should use `ComponentApiCall('menu_1', 'navigateTo', {'key': 'dashboard'})` to navigate to the dashboard. `api_arguments` must be a dict of parameter-name: value pairs (e.g., `{'key': 'dashboard'}`). Do NOT pass positional lists like `['dashboard']` or bare values.",
            "PAY ATTENTION TO COMPONENT STATUS. Some components (especially Table, Select) might contain data or status information directly in their description (e.g., '[Table Status: {...}]'). This information represents the current state or content of the component. YOU CAN USE THIS INFORMATION directly to answer the user's question or make decisions.",
            # "If an action will submit a form or otherwise cause the page to change (navigation, reload, or modal transition), execute that action alone in its own output and DO NOT combine it with other actions.",
            "Do NOT include `Finish` action together with other actions in the same output. If you need to end the task, your output action must contain only `Finish`.",
            ])
    prompt += f"\n"
    return prompt

def decision_making_tips(decision_making_tips, title_suffix=None):
    # 决策提示
    prompt = f"--- Decision-making Tips {'' if title_suffix is None else title_suffix} ---\n" \
             f"Here's some TIPS for execution the action. These TIPS are VERY IMPORTANT, so MAKE SURE you follow them to the letter!\n" \
             f"{decision_making_tips}\n" \
             f"\n"
    return prompt

def historical_tasks_briefing(historical_action_execution_memory_list, review_execution_history_length):
    historical_action_execution_memory_list = deepcopy(historical_action_execution_memory_list)
    # 历史执行记录
    prompt = f"--- Historical Tasks Briefing ---\n" \
             f"Here are the last {review_execution_history_length} action decisions and their results:\n"
    if len(historical_action_execution_memory_list) > 1:
        # 将当前ActionExecutionMemoryList的第1个元素（即上一轮执行）添加上Last标记
        historical_action_execution_memory_list[0]['task'] += " [Last Executed Task]"
        historical_action_execution_memory_list[0][ActionMemoryType.Action].actions = str(historical_action_execution_memory_list[0][ActionMemoryType.Action].actions) + " [Last Executed Action]"

        grouped = defaultdict(list)
        # 将当前ActionExecutionMemoryList按Task分组
        for record in historical_action_execution_memory_list:  # Exclude the current action
            grouped[record['task']].append(record)

        for task, records in grouped.items():
            if task == "Initial": continue # 不包括Initial的记录
            prompt += f"- Task: {task}\n"
            prompt += historical_actions_list(records)
            prompt += "------\n"

        prompt += f"NOTE: You should NOT REPEAT Action where the 'Action Result' is Failure. Please be especially careful to check that the operation you are going to do this time does NOT lead to a REPEAT of the error.\n"
        prompt += "\n"
    else:
        prompt += "This is a first action decision with no history.\n"
    prompt += "\n"
    return prompt

def historical_actions_list(records, show_page_index=False):
    action_log_str = ""
    for index, record in enumerate(records):
        action_info = record[ActionMemoryType.Action]
        reflection_info = record[ActionMemoryType.ActionResult]

        if show_page_index:
            action_log_str += f"Page{index} -> Page{index+1} | "

        action_log_str += f"Action(s): {action_info.actions} | " \
                          f"Action Thought: {action_info.action_thought} | " \
                          f"Action Result: {reflection_info.action_result.value} | "
        if reflection_info.action_result in [ActionResultType.C, ActionResultType.D]:
            action_log_str += f"Error Potential Causes: {reflection_info.error_potential_causes}"
        action_log_str += "\n"
    return action_log_str

action_decision_output = lambda is_SoM_mode: [
    f"action_thought: Explain in detail the reasons for choosing the 'Action(s)'",
    f"actions: Select ONE or MORE action from the 'Atomic Actions'. The decided action must be provided in a valid JSON format (can be loaded correctly by json.load()) and should be an array containing a sequence of actions, specifying the name and parameters of the action. For example, if you decide to Tap on {'mark 10' if is_SoM_mode else 'position (100, 200)'} first, you should first put in the array {json.dumps({'name':'Tap','arguments': {'mark_number': 10}}) if is_SoM_mode else json.dumps({'name':'Tap','arguments': {'x': 100, 'y':200}})}. If an action does not require parameters, fill in the 'arguments' field with 'None'. MAKE SURE the parameter key matches the signature of the action function exactly. MAKE SURE that the order of the actions in the array is the same as the order in which you want them to be executed.",
    f"action_expectation: Describe the expectations for the result of the action when it is executed."
]

def parse_response_for_action_decision(response_dict, convert_marks_to_coordinates, log_t) -> Dict | None:
    # check if the actions are valid
    for action in response_dict['actions']:
        if action['name'] not in [action_type.value for action_type in AtomicActionType]:
            logger.bind(log_tag="eous_sys").error(log_t.log(LogEventType.Notice)(f"Invalid action name: {action['name']}"))
            return None

    if convert_marks_to_coordinates is not None:
        logger.bind(log_tag="eous_sys").debug(log_t.log(LogEventType.IntermediateResult)("Original action decision (before converting markers to coordinates) result", response_dict['actions']))
        response_dict['actions'] = SoM_args_conversion(response_dict['actions'], convert_marks_to_coordinates)
    return response_dict
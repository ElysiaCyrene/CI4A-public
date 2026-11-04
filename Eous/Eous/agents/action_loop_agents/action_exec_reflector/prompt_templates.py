from loguru import logger

from Eous.agents.action_loop_agents.action_decider.entity import ActionDecisionInfo
from Eous.agents.action_loop_agents.action_exec_reflector.entity import ActionExecErrorInfo, ActionExecReflectionInfo, ActionResultType
from Eous.agents.prompt_common import ordered_list
from Eous.tools.page_perceptor.entity import PageInfo


def content_for_reflection(visual_mode: bool, previous_progress: str | None, action_info: ActionDecisionInfo, previous_page_info: PageInfo, current_page_info: PageInfo,page_diff: list[int], error_info_list: list[ActionExecErrorInfo]) -> str:

    prompt = f"--- Content for Reflection ---\n" \
             f"- Previous Progress: {previous_progress if previous_progress is not None else 'No progress yet.'}\n" \
             f"\n" \
             f"The actions decided by 'Action Decider' to accomplish the Task and their expectations are:\n" \
             f"- Action(s): {action_info.actions}\n" \
             f"- Action Expectation: {action_info.action_expectation}\n" \
             f"\n" \
             f"Now that the 'Action Executor' has finished executing the operation, you need to compare the before-and-after pages to determine whether it achieved the intended goal.\n" \
             f"\n"
    
    if error_info_list:
        prompt += "\n- Action Execution Error Information:\n"
        for error_info in error_info_list:
            prompt += f"  - {error_info}\n"
        prompt += "\n"

    # Call this function to supplement the prompt "Size of the Image and Additional Information".
    if visual_mode:
        prompt += previous_page_info.perception_infos.get_page_info_note_prompt(description_prefix="The two attached images are two pageshots of your web before and after your last action to reveal the change in status")
        prompt += f"\n"
    prompt += current_page_info.perception_infos.get_page_info_prompt()

    if page_diff is not None and len(page_diff) > 0:
        prompt += f"- Page Changes: The following clickable elements have changed compared to the previous page state: {', '.join([str(idx) for idx in page_diff])}.\n\n"

    return prompt

def order_for_reflection():
    prompt = f"--- Reflective Order ---\n" \
             f"Please follow these steps to check the progress of task completion:\n"
    prompt += ordered_list([
        "Carefully examine the page information before and after the action provided above to determine which of the following 'Action Result' it is:",
        [
            f"A: {ActionResultType.A.value}. The result meets the 'Action Expectation' and fully satisfies the Task. The field 'Task Uncompleted Content' should be set to 'None'.",
            f"B: {ActionResultType.B.value}. The result meets the 'Action Expectation' but DOES NOT fully satisfies the Task. The field 'Task Uncompleted Content' should contain the relevant details.",
            f"C: {ActionResultType.C.value}. The result does NOT meet the 'Action Expectation' OR NOT relevant to Task in terms of CONTENT or FUNCTION, and a fallback to the previous state is required.",
            f"D: {ActionResultType.D.value}. The action was executed, but no change occurred on the page.",
        ],
        f"Always summarize the 'Task Completed part'. Extract valid information helpful for completing the final task from all the information.",
        f"If the 'action result' is B, summarize the 'Task Remaining part'.",
        f"If the 'action result' is C or D, try to explain the 'Error Potential Causes' of the failure.",
    ])
    prompt += "\n"

    prompt += "- IMPORTANT NOTE: \n" \
              "- The Task may require multiple actions to be completed. 'Action Result' Option 'A' should only be selected once the task has been fully satisfied; otherwise, Option 'B' should be selected. For example, if the Current Task is 'search for a keyword in order to find something', and the current action only activates the search box, then Option 'B' should be chosen. Option 'A' may be selected only after the search results are successfully displayed.\n" \
              "- A successful operation with zero search results (e.g., '0 items found' after applying correct filters) can be considered a success (Option A). However, before confirming, you should suggest trying a DIFFERENT approach first. Mark it as Option C to prompt the Action Decider to attempt alternative methods (e.g., REMOVING some non-essential keywords to broaden the search, or using different filters). If the result is still the same, then you can confirm it as Option A.\n" \
              "- An incorrect page (such as an advertisement page) is often highly relevant to the task in terms of content, but usually lacks the functionality required to complete the task. Special attention should be paid to identifying incorrect pages.\n" \
              "- If the current page is an incorrect page or if a backward navigation might be needed to continue the process, should select Option 'C' instead of Option 'B' (regardless of whether the 'Action Expectation' is met). \n" \
              "- CHECK FEASIBILITY: You must verify whether the current page has the potential to complete the Task. If you find that the current page is a dead end (e.g., irrelevant content, 0 results that shouldn't be 0, or missing features), you should mark it as Option 'C' and explicitly suggest navigating to a different page or modifying the search query in the 'error_potential_causes'.\n" \
              "- PAY ATTENTION TO COMPONENT STATUS. Some components (especially Table, Select) might contain data or status information directly in their description (e.g., '[Table Status: {...}]'). This information represents the current state or content of the component. Note that you can access this information even if it is not currently displayed in the visible area of the page. YOU CAN USE THIS INFORMATION directly to make decisions.\n"
    prompt += "\n"

    return prompt

reflection_output = [
    f"reflection_thought: Explain in detail the reasons for choosing the type of 'Action Result'. If Option 'A' is selected, it is important to clearly explain why the Task has been completely finished.",
    f"action_result: Select Option 'A', 'B', 'C' or 'D'. Pay special attention to the difference between Option 'B' and Option 'C'.",
    f"task_completed_part: Extract valid information helpful for completing the final task from all the information.",
    f"task_remaining_part: If the current task has already been completed, fill in 'None' here; otherwise, fill it in based on the current progress.",
    f"error_potential_causes: If the 'Action Result' is Option 'A' or Option 'B', fill in 'None' here. If the 'Action Result' is Option 'C' or Option 'D', describe in detail the error and the potential cause of failure.",
]

def is_finished_action(reflection_info: ActionExecReflectionInfo, action_info: ActionDecisionInfo) -> bool:
    if reflection_info.action_result == ActionResultType.A and len(action_info.actions) > 0 and action_info.actions[0]['name'] == "Finish":
        logger.bind(log_tag="eous_sys").info("All requirements in the user's Instruction have been completed.")
        return True
    return False
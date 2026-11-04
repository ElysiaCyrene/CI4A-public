from enum import Enum


class AtomicActionType(Enum):
    Navigate = "Navigate"
    
    Click = "Click"
    TypeText = "TypeText"
    Scroll = "Scroll"
    # GoBack = "GoBack"

    ComponentApiCall = "ComponentApiCall"

    Finish = "Finish"


# arguments及其description 还没有完善
ATOMIC_ACTION_SIGNITURES = {
    AtomicActionType.ComponentApiCall: {
        "arguments": ["component_name", "component_action", "params"],
        "SoM_arguments": ["component_name", "component_action", "params"],
        "description": lambda is_SoM_mode: "Call the API '{component_name}' of the component '{component_action}' with arguments '{params}'."
                       "You can use it to interact with complex components like date pickers, forms, menus, etc.",
    },
    AtomicActionType.Click: {
        "arguments": ["x", "y"],
        "SoM_arguments": ["mark_number"],
        "description": lambda is_SoM_mode: f"Click the position {'tagged with {mark_number}' if is_SoM_mode else '({x}, {y})'} in current screen."
                       "You can use it to click on a button (with an icon or text), a link or to check an option, an input box (for typing) in general.",
    },
    AtomicActionType.TypeText: {
        "arguments": ["text"],
        "SoM_arguments": ["mark_number", "text"],
        "description": lambda is_SoM_mode: "Type the text '{text}' in the current input box tagged with {mark_number}."
                       "You can use it to fill in a form, a search box, a chat box or any other input box.",
    },
    AtomicActionType.Scroll: {
        "arguments": ["target", "direction", "distance"],
        "SoM_arguments": ["target", "direction", "distance"],
        "description": lambda is_SoM_mode: "Scroll the screen {direction} by {distance} pixels in the current box tagged with {target} or WINDOW."
                       "You can use it to scroll a webpage, a list, a chat history or any other scrollable area.",
    },
    # AtomicActionType.GoBack: {
    #     "arguments": [],
    #     "SoM_arguments": [],
    #     "description": lambda is_SoM_mode: "Go back to the previous page. You can use it to go back to the previous page.",
    # },
    AtomicActionType.Finish: {
        "arguments": ["message"],
        "SoM_arguments": ["message"],
        "description": lambda is_SoM_mode: "Called after completing all the requirements in the user's Instruction. If the user needs specific information (e.g., 'find the most expensive product'), provide it in the '{message}' argument. Otherwise, describe the completion of the task (e.g., 'The price of the product has been increased by 5%').",
    }
}
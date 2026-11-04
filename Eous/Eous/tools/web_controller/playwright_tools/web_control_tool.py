import asyncio
import platform
from typing import List, Dict

from loguru import logger
from Eous.config.eous_config import EousConfig
from Eous.entity.log_template import LogTemplate, LogEventType
from Eous.agents.action_loop_agents.action_exec_reflector.entity import ActionExecErrorInfo
from Eous.tools.web_controller.action_type import AtomicActionType
from Eous.tools.web_controller.entity import WebController

class PlaywrightWebController(WebController):
    def __init__(self, config: EousConfig):
        self.page = config.page
        self.default_start_page = config.default_start_page
        self.log_t = LogTemplate(self, "PlaywrightWebController")  # 日志模板

    async def custom_execute_action(self, atomic_action: AtomicActionType, args) -> str | None | list[str]:
        logger.bind(log_tag="eous_sys").debug(self.log_t.log(LogEventType.Notice)(f"Executing Action: {atomic_action} (args: {args})"))
        match atomic_action:
            case AtomicActionType.ComponentApiCall:
                component_name = args["component_name"]
                component_action = args["component_action"]
                params = args.get("params", {})
                
                # 构建参数列表，假设 api_arguments 是一个字典，需要按顺序传递给 call
                # 或者如果 call 支持对象传参，直接传 api_arguments
                # 这里假设 window.__ci4a__.call 的第三个参数是参数对象或列表
                
                try:
                    # 将 params 转换为 JSON 字符串以便在 evaluate 中使用
                    import json
                    args_json = json.dumps(params)
                    
                    # 执行 JS 调用
                    js_code = f"""
                        window.__ci4a__.call('{component_name}', '{component_action}', {args_json})
                    """
                    result_data = await self.page.evaluate(js_code)
                    result = f"Called API {component_action} on {component_name}. Result: {result_data}"
                except Exception as e:
                    logger.bind(log_tag="eous_sys").error(self.log_t.log(LogEventType.Notice)(f"Failed to call API {component_action} on {component_name}: {e}"))
                    result = f"Failed to call API {component_action} on {component_name}. Error: {e}"

            case AtomicActionType.Navigate:
                url = args["url"]
                if not (url.startswith("http://") or url.startswith("https://")):
                    url = "https://" + url
                try:
                    await self.page.goto(url)
                    result = f"Navigated to {url}"
                except Exception as e:
                    await self.page.goto(self.default_start_page)
                    logger.bind(log_tag="eous_sys").error(self.log_t.log(LogEventType.Notice)(f"Failed to navigate to {url}: {e}"))
                    result = f"Failed to goto {url}. Navigated to {self.default_start_page}."

            case AtomicActionType.Click:
                x, y = args["x"], args["y"]
                await self.page.mouse.click(x, y)
                try:
                    await self.page.wait_for_load_state(state="networkidle", timeout=3000)
                except Exception:
                    pass
                result = f"Clicked at ({x}, {y})"

            case AtomicActionType.TypeText:
                x, y = args["x"], args["y"]
                await self.page.mouse.click(x, y)

                text = args["text"]
                select_all = "Meta+A" if platform.system() == "Darwin" else "Control+A"
                await self.page.keyboard.press(select_all)
                await self.page.keyboard.press("Backspace")
                await self.page.keyboard.type(text)
                await self.page.keyboard.press("Enter")
                try:
                    await self.page.wait_for_load_state(state="networkidle", timeout=3000)
                except Exception:
                    pass
                return f"Typed {text} and submitted"
            
            case AtomicActionType.Scroll:
                scroll_target = args["target"]
                direction = args["direction"]
                scroll_amount = args.get("distance", 200)
                if scroll_target.upper() == "WINDOW":
                    # Not sure the best value for this:
                    scroll_direction = (
                        -scroll_amount if direction.lower() == "up" else scroll_amount
                    )
                    await self.page.evaluate(f"window.scrollBy(0, {scroll_direction})")
                else:
                    # Scrolling within a specific element
                    x, y = args["x"], args["y"]
                    scroll_direction = (
                        -scroll_amount if direction.lower() == "up" else scroll_amount
                    )
                    await self.page.mouse.move(x, y)
                    await self.page.mouse.wheel(0, scroll_direction)
                return f"Scrolled {direction} in {'window' if scroll_target.upper() == 'WINDOW' else 'element'}"
            
            # case AtomicActionType.GoBack:
            #     await self.page.go_back()
            #     result = "Went back to the previous page"
            case _:
                raise RuntimeError(f"Unknown atomic action: {atomic_action}")
        return result

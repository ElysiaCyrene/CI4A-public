import asyncio
from dataclasses import dataclass, field
from typing import List, Dict, Tuple
from loguru import logger

from Eous.tools.web_controller.action_type import AtomicActionType
from Eous.tools.page_perceptor.entity import PageshotFileInfo

class WebController:

    async def execute_actions(self, actions: List[Dict[str, AtomicActionType | dict]]) -> None:
        for action in actions:
            atomic_action, args = AtomicActionType(action["name"]), action["arguments"]
            await self.execute_action(atomic_action, args)

    async def execute_action(self, atomic_action: AtomicActionType, args) -> str | None | list[str]:
        match atomic_action:
            # case AtomicActionType.Wait:
            #     await asyncio.sleep(args["wait_time"])
            #     return None
            case AtomicActionType.Finish:
                logger.bind(log_tag="eous_sys").info("All requirements in the user's Instruction have been completed.")
                return None
            # case AtomicActionType.NeedInteraction:
            #     await asyncio.sleep(1)
            #     logger.bind(log_tag="eous_sys").warning("Executor discovery requires user interaction.")
            #     return None
            case _:
                return await self.custom_execute_action(atomic_action, args)

    async def custom_execute_action(self, atomic_action: AtomicActionType, args) -> str | None | list[str]:
        ...

class PageCapturer:

    async def get_page(self) -> Tuple[PageshotFileInfo, str | None]:
        ...

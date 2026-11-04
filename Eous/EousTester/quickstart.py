import asyncio
import os
import sys
import re
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from loguru import logger
from Citlali.core.runtime import CitlaliRuntime
from Eous.config.eous_config import EousConfig
from Eous.config.model_config import CoreChatModelConfig
from Eous.agents.action_loop_agents.action_decider.agent import ActionDeciderAgent
from Eous.agents.action_loop_agents.action_exec_reflector.agent import ActionExecReflectorAgent
from Eous.tools.page_perceptor.page_perceptor import PagePerceptor
from Eous.tools.web_controller.action_executor import ActionExecutor
from Eous.memory.short_time_memory_manager import ShortTimeMemoryManager
from Eous.entity.type import EventType, EventChannel, EventStatus
from Eous.entity.message_entity import EventMessage
from Eous.entity.info_entity import TaskInstructionInfo

class EousTester:
    def __init__(self, config:EousConfig):
        self._config = config
        
        # 配置全局日志
        logger.remove()
        logger.add(sink=sys.stdout, level="INFO", colorize=True, filter=lambda x: (x["extra"].get("log_tag") == "citlali_sys"))
        logger.add(sink=sys.stdout, level="DEBUG", colorize=True, filter=lambda x: (x["extra"].get("log_tag") == "eous_sys"))

        remove_ansi = lambda record: not record.update({"message": re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]').sub('', record["message"])}) or True

        log_path = self._config.get_log_temp_path()
        logger.add(log_path + "/eous_sys_log.log", filter=lambda x: x["extra"].get("log_tag") == "eous_sys" and remove_ansi(x), format="{message}", level="DEBUG")
        logger.add(log_path + "/citlali_sys_log.log", filter=lambda x: x["extra"].get("log_tag") == "citlali_sys", level="DEBUG")
        logger.add(log_path + "/agent_res&req_log.log", filter=lambda x: x["extra"].get("log_tag") in ["agent_req", "agent_res"], level="DEBUG")
        logger.add(log_path + "/page_perception_log.log", filter=lambda x: x["extra"].get("log_tag") == "page_perception", level="DEBUG")
    

    async def test(self, task_instruction: str, task_url: str):
        runtime = CitlaliRuntime()
        runtime.run()
        runtime.register(lambda: ActionDeciderAgent(runtime, self._config))
        runtime.register(lambda: ActionExecReflectorAgent(runtime, self._config))
        runtime.register(lambda: PagePerceptor(runtime, self._config))
        runtime.register(lambda: ActionExecutor(runtime, self._config))
        runtime.register(lambda: ShortTimeMemoryManager(runtime, self._config))

        await runtime.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.Task, EventStatus.CREATED, TaskInstructionInfo(
            ori_instruction=task_instruction,
            language="English",
            url=task_url,
        )))


        await runtime.stop_when_idle()


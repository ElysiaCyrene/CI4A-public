import asyncio
from copy import deepcopy
import re
import os

from loguru import logger

from Eous.config.eous_config import EousConfig
from Eous.entity.log_template import LogTemplate, LogEventType
from Eous.tools.web_controller.entity import PageCapturer, PageshotFileInfo

class PlaywrightPageCapturer(PageCapturer):
    def __init__(self, config: EousConfig):
        self.pageshot_temp_path = config.get_pageshot_temp_path()
        self.pageshot_filename = config.pageshot_filename
        self.page = config.page
        self.log_t = LogTemplate(self, "PlaywrightPageCapturer")

    async def get_page(self):
        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerStart)("Pageshot"))

        await self.page.wait_for_load_state(state="load")  # 避免速度过快导致屏幕内容没有完成加载

        pageshot_file_info = PageshotFileInfo(self.pageshot_temp_path, self.pageshot_filename, 'png')
        # get pageshot
        await self.page.screenshot(path=pageshot_file_info.get_pageshot_fullpath(), full_page=False, timeout=1200000) 

        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerCompleted)("Pageshot"))
        return pageshot_file_info
    

import os
import time
import uuid
from enum import Enum
from dotenv import load_dotenv
from playwright.async_api import Page

from Eous.config.model_config import CoreChatModelConfig, RAGChatModelConfig, RAGEmbedModelConfig, ModelConfig

class WebControllerType(Enum):
    PlayWright = "PLAYWRIGHT"

class PagePerceptionType(Enum):
    PSIP = "PSIP"

class EousConfig:
    def __init__(self,
                 task_name: str = "Unamed",
                 temp_path=None,
                 model: CoreChatModelConfig | None = None,
                 page: Page | None = None,
                 pageshot_filename: str | None = None,
                 action_executor_type: WebControllerType = WebControllerType.PlayWright,
                 pageshot_getter_type: WebControllerType = WebControllerType.PlayWright,
                 page_perception_type: PagePerceptionType = PagePerceptionType.PSIP,
                 visual_mode: bool = True,
                 pageshot_max_width: int | None = 1920,
                 pageshot_max_height: int | None = 1080,
                 ablation_mode: str | None = None # status, tool, metadata, all
                 ):

        # path of local temporary storage
        self.temp_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "tmp") if temp_path is None else temp_path
        os.makedirs(self.temp_path, exist_ok=True)

        current_time = time.strftime("%Y%m%d%H%M%S", time.localtime())
        self.task_temp_path = f"{self.temp_path}/{task_name}_{current_time}_{uuid.uuid4().hex[:8]}"
        os.mkdir(self.task_temp_path)

        # build model client
        self.model_client = model.build() if model else None

        # Playwright Page object
        self.default_start_page = "https://www.google.com"
        self.page = page

        self.pageshot_filename = "pageshot" if pageshot_filename is None else pageshot_filename


        # execution strategy
        self.action_executor_type = action_executor_type 
        self.pageshot_getter_type = pageshot_getter_type  
        self.page_perception_type = page_perception_type

        # visual mode
        self.visual_mode = visual_mode

        # optional max pageshot dimensions (None = no forced compression)
        self.pageshot_max_width = pageshot_max_width
        self.pageshot_max_height = pageshot_max_height

        self.ablation_mode = ablation_mode

    def get_pageshot_temp_path(self):
        return os.path.join(self.task_temp_path, "pageshot")
    
    def get_log_temp_path(self):
        return os.path.join(self.task_temp_path, "log")

    def get_restore_point_path(self):
        return os.path.join(self.task_temp_path, "restore_point")
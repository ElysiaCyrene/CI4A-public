import string
import random
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional

from PIL import Image as PILImage
from loguru import logger

from Citlali.utils.image import Image
from Eous.entity.info_entity import AgentPO

@dataclass
class PageshotFileInfo:
    file_path: str
    file_name: str
    file_type: str
    file_extra_name: str | None = None
    file_build_timestamp: int = field(
        default_factory=lambda: int(datetime.now().timestamp())
    )

    def set_extra_name(self, extra_name):
        self.file_extra_name = extra_name

    def get_pageshot_filename(self, no_type: bool = False) -> str:
        return (f"{self.file_name}_"
                f"{str(self.file_build_timestamp)}{'' if self.file_extra_name is None else f'_{self.file_extra_name}'}"
                f"{''if no_type else f'.{self.file_type}'}")

    def get_pageshot_fullpath(self):
        return f"{self.file_path}/{self.get_pageshot_filename()}"

    def get_pageshot_PILImage_file(self):
        return PILImage.open(self.get_pageshot_fullpath())

    def get_pageshot_Image_file(self):
        return Image(PILImage.open(self.get_pageshot_fullpath()))

    def compress_image_to_jpeg(self, quality=50):
        with PILImage.open(self.get_pageshot_fullpath()) as img:
            img = img.convert('RGB')
            self.file_type = 'jpeg'
            img.save(self.get_pageshot_fullpath(), 'JPEG', quality=quality)

    def __str__(self):
        return self.get_pageshot_filename()


@dataclass
class PagePerceptionInfo:
    width: int
    height: int
    infos: Any
    use_set_of_marks_mapping: bool = True
    log_tag: str = field(init=False)

    def __post_init__(self):
        self.log_tag = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
        logger.bind(log_tag="page_perception").debug(f"Page Info [{self.log_tag}]\n{self._perception_infos_to_str()}")

    def _perception_infos_to_str(self) -> str:
        return str(self.infos)

    def __str__(self):
        return f"RECORDED IN THE LOG {self.log_tag} | Page Size: Width-{self.width} | Height-{self.height}"

    def convert_marks_to_coordinates(self, mark):
        ...

    def get_page_info_prompt(self, extra_suffix=None):
        ...

    def get_page_info_note_prompt(self, description_prefix):
        ...

@dataclass
class PageInfo(AgentPO):
    pageshot_file_info: PageshotFileInfo
    perception_infos: PagePerceptionInfo
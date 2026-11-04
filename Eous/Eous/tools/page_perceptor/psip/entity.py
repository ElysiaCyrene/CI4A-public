from Eous.tools.page_perceptor.entity import PagePerceptionInfo
from loguru import logger

class PSIPInfo(PagePerceptionInfo):
    def __init__(self, width, height, perception_infos, SoM_mapping):
        super().__init__(width, height, perception_infos, use_set_of_marks_mapping=True)
        self.SoM_mapping = SoM_mapping # [{'x': 37, 'y': 30.5, 'type': 'a', 'text': '新闻', 'ariaLabel': ''}, ...]
        logger.bind(log_tag="page_perception").debug(f"SoM Mapping [{self.log_tag}]\n{self.SoM_mapping}")

    def convert_marks_to_coordinates(self, mark):
        return self.SoM_mapping[mark]
    
    def get_page_info_prompt(self, extra_suffix=None):
        prompt = ""
        # prompt = f"- Page Structured Textualized Description {('for '+ extra_suffix) if extra_suffix else ''}: \n"
        prompt = f"- Component Info {('for '+ extra_suffix) if extra_suffix else ''}: \n"
        prompt += f"{self.infos}\n\n"

        return prompt

    def get_page_info_note_prompt(self, description_prefix):
        prompt = f"{description_prefix}, with a width and height of {self.width} and {self.height} pixels respectively.\n"
        prompt += f"We have provided an image of the page and labeled all clickable elements using boxes. When clicking or typing, ensure to select the correct bounding box. Numeric labels lie in the top-left corner of their corresponding bounding boxes and are colored the same.\n"
        return prompt

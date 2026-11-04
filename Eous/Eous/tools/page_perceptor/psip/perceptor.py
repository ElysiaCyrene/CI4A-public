from copy import deepcopy
import json

from loguru import logger

from Eous.entity.log_template import LogTemplate, LogEventType
from Eous.config.eous_config import EousConfig
from Eous.tools.page_perceptor.entity import PageshotFileInfo
from Eous.tools.page_perceptor.psip.tool import mark_page, draw_bounding_boxes, get_window_size
from Eous.tools.page_perceptor.psip.entity import PSIPInfo

class PageStructuredInfoPerception:
    def __init__(self, config: EousConfig):
        self.log_t = LogTemplate(self,"PageStructuredInfoPerception")  # 日志模板
        self.page = config.page
        self.config = config
        self.visual_mode = config.visual_mode
        self.ablation_mode = config.ablation_mode

    async def get_perception_infos(self, raw_pageshot_file_info: PageshotFileInfo):
        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerStart)("Page Perception"))
       
        logger.bind(log_tag="eous_sys").debug(self.log_t.log(LogEventType.Notice)("Adding Mark to pageshots..."))

        # 获取截屏图片的尺寸
        pageshot_image = raw_pageshot_file_info.get_pageshot_PILImage_file()
        width, height = pageshot_image.size
        width, height = (self.config.pageshot_max_width, self.config.pageshot_max_height) if (self.config.pageshot_max_width and self.config.pageshot_max_height) else (width, height)

        # 在页面上获取标记的边界框
        SoMMapping = await mark_page(self.visual_mode, self.page)

        windowSize = await get_window_size(self.page)

        pageshot_image_marked = draw_bounding_boxes(
            pageshot_image,
            SoMMapping,
            box_color=None,
            line_width=2,
            font_size=14,
            idx_pos="lt",
            show_idx=True,
            max_width=(self.config.pageshot_max_width or None),
            max_height=(self.config.pageshot_max_height or None),
            windowSize=windowSize,
        )
        
        # 构建新的截屏文件对象
        pageshot_file_info = deepcopy(raw_pageshot_file_info)
        pageshot_file_info.file_extra_name = "marked"
        pageshot_image_marked.convert("RGB").save(pageshot_file_info.get_pageshot_fullpath())

        # 构建结构化页面描述信息（纯文本，格式良好）
        # - 每行包含：index (<type/>): "text"
        # - 对于组件，若存在 Actions 则在下一行缩进显示
        # - 仅当存在子组件时才显示 Children 列表（每个子组件一行，缩进）
        lines = []
        for i, bbox in enumerate(SoMMapping):
            el_type = bbox.get("type")
            is_component = bbox.get("isComponent", False)
            idx = f'[{i}]'

            if is_component:
                status = bbox.get("componentStatus", "").replace(',"disabled":false', '')  # 去掉无关的状态信息
                status_json = json.loads(status) if status else {}
                text = bbox.get("ariaLabel") or bbox.get("text", "")
                metadata = status_json.pop("metadata", None) 
                status = json.dumps(status_json) if status_json else ""

                if self.ablation_mode == "all":
                    pass  # 全部消融：不输出任何组件描述
                elif self.ablation_mode == "status":
                    lines.append(f'{idx} <{el_type}/>: "{text}"')
                else:
                    if status:
                        lines.append(f'{idx} <{el_type}/>:\n  Status: "{status}"')
                    else:
                        lines.append(f'{idx} <{el_type}/>: "{text}"')

                if self.ablation_mode not in ("metadata", "all"):
                    if metadata:
                        lines.append(f'  Metadata: {json.dumps(metadata)}')

                api_actions = bbox.get("apiActions", "")
                if api_actions and self.ablation_mode not in ("tool", "all"):
                    lines.append(f'  Actions: {api_actions}')

                children = bbox.get("componentChildren") or []
                if children and self.ablation_mode != "all":
                    lines.append("  Children:")
                    for c in children:
                        lines.append(f'    - {c}')
            else:
                text = bbox.get("ariaLabel") or bbox.get("text", "")
                lines.append(f'{idx} <{el_type}/>: "{text}"')

        page_desc = "\n".join(lines)

        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerCompleted)("Page Perception"))
        return pageshot_file_info, PSIPInfo(width, height, page_desc, SoMMapping)
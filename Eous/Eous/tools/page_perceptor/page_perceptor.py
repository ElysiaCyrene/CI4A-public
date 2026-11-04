from loguru import logger

from Citlali.core.type import ListenerType
from Citlali.core.worker import Worker, listener
from Eous.config.eous_config import WebControllerType, PagePerceptionType, EousConfig
from Eous.entity.log_template import LogTemplate, LogEventType
from Eous.tools.web_controller.playwright_tools.page_capture_tool import PlaywrightPageCapturer
from Eous.entity.message_entity import EventMessage
from Eous.tools.page_perceptor.entity import PageInfo
from Eous.tools.page_perceptor.psip.perceptor import PageStructuredInfoPerception
from Eous.entity.type import EventType, EventChannel, EventStatus


class PagePerceptor(Worker):
    def __init__(self, runtime, config: EousConfig):
        super().__init__(runtime, "PagePerceptor", "PagePerceptor")
        self.log_t = LogTemplate(self)  # 日志模板

        self.pageshot_getter_type = config.pageshot_getter_type
        if self.pageshot_getter_type == WebControllerType.PlayWright:
            self.pageshot_tool = PlaywrightPageCapturer(config)

        self.page_perception_type = config.page_perception_type
        if self.page_perception_type == PagePerceptionType.PSIP:
            self.page_perceptor = PageStructuredInfoPerception(config)

    @listener(ListenerType.ON_NOTIFIED, channel=EventChannel.WEB_CHANNEL,
              listen_filter=lambda msg: msg.match(EventType.ActionExecution, EventStatus.DONE))
    async def on_page_percept(self, message: EventMessage, message_context):
        await self.do_page_percept(message, message_context)

    @listener(ListenerType.ON_NOTIFIED, channel=EventChannel.WEB_CHANNEL,
              listen_filter=lambda msg: msg.match(EventType.Task, EventStatus.CREATED))
    async def on_first_page_percept(self, message: EventMessage, message_context):
        await self.do_page_percept(message, message_context)

    async def do_page_percept(self, message: EventMessage, message_context):
        # 发布PagePerception CREATED事件 & 记录日志
        await self.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.PagePerception, EventStatus.CREATED))
        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerStart)("Page Perception"))

        pageshot_file_info = await self.pageshot_tool.get_page()

        marked_pageshot_file_info, psip_info = await self.page_perceptor.get_perception_infos(pageshot_file_info)
        page_info = PageInfo(marked_pageshot_file_info, psip_info)

        logger.bind(log_tag="eous_sys").debug(self.log_t.log(LogEventType.IntermediateResult)("Page perception result", page_info))

        # 发布PagePerception Done事件 & 记录日志
        await self.publish(EventChannel.WEB_CHANNEL, EventMessage(EventType.PagePerception, EventStatus.DONE, page_info))
        logger.bind(log_tag="eous_sys").info(self.log_t.log(LogEventType.WorkerCompleted)("Page Perception"))
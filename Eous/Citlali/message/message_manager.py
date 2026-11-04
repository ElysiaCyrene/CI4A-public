import asyncio
import json
from asyncio import Queue, Event
from collections.abc import Callable
from dataclasses import asdict
from typing import Optional, Awaitable

from loguru import logger

from ..core.worker_keeper import WorkerKeeper
from ..core.type import MessageType, ListenerType
from .channel_keeper import ChannelKeeper
from .entity import MessageParcel


class MessageManager:
    def __init__(self, worker_keeper: WorkerKeeper, notifier: Optional[Callable[[dict], Awaitable]] = None):
        self._queue: [MessageParcel] = Queue()
        self._worker_keeper = worker_keeper
        self._channel_keeper = ChannelKeeper(self._worker_keeper)

        self.errors = []
        self._active_tasks = 0
        self._idle_event = Event()
        self._idle_event.set()  # 初始为空闲

    def subscribe(self, worker_name, channels):
        return self._channel_keeper.subscribe(worker_name, channels)

    def start_listen(self, stop_event: asyncio.Event):
        async def _run():
            is_stopping = False
            while True:
                message_parcel = await self._queue.get()
                if stop_event.is_set() or message_parcel.message_context.type == MessageType.STOP:
                    if not is_stopping:
                        logger.bind(log_tag="citlali_sys").critical(f"STOP EVENT RECEIVED! Citlali will be terminated.")
                        is_stopping = True
                        stop_event.set()
                    self._queue.task_done()
                    if self._queue.empty() and self._active_tasks == 0:
                        self._idle_event.set()
                    continue

                if is_stopping:
                    self._queue.task_done()
                    if self._queue.empty() and self._active_tasks == 0:
                        self._idle_event.set()
                    continue

                self._active_tasks += 1
                self._idle_event.clear()

                asyncio.create_task(self._handle_message(message_parcel))
        asyncio.create_task(_run())

    async def stop_listen_when_idle(self):
        await self._queue.join()
        await self._idle_event.wait()  # 所有任务也处理完
        if self.errors:
            raise RuntimeError("Eous runtime failed; inspect run.log") from self.errors[0]
        logger.bind(log_tag="citlali_sys").critical(f"ALL TASK DONE! Citlali will be terminated.")

    async def put_message(self, message, recipient, sender, message_type: MessageType):
        # 仅在MessageType.REQUEST时有Reply
        reply_callback = asyncio.get_event_loop().create_future() if message_type is MessageType.REQUEST else None

        message_parcel = MessageParcel(message, recipient, sender, message_type, reply_callback)
        await self._queue.put(message_parcel)
        return reply_callback if message_type is MessageType.REQUEST else None

    async def _handle_message(self, message_parcel: MessageParcel):
        try:
            handler_coroutine = await self.on_message(message_parcel)
            await handler_coroutine
        except Exception as e:
            logger.bind(log_tag="citlali_sys").error(f"Message handling error: {e}")
            self.errors.append(e)
            if message_parcel.reply_callback is not None and not message_parcel.reply_callback.done():
                message_parcel.reply_callback.set_exception(e)
        finally:
            self._queue.task_done()
            self._active_tasks -= 1
            if self._queue.empty() and self._active_tasks == 0:
                self._idle_event.set()

    async def on_message(self, message_parcel: MessageParcel):
        logger.bind(log_tag="citlali_sys").debug("PROCESSING MESSAGE INFO: {}", message_parcel)
        logger.bind(log_tag="citlali_sys").bind(log_tag="AgentPrompt").debug("PROCESSING MESSAGE: {}", message_parcel.message)
        match message_parcel.message_context.type:
            case MessageType.REQUEST:
                return self._call(message_parcel)
            case MessageType.NOTIFICATION:
                return self._notice(message_parcel)
            case MessageType.RESPONSE:
                return self._reply(message_parcel)

    async def _reply(self, message_parcel):
        message_parcel.reply_callback.set_result(message_parcel.message)

    async def _call(self, message_parcel):
        worker = self._worker_keeper.get_worker(message_parcel.recipient)
        if worker is not None:
            reply = await worker.listen(ListenerType.ON_CALLED, message_parcel.message, message_parcel.message_context)
            await self._queue.put(MessageParcel(message=reply,
                                                recipient=message_parcel.message_context.sender,
                                                sender=message_parcel.recipient,
                                                type=MessageType.RESPONSE,
                                                reply_callback=message_parcel.reply_callback))
        else:
            return None

    async def _notice(self, message_parcel):
        await self._channel_keeper.publish(message_parcel)

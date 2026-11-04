import inspect
from dataclasses import fields, MISSING, is_dataclass, dataclass, field
from enum import Enum
from typing import List, Dict, Any, Type, TypeVar

T = TypeVar("T", bound="AgentPO")

class AgentPO:
    def __str__(self) -> str:
        cls_name: str = self.__class__.__name__
        header: str = f"-------------{cls_name}-------------"
        footer: str = f"-----------{cls_name} END-----------"

        parts: List[str] = [f"\n {header}"]

        for f in fields(self):
            value: Any = getattr(self, f.name)
            label: str = f.metadata.get('alias', f.name).replace('_', ' ').capitalize()

            if isinstance(value, Enum):
                parts.append(f"\n - {label}: {value.name} ({value.value})")
            else:
                parts.append(f"\n - {label}: {value}")

        parts.append(f"\n {footer}")
        return "".join(parts)

    # 如果存在嵌套 dataclass，嵌套的也需要继承AgentPO
    @classmethod
    def from_dict(cls: Type[T], data: Dict[str, Any]) -> T:
        if not isinstance(data, dict):
            raise TypeError("from_dict expects a dict as input.")

        kwargs: Dict[str, Any] = {}
        for f in fields(cls):
            if f.name not in data:
                if f.default is MISSING and f.default_factory is MISSING:   # noqa: B008
                    raise KeyError(f"Missing required field: {f.name!r}")
                continue

            value = data[f.name]

            if inspect.isclass(f.type) and issubclass(f.type, Enum) and isinstance(value, str):
                try:
                    value = f.type[value]
                except KeyError as e:
                    valid = list(f.type.__members__.keys())
                    raise ValueError(f"Invalid enum value '{value}' for field '{f.name}'. Expected one of {valid}") from e

            # 嵌套 dataclass 递归解析
            if is_dataclass(f.type) and isinstance(value, dict):
                value = f.type.from_dict(value)

            kwargs[f.name] = value

        return cls(**kwargs)

    # 可以嵌套 dataclass
    def to_dict(self) -> Dict[str, Any]:
        def _serialize(obj):
            if is_dataclass(obj):
                return {f.name: _serialize(getattr(obj, f.name)) for f in fields(obj)}
            if isinstance(obj, (list, tuple)):
                return [_serialize(item) for item in obj]
            return obj

        return _serialize(self)

@dataclass
class TaskInstructionInfo(AgentPO):
    ori_instruction: str
    language: str
    url: str

    def get_instruction(self):
        return self.ori_instruction

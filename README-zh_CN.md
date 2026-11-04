# CI4A 公开代码整理版

保留 Eous、AntDX / MaterialX / ElementX 三个组件库，以及各自的 WebArena。包含三库组件测试页和 **5 个 WebArena 示例任务：0、1、11、107、108**。

已移除其他任务及嵌套重复任务集、admin / Traccar、基线、原数据库、登录态、历史运行结果、原 Git 历史、本机配置和旧打包文件。原项目与备份未改动。

## 安装与启动

需要 Node.js 22.12+、pnpm 10.28.0、Python 3.11+。在仓库根目录执行：

```powershell
powershell -NoProfile -File scripts/setup.ps1
pnpm dev:components
```

组件页分别为 5283 / 5284 / 5285，顺序 AntDX / MaterialX / ElementX。组件页无需数据库或模型密钥。

WebArena 需要自行提供有权使用的 Magento/WebArena 数据库，在 `.env` 设置 `DB_*`。**本仓库不包含原数据库快照，不能仅安装代码就复现原数据库内容。** 可选 Docker 入口见 [完整使用说明](README.md)。配置后：

```powershell
pnpm dev:webarena
```

三库 WebArena 分别为 5273 / 5274 / 5275；共享 API 为 5000。端口冲突时明确报错，请停止旧服务或在 `.env` 修改端口；不要误停其他项目。

## Eous

在 `.env` 填写自己的 `EOUS_API_KEY`、`EOUS_API_BASE`、`EOUS_MODEL`。模型会接收页面观察，运行可能产生服务商费用；日志与截图不应直接公开。

```powershell
# 无模型感知检查
.\.venv\Scripts\python.exe Eous/run.py --library materialx --probe --headless
# WebArena 示例任务
.\.venv\Scripts\python.exe Eous/run.py --library antdx --target webarena --task-id 0 --headless
```

| ID | 查询内容 |
|---|---|
| 0 | 2022 年最畅销商品 |
| 1 | 2022 年第一季度最畅销品牌 |
| 11 | 包含指定词语的评论数量 |
| 107 | 2022 年 5–12 月每月成功订单数量 |
| 108 | 2023 年 1–5 月每月成功订单数量 |

原查询意图和标准答案保留，仅调整重建环境的 URL 与登录态元数据。答案依赖实际数据库；本地找回的数据曾与任务 0 的原答案不一致，未为通过而改答案。Eous 结束不等于通过正式评测，`benchmark_evaluated` 始终为 false。

## 发布检查

见 [脱敏和验证报告](docs/RELEASE_AUDIT.md)。`python scripts/release_audit.py` 检查任务数量、禁带文件和发布文件列表。第三方许可证和必要版权署名保留，见 [第三方说明](THIRD_PARTY_NOTICES.md)；未擅自为 CI4A/Eous 新增统一开源许可证。

这是独立的新 Git 仓库，没有复制旧提交。公开仓库：[ElysiaCyrene/CI4A-public](https://github.com/ElysiaCyrene/CI4A-public)。密钥、私有数据、依赖和后续运行结果均应留在忽略目录。完整命令、限制和 Docker 私有数据导入方法见 [README.md](README.md)。

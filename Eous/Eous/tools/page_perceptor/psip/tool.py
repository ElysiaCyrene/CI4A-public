import base64
import asyncio
from pathlib import Path
from networkx import draw
from playwright.async_api import Page
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import random

js_path = Path(__file__).parent / "set_of_marks.js"
nonvision_js_path = Path(__file__).parent / "set_of_marks_nonvision.js"
with open(js_path, encoding="utf-8") as f:
    mark_page_script = f.read()
with open(nonvision_js_path, encoding="utf-8") as f:
    mark_page_nonvision_script = f.read()
# Mark the page and take a screenshot
async def mark_page(vision_mode, page: Page):
    try:
        await page.wait_for_load_state(state="networkidle", timeout=5000)
    except Exception:
        pass # Ignore timeout, proceed with what we have
        
    for _ in range(10):
        try:
            await page.evaluate(mark_page_script if vision_mode else mark_page_nonvision_script)
            break
        except Exception:
            # May be loading...
            await asyncio.sleep(1)
    for _ in range(10):
        try:
            bboxes = await page.evaluate("markPage()")
            break
        except Exception:
            # May be loading...
            await asyncio.sleep(1)
    return bboxes

async def get_window_size(page: Page):
    size = await page.evaluate("""
        () => {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            }
        }
    """)
    return size

# def draw_bounding_boxes(
#     image,
#     SoM_mapping,
#     box_color=None,
#     line_width=2,
#     font_size=14,
#     idx_pos="lt",
#     show_idx=True,
# ):
#     """
#     在图片上绘制边框标注，每个边框默认使用随机颜色。
    
#     参数:
#         image (np.ndarray | PIL.Image.Image): 输入图像。
#         SoM_mapping (list[dict]): 每个dict包含 {left, right, top, bottom, x, y, type, text, ariaLabel}。
#         box_color (tuple[int] | None): 边框颜色，若为 None，则每个框随机颜色。
#         line_width (int): 边框线条宽度。
#         font_size (int): 字体大小。
#         idx_pos (str): 索引显示位置，可选 ['lt', 'rt', 'lb', 'rb']。
#         show_idx (bool): 是否显示编号。    
#     返回:
#         PIL.Image.Image: 已标注图片。
#     """
#     if isinstance(image, np.ndarray):
#         image = Image.fromarray(image).convert("RGBA")
#     else:
#         image = image.convert("RGBA")

#     try:
#         font = ImageFont.truetype("arial.ttf", font_size)
#     except:
#         font = ImageFont.load_default()

#     draw = ImageDraw.Draw(image)

#     for idx, item in enumerate(SoM_mapping):
#         # --- 随机颜色 ---
#         color = box_color or tuple(random.randint(50, 255) for _ in range(3))
        
#         left, right, top, bottom = item["left"], item["right"], item["top"], item["bottom"]
#         draw.rectangle([(left, top), (right, bottom)], outline=color, width=line_width)

#         # === 绘制索引编号 ===
#         if show_idx:
#             idx_text = str(idx)
#             tw, th = (lambda b: (b[2]-b[0], b[3]-b[1]))(draw.textbbox((0, 0), idx_text, font=font))

#             if idx_pos == "lt":  # 左上角（外侧）
#                 tx, ty = left, top - th
#             elif idx_pos == "rt":  # 右上角（外侧）
#                 tx, ty = right, top - th
#             elif idx_pos == "lb":  # 左下角（外侧）
#                 tx, ty = left, bottom
#             elif idx_pos == "rb":  # 右下角（外侧）
#                 tx, ty = right, bottom
#             else:
#                 raise ValueError("idx_pos must be one of ['lt', 'rt', 'lb', 'rb']")

#             draw.rectangle([(tx, ty), (tx + tw, ty + th)], fill=color)
#             draw.text((tx, ty), idx_text, fill=(255, 255, 255), font=font)

#     return image

def draw_bounding_boxes(
    image,
    SoM_mapping,
    box_color=None,
    line_width=2,
    font_size=12,
    idx_pos="lt",
    show_idx=True,
    alpha=1.0,
    dash_length=5,
    max_width=None,
    max_height=None,
    windowSize=None,
):

    # === 转换为RGBA ===
    if isinstance(image, np.ndarray):
        image = Image.fromarray(image).convert("RGBA")
    else:
        image = image.convert("RGBA")

    # --- 可选压缩: 根据 max_width/max_height 计算缩放因子并调整坐标 ---
    ow, oh = image.size
    sw = (max_width / ow) if (max_width and ow) else 1.0
    sh = (max_height / oh) if (max_height and oh) else 1.0
    scale = min(sw, sh, 1.0)
    if scale <= 1.0:
        new_w = max(1, int(ow * scale))
        new_h = max(1, int(oh * scale))
        image = image.resize((new_w, new_h), resample=Image.LANCZOS)

        scaled_mapping = []
        for item in SoM_mapping:
            scaled_item = dict(item)
            if windowSize:
                # 如果提供了 windowSize，则需要根据实际页面尺寸进行坐标转换
                win_w, win_h = windowSize.get("width"), windowSize.get("height")
                if win_w and win_h:
                    x_scale = new_w / win_w
                    y_scale = new_h / win_h
                    try:
                        scaled_item["left"] = int(float(item["left"]) * x_scale)
                        scaled_item["right"] = int(float(item["right"]) * x_scale)
                        scaled_item["top"] = int(float(item["top"]) * y_scale)
                        scaled_item["bottom"] = int(float(item["bottom"]) * y_scale)
                        scaled_mapping.append(scaled_item)
                        continue
                    except Exception:
                        pass  # Fallback to uniform scale below
            # 如果原始坐标是浮点或字符串，确保转换为数值后缩放再取整
            try:
                scaled_item["left"] = int(float(item["left"]) * scale)
                scaled_item["right"] = int(float(item["right"]) * scale)
                scaled_item["top"] = int(float(item["top"]) * scale)
                scaled_item["bottom"] = int(float(item["bottom"]) * scale)
            except Exception:
                scaled_item["left"] = int(item.get("left", 0) * scale)
                scaled_item["right"] = int(item.get("right", 0) * scale)
                scaled_item["top"] = int(item.get("top", 0) * scale)
                scaled_item["bottom"] = int(item.get("bottom", 0) * scale)

            scaled_mapping.append(scaled_item)

        SoM_mapping = scaled_mapping

    overlay = Image.new("RGBA", (new_w, new_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()

    padding = 1  # 文字背景框内边距（减小以配合更小的字号）

    def draw_dashed_line(p1, p2, color, width):
        x1, y1 = p1
        x2, y2 = p2
        total_len = ((x2-x1)**2 + (y2-y1)**2)**0.5
        dashes = max(int(total_len / dash_length), 1)
        for i in range(dashes):
            start_frac = i / dashes
            end_frac = (i + 0.5) / dashes
            sx = x1 + (x2-x1) * start_frac
            sy = y1 + (y2-y1) * start_frac
            ex = x1 + (x2-x1) * end_frac
            ey = y1 + (y2-y1) * end_frac
            draw.line([(sx, sy), (ex, ey)], fill=color, width=width)

    def draw_dashed_rectangle(left, top, right, bottom, color, width):
        draw_dashed_line((left, top), (right, top), color, width)
        draw_dashed_line((right, top), (right, bottom), color, width)
        draw_dashed_line((right, bottom), (left, bottom), color, width)
        draw_dashed_line((left, bottom), (left, top), color, width)

    for idx, item in enumerate(SoM_mapping):
        # --- 随机颜色（带透明度） ---
        color_rgb = box_color or tuple(random.randint(50, 255) for _ in range(3))
        color_rgba = (*color_rgb, int(255 * alpha))

        left, right, top, bottom = item["left"], item["right"], item["top"], item["bottom"]

        # --- 画边框 ---
        # draw.rectangle([(left, top), (right, bottom)], outline=color_rgba, width=line_width)
        draw_dashed_rectangle(left, top, right, bottom, color_rgba, line_width)

        # === 绘制索引编号 ===
        if show_idx:
            idx_text = str(idx)
            tw, th = (lambda b: (b[2]-b[0], b[3]-b[1]))(
                draw.textbbox((0, 0), idx_text, font=font)
            )

            # --- 计算位置（外部） ---
            if idx_pos == "lt":  # 左上角外
                tx, ty = left, top - th - 2 * padding
            elif idx_pos == "rt":  # 右上角外
                tx, ty = right - tw, top - th - 2 * padding
            else:
                raise ValueError("idx_pos must be one of ['lt', 'rt']")

            # 背景矩形（半透明）
            # bg_color = (*color_rgb, int(200 * alpha))
            draw.rectangle(
                [(tx, ty), (tx + tw + 2 * padding, ty + th + 2 * padding)],
                fill=color_rgba,
            )
            # 文字
            draw.text((tx + padding, ty), idx_text, fill=(255, 255, 255, 255), font=font)

    # === 合成叠加层 ===
    result = Image.alpha_composite(image, overlay)
    return result
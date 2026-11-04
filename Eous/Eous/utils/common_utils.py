import json
import re
from PIL import Image, ImageDraw, ImageFont
from typing import List, Dict


def llm_response_to_dict(response) -> Dict:
    if "json" in response:
        response = re.search(r"```json\s*(.*?)\s*```", response, re.DOTALL).group(1)
    return json.loads(response)

def concat_images_with_index(
        images: List[Image.Image],
        spacing: int = 10,
        font_path: str = None,
        font_size: int = 40,
        index_color: str = "black"
) -> Image.Image:

    # 图像尺寸信息
    img_width, img_height = images[0].size
    num_images = len(images)

    # 加载字体
    try:
        font = ImageFont.truetype(font_path or "arial.ttf", font_size)
    except:
        font = ImageFont.load_default(size=font_size)

    # 计算序号高度预留空间
    sample_text_bbox = font.getbbox("Screen {}")
    text_height = sample_text_bbox[3] - sample_text_bbox[1]

    # 输出图像总尺寸
    total_width = num_images * img_width + (num_images - 1) * spacing
    total_height = int(img_height + text_height + 10)  # 额外加10像素垂直间距

    # 创建输出图像（白底）
    result = Image.new("RGB", (total_width, total_height), color="white")
    draw = ImageDraw.Draw(result)

    # 拼图与标注
    for idx, img in enumerate(images):
        x_offset = idx * (img_width + spacing)
        y_offset = 0
        result.paste(img, (x_offset, y_offset))

        # 在图像下方写序号
        index_text = f"Screen {idx + 1}"
        text_bbox = draw.textbbox((0, 0), index_text, font=font)
        text_w = text_bbox[2] - text_bbox[0]

        text_x = x_offset + (img_width - text_w) // 2
        text_y = img_height + 5  # 图像下方5像素处
        draw.text((text_x, text_y), index_text, fill=index_color, font=font)

    return result
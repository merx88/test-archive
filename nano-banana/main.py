# import os
# from google import genai
# from PIL import Image
# from io import BytesIO
# from dotenv import load_dotenv

# # .env 파일 로드
# load_dotenv()

# # 환경변수에서 GEMINI_API_KEY 읽기
# api_key = os.getenv("GEMINI_API_KEY")
# if not api_key:
#     raise ValueError("GEMINI_API_KEY not found. Check your .env file.")

# # 클라이언트 생성
# client = genai.Client(api_key=api_key)

# prompt = (
#     "사진의 인물이 웃고있고 다른 사진의 배경에 인물을 합성해주세요"
# )

# style_ref = Image.open("image.png")
# object_ref = Image.open("image2.png")

# resp = client.models.generate_content(
#     model="gemini-2.5-flash-image-preview",
#     contents=[prompt, style_ref, object_ref],
# )

# for part in resp.candidates[0].content.parts:
#     if getattr(part, "inline_data", None):
#         Image.open(BytesIO(part.inline_data.data)).save("composed_nano_banana.png")
#         print("Saved to composed_nano_banana.png")


import os
from pathlib import Path
from typing import List, Optional
from io import BytesIO

from PIL import Image
from dotenv import load_dotenv
from google import genai


def edit_images(
    prompt: str,
    image1_paths: str,
    image2_paths: str,
    output_path: str,
) -> Image.Image:

    load_dotenv()

    api_key = os.getenv("GEMINI_API_KEY")

    client = genai.Client(api_key=api_key)

    image1 = Image.open(image1_paths)
    image2 = Image.open(image2_paths)

    resp = client.models.generate_content(
        model="gemini-2.5-flash-image-preview",
        contents=[prompt, image1, image2],
    )

    for part in resp.candidates[0].content.parts:
        if getattr(part, "inline_data", None):
            Image.open(BytesIO(part.inline_data.data)).save(output_path)
            print("Saved to composed_nano_banana.png")


# 예시 실행
if __name__ == "__main__":
    prompt = "사진의 인물이 화내고 있고, 다른 사진의 배경에 자연스럽게 합성해주세요."
    img1 = "image.png"  # 배경 또는 스타일 참조
    img2 = "image2.png"  # 합성할 인물 사진
    output_path = "composed_nano_banana.png"

    edit_images(
        prompt,
        img1,
        img2,
        output_path,
    )
    print("Saved to composed_nano_banana.png")

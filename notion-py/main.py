from notion_py.config import DATABASE_ID, NOTION_TOKEN
from notion_py.database import NotionDatabase


notion = NotionDatabase(NOTION_TOKEN, DATABASE_ID)

# ===새 페이지 생성=== #
page = notion.add_page({
    "이름": {
        "title": [{"text": {"content": "주간 업무 보고"}}]
    }
})

# ===마크다운에서 내용 추가=== #
notion.add_blocks_from_markdown("files/weekly_report.md", page["id"])


# ===전부 쿼리=== #
# response = notion.query_database()

# ===보고서 이름 전부 출력=== #
# for result in response["results"]:
#     try:
#         title_prop = result["properties"]["이름"]["title"]
#         title_text = title_prop[0]["text"]["content"] if title_prop else "(빈 제목)"
#     except (KeyError, IndexError):
#         title_text = "(제목 없음)"

#     print(f"📄 {title_text}")

# ===보고서 내용 전부 출력=== #

# for result in response["results"]:
#     page_id = result["id"]

#     # 제목 출력
#     title_prop = result["properties"]["이름"]["title"]
#     title_text = title_prop[0]["text"]["content"] if title_prop else "(빈 제목)"
#     print(f"\n📄 {title_text}")

#     # 본문 블록 읽기
#     blocks = notion.notion.blocks.children.list(block_id=page_id)

#     for block in blocks["results"]:
#         block_type = block["type"]
#         rich_texts = block.get(block_type, {}).get("rich_text", [])

#         texts = [t["text"]["content"] for t in rich_texts if "text" in t]
#         print(f"- [{block_type}] {' '.join(texts)}")


# ===1개 쿼리=== #
# response = notion.notion.databases.query(
#     database_id=DATABASE_ID,
#     page_size=1  
# )

# if response["results"]:
#     page = response["results"][0]
#     page_id = page["id"]

#     # 제목 추출
#     title_prop = page["properties"]["이름"]["title"]
#     title_text = title_prop[0]["text"]["content"] if title_prop else "(제목 없음)"
#     print(f"📄 제목: {title_text}")

#     # 본문 블록 조회
#     blocks = notion.notion.blocks.children.list(block_id=page_id)
#     print("📝 내용:")
#     for block in blocks["results"]:
#         block_type = block["type"]
#         rich_texts = block.get(block_type, {}).get("rich_text", [])
#         text = ''.join([t["text"]["content"] for t in rich_texts if "text" in t])
#         print(f"- {text}")
# else:
#     print("❌ 페이지가 없습니다.")

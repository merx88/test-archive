# from notion_module import NotionDatabase, NOTION_TOKEN, DATABASE_ID

from config import DATABASE_ID, NOTION_TOKEN
from database import NotionDatabase


notion = NotionDatabase(NOTION_TOKEN, DATABASE_ID)

# 새 페이지 생성
page = notion.add_page({
    "이름": {
        "title": [{"text": {"content": "주간 업무 보고"}}]
    }
})

# 마크다운에서 내용 추가
notion.add_blocks_from_markdown("output/weekly_report.md", page["id"])

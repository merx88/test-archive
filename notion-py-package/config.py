from dotenv import load_dotenv
import os


load_dotenv()

NOTION_TOKEN = os.getenv("NOTION_TOKEN")
DATABASE_ID = os.getenv("DATABASE_ID")

if NOTION_TOKEN is None or DATABASE_ID is None:
    raise ValueError("The environment variables NOTION_TOKEN or DATABASE_ID have not been set.")

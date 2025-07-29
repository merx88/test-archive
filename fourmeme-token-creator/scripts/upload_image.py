from utils import upload_image

access_token = "access_token"

image_url = upload_image("./images/pochita.JPG", access_token)
print("🖼️ 이미지 업로드 완료:", image_url)

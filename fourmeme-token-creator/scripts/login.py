from utils import get_nonce, sign_nonce, login

nonce = get_nonce()
print("🧾 Nonce:", nonce)

signature = sign_nonce(nonce)
print("✍️ 서명 결과:", signature)

access_token = login(signature)
print("🔑 Access Token:", access_token)

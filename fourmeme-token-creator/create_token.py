from utils import get_nonce, sign_nonce, login, upload_image, prepare_token
from config import *
from web3 import Web3
import json

web3 = Web3(Web3.HTTPProvider(RPC_URL))
acct = web3.eth.account.from_key(PRIVATE_KEY)

# 로그인
nonce = get_nonce()
signature = sign_nonce(nonce)
access_token = login(signature)

# 이미지 업로드
image_url = upload_image("./images/pochita.JPG", access_token)

# 토큰 정보 전송 → createArg, sign 할당
create_arg, sign = prepare_token(access_token, image_url)

# 블록체인 트랜잭션 실행
with open("abi/TokenManager2.lite.abi") as f:
    abi = json.load(f)

contract = web3.eth.contract(address=TOKEN_MANAGER_ADDRESS, abi=abi)
nonce = web3.eth.get_transaction_count(WALLET_ADDRESS)

tx = contract.functions.createToken(
    bytes.fromhex(create_arg[2:]),
    bytes.fromhex(sign[2:])
).build_transaction({
    "from": WALLET_ADDRESS,
    "nonce": nonce,
    "gas": 800000,
    "gasPrice": web3.eth.gas_price
})

signed_tx = web3.eth.account.sign_transaction(tx, PRIVATE_KEY)
tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
print("✅ 토큰 생성 트랜잭션:", web3.to_hex(tx_hash))


import requests
import json
from eth_account import Account
from eth_account.messages import encode_defunct
from web3 import Web3
from config import *

web3 = Web3(Web3.HTTPProvider(RPC_URL))
account = Account.from_key(PRIVATE_KEY)

def get_nonce():
    url = f"{FOURMEME_API_BASE}/v1/private/user/nonce/generate"
    res = requests.post(url, json={
        "accountAddress": WALLET_ADDRESS,
        "verifyType": "LOGIN",
        "networkCode": NETWORK_CODE
    })
    return res.json()["data"]

def sign_nonce(nonce):
    message = f"You are sign in Meme {nonce}"
    msg = encode_defunct(text=message)
    signed = Account.sign_message(msg, private_key=PRIVATE_KEY)
    return signed.signature.hex()

def login(signature):
    url = f"{FOURMEME_API_BASE}/v1/private/user/login/dex"
    res = requests.post(url, json={
        "region": "WEB",
        "langType": "EN",
        "loginIp": "",
        "inviteCode": "",
        "verifyInfo": {
            "address": WALLET_ADDRESS,
            "networkCode": NETWORK_CODE,
            "signature": signature,
            "verifyType": "LOGIN"
        },
        "walletName": "MetaMask"
    })
    return res.json()["data"]

def upload_image(image_path, access_token):
    url = f"{FOURMEME_API_BASE}/v1/private/token/upload"
    headers = {"meme-web-access": access_token}
    files = {'file': open(image_path, 'rb')}
    res = requests.post(url, headers=headers, files=files)
    return res.json()["data"]

def prepare_token(access_token, img_url):
    url = f"{FOURMEME_API_BASE}/v1/private/token/create"
    headers = {"meme-web-access": access_token}
    payload = {
        "name": "pochita",
        "shortName": "Pochita",
        "symbol": "BNB",
        "desc": "Generated via API",
        "imgUrl": img_url,
        "launchTime": 1740708849097,
        "label": "Meme",
        "webUrl": "https://example.com",
        "twitterUrl": "https://x.com/example",
        "telegramUrl": "https://t.me/example",
        "lpTradingFee": 0.0025,
        "preSale": "0",
        "raisedAmount": "24"  # ✅ 추가: 필수 고정값
    }

    res = requests.post(url, json=payload, headers=headers)

    try:
        json_data = res.json()
        if json_data["code"] != 0:
            raise Exception(f"❗ 서버 오류: {json_data.get('msg') or json_data}")
        return json_data["data"]["createArg"], json_data["data"]["signature"]

    except Exception as e:
        print("❌ 오류 응답 내용:", res.text)
        raise e


import requests
from requests.auth import HTTPBasicAuth
import base64
from datetime import datetime
from django.conf import settings

CONSUMER_KEY = 'wcwQyAPAltfNGvu5Q3bdczSYhzswAAxAwNGN2G7RVdGhhMJN'
CONSUMER_SECRET = '1wNxspiPGKVvxbeJHGrAyeVdCKG4ZGQAkNqbhC8Y2KmolHhCMfBushGwCqRJjLmZ'
SHORTCODE = '174379'
PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'

def get_mpesa_access_token():
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    r = requests.get(url, auth=HTTPBasicAuth(CONSUMER_KEY, CONSUMER_SECRET))
    return r.json()['access_token']

def generate_password(timestamp):
    data_to_encode = SHORTCODE + PASSKEY + timestamp
    encoded_string = base64.b64encode(data_to_encode.encode())
    return encoded_string.decode('utf-8')

def initiate_stk_push(phone_number, amount, account_reference, transaction_desc, callback_url):
    access_token = get_mpesa_access_token()
    url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = generate_password(timestamp)
    
    payload = {
        "BusinessShortCode": SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": callback_url,
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc
    }
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

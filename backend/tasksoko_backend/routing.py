from django.urls import re_path
from messaging import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<booking_id>\w+)/$', consumers.ChatConsumer.as_asgi()),
]

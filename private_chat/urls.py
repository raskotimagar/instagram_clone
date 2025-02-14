from django.urls import path, re_path
from .consumers.chat_consumers import ChatConsumer
from . import views

app_name = 'private_chat'

# WebSocket URL patterns
websocket_urlpatterns = [
    re_path(r'^ws/chat/$', ChatConsumer.as_asgi()), 
]


urlpatterns = [
    path('messages/', views.MessagesModelList.as_view(), name='all_messages_list'),
    path('messages/<dialog_with>/', views.MessagesModelList.as_view(), name='messages_list'),
    path('dialogs/', views.DialogsModelList.as_view(), name='dialogs_list'),
    path('self/', views.SelfInfoView.as_view(), name='self_info'),
    path('upload/', views.UploadView.as_view(), name='fileupload'),
    path('conversations/', views.SidebarConversationsView.as_view(), name='sidebar_conversations'),
    path('users/', views.user_list, name='user_list'),
    path('users/<int:user_id>/', views.get_user_details, name='user_details'),
    path('messages/<int:user_id>/', views.get_messages, name='messages'),
    path('messages/<int:user_id>/mark-read/', views.mark_messages_as_read, name='mark_messages_as_read'),
    path('message/',views.message, name='message' ),
]

# Optional: Add error handling for invalid URLs
handler404 = 'private_chat.views.handler404'
handler500 = 'private_chat.views.handler500'
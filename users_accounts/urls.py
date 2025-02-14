from django.urls import path
from.views import home, ProfileView, RegisterView,update_profile, follow_user, unfollow_user
urlpatterns= [
    path('', home, name= 'users-home'),
    path('register/', RegisterView.as_view(), name='users-register'),
    path('profile/<str:username>/', ProfileView.as_view(), name='users-profile'),
    path('api/update_profile/<str:username>/', update_profile, name='update_profile'),
    path('api/follow/<str:username>/', follow_user, name='follow-user'),
    path('api/unfollow/<str:username>/', unfollow_user, name='unfollow-user'),
]
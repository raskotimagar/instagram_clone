from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, SaveViewSet, StoryViewSet,UserProfileViewSet,UserPostsViewSet,ReelsViewSet,reels,explore

app_name = 'users_posts'

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='posts')
router.register(r'comments', CommentViewSet, basename='comments')
router.register(r'saves', SaveViewSet, basename='saves')
router.register(r'stories', StoryViewSet, basename='stories')
router.register(r'userprofile', UserProfileViewSet, basename='userprofile')
router.register(r'userposts', UserPostsViewSet, basename='userposts')
router.register(r'reels', ReelsViewSet, basename='reels')

urlpatterns = [ 
    path('userposts/<str:username>/', UserPostsViewSet.as_view({'get': 'list'}), name='userposts'),
    path('', include(router.urls)),
    path('reel/', reels, name='reel' ),
    path('explore/', explore, name='explore'),
    path('userprofiles/<str:username>/follow', UserProfileViewSet.as_view({'post': 'follow_user'}), name='userprofile-follow'),
    path('userprofiles/<str:username>/unfollow', UserProfileViewSet.as_view({'post': 'unfollow_user'}), name='userprofile-unfollow'),
]


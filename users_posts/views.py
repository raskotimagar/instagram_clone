from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, render
from .models import Post, Comment, Save, Story
from users_accounts.models import UserProfile
from .serializers import PostSerializer, CommentSerializer, SaveSerializer, StorySerializer,UserProfileSerializer,FollowerFollowingSerializer,UserPostSerializer,ReelsSerializer,PostExploreSerializer
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from datetime import timedelta
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from django.db.models import F
from django.db.models.functions import Random
from django.contrib.auth.decorators import login_required

# Post ViewSet
class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        user_profile = self.request.user.userprofile
        following_users = user_profile.following.all()
        return Post.objects.filter(user__in=following_users).order_by('-created_at')

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
            try:
                serializer.is_valid(raise_exception=True)
                serializer.save(user=self.request.user.userprofile)
            except Exception as e:
                print(f"Error: {e}")
                raise e 

    @action(detail=True, methods=['post'], url_path='like')
    def like_post(self, request, pk=None):
        post = get_object_or_404(Post, pk=pk)
        if post.likes.filter(id=request.user.id).exists():
            post.likes.remove(request.user)
            liked = False
        else:
            post.likes.add(request.user)
            liked = True
        
        return Response({
            'liked': liked,
            'like_count': post.likes.count(),
            'is_liked': liked  
        })

    @action(detail=True, methods=['post'], url_path='comment')
    def add_comment(self, request, pk=None):
        post = get_object_or_404(Post, pk=pk)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='explore')
    def explore_posts(self, request):
        user_profile = request.user.userprofile
        following_users = user_profile.following.all()
        # Exclude posts from followed users and the current user
        explore_posts = (
            Post.objects
            .exclude(user__in=following_users)
            .exclude(user=user_profile)
            .order_by(Random())  # Order posts randomly
        )

        # Paginate the queryset
        page = self.paginate_queryset(explore_posts)
        if page is not None:
            serializer = PostExploreSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)

        serializer = PostExploreSerializer(explore_posts, many=True, context={'request': request})
        return Response(serializer.data)

# Comment ViewSet
class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], url_path='like')
    def like_comment(self, request, pk=None):
        comment = get_object_or_404(Comment, pk=pk)
        if comment.likes.filter(id=request.user.id).exists():
            comment.likes.remove(request.user)
            liked = False
        else:
            comment.likes.add(request.user)
            liked = True
        return Response({'liked': liked, 'like_count': comment.like_count()})

# Save ViewSet
class SaveViewSet(viewsets.ModelViewSet):
    queryset = Save.objects.all()
    serializer_class = SaveSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        post = get_object_or_404(Post, id=request.data.get('post_id'))
        save, created = Save.objects.get_or_create(user=request.user, post=post)
        if not created:
            save.delete()
            saved = False
        else:
            saved = True
        return Response({'saved': saved})

# Story ViewSet
class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.filter(created_at__gte=timezone.now() - timedelta(hours=24))
    serializer_class = StorySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='active')
    def get_stories(self, request):
        stories = self.get_queryset()
        serializer = self.get_serializer(stories, many=True)
        return Response(serializer.data)



class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['user__username', 'full_name']
    lookup_field = 'username'
    lookup_url_kwarg = 'username'  

    def get_queryset(self):
        username = self.kwargs.get(self.lookup_url_kwarg)
        if username:
            return UserProfile.objects.filter(user__username=username)
        return UserProfile.objects.all()
    
    def get_serializer_context(self):
        """Add request context to serializer"""
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context


    def get_object(self):
        username = self.kwargs.get('username')
        return get_object_or_404(UserProfile, user__username=username)

    def perform_update(self, serializer):
        """Allow profile updates only for the logged-in user."""
        serializer.save(user=self.request.user)

    # Actions to get followers, following, and friends
    @action(detail=True, methods=['get'], url_path='followers')
    def get_followers(self, request, pk=None):
        profile = self.get_object()
        followers = profile.followers.all()
        serializer = FollowerFollowingSerializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='following')
    def get_following(self, request, pk=None):
        profile = self.get_object()
        following = profile.following.all()
        serializer = FollowerFollowingSerializer(following, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='friends')
    def get_friends(self, request, pk=None):
        profile = self.get_object()
        friends = profile.friends.all()
        serializer = FollowerFollowingSerializer(friends, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['post'], url_path='follow', permission_classes=[IsAuthenticated])
    def follow_user(self, request, username=None):
        profile = self.get_object()
        current_profile = request.user.userprofile
        
        if current_profile == profile:
            return Response({'detail': 'You cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        if current_profile.following.filter(id=profile.id).exists():
            return Response({'detail': 'Already following this user'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add to current user's following and target's followers
        current_profile.following.add(profile)
        profile.followers.add(current_profile)
        
        return Response({
            'status': 'following',
            'follower_count': profile.followers.count()
        })

    @action(detail=True, methods=['post'], url_path='unfollow', permission_classes=[IsAuthenticated])
    def unfollow_user(self, request, username=None):
        profile = self.get_object()
        current_profile = request.user.userprofile
        
        if current_profile == profile:
            return Response({'detail': 'You cannot unfollow yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not current_profile.following.filter(id=profile.id).exists():
            return Response({'detail': 'Not following this user'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Remove from current user's following and target's followers
        current_profile.following.remove(profile)
        profile.followers.remove(current_profile)
        
        return Response({
            'status': 'unfollowed',
            'follower_count': profile.followers.count()
        })
    
# UserPostsView
class UserPostsViewSet(viewsets.ModelViewSet):
    serializer_class = UserPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        username = self.kwargs.get('username')
        if username:
            return Post.objects.filter(user__user__username=username)
        return Post.objects.all()


    def create(self, request, *args, **kwargs):
        return Response({"detail": "Not allowed"}, status=405)

    def update(self, request, *args, **kwargs):
        return Response({"detail": "Not allowed"}, status=405)

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Not allowed"}, status=405)
    

# Reels ViewSet
class ReelsViewSet(viewsets.ModelViewSet):
    serializer_class = ReelsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        cached_reels = cache.get('random_reels')
        if not cached_reels:
            # Filter posts with valid videos, ensuring video is neither null nor empty
            fresh_reels = Post.objects.filter(video__isnull=False).exclude(video="").order_by('?')[:50]
            cache.set('random_reels', fresh_reels, timeout=60 * 5)  # Cache for 5 minutes
            return fresh_reels
        return cached_reels

    def get_serializer_context(self):
        return {'request': self.request}

    @action(detail=True, methods=['post'], url_path='like')
    def like_post(self, request, pk=None):
        post = get_object_or_404(Post, pk=pk)
        liked = not post.likes.filter(id=request.user.id).exists()
        if liked:
            post.likes.add(request.user)
        else:
            post.likes.remove(request.user)
        
        return Response({
            'liked': liked,
            'like_count': post.likes.count(),
            'is_liked': liked
        })

    @action(detail=True, methods=['post'], url_path='comment')
    def add_comment(self, request, pk=None):
        post = get_object_or_404(Post, pk=pk)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, post=post)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  
    



@login_required
def reels(request):
    return render(request, 'reels.html')

@login_required
def explore(request):
    return render(request, 'explore.html')
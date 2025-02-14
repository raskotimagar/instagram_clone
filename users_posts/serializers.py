from rest_framework import serializers
from.models import Post, Comment, Story,Save
from.models import UserProfile
from .utils import get_relative_time


class FollowerFollowingSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source ='user.username', read_only =True)
    profile_image = serializers.ImageField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'full_name', 'profile_image']

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    followers = FollowerFollowingSerializer(many=True, read_only=True)
    following = FollowerFollowingSerializer(many=True, read_only=True)
    friends = serializers.SerializerMethodField()
    post_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'full_name', 'profile_image', 'bio', 'followers', 'following', 'friends','post_count', 'is_following']

    def get_friends(self, obj):
        return FollowerFollowingSerializer(obj.friends, many=True).data
    
    def get_post_count(self, obj):
        return obj.posts.count()
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.followers.filter(id=request.user.userprofile.id).exists()
        return False


class UserProfileSerializerForPost(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    profile_image = serializers.ImageField(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'profile_image']


class PostSerializer(serializers.ModelSerializer):
    user = UserProfileSerializerForPost(read_only=True) 
    likes = serializers.StringRelatedField(many=True) 
    created_at = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()  

    class Meta:
        model = Post
        fields = ['id', 'user', 'image', 'video', 'caption', 'location', 'likes', 'is_liked', 'like_count', 'created_at']

    def get_created_at(self, obj):
        return get_relative_time(obj.created_at)

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_like_count(self, obj):
        return obj.likes.count()

        
class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField() # Show username of the commenter
    likes = serializers.StringRelatedField(many=True) #Show username of likers
    class Meta:
        model = Comment
        fields = '__all__'

class SaveSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Show username of the user who saved the post
    post = PostSerializer()  # Nested serializer for post

    class Meta:
        model = Save
        fields = '__all__'

class UserPostSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'image', 'video', 'caption', 'created_at']

    def get_created_at(self, obj):
        return get_relative_time(obj.created_at)


class StorySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()  # Show username of the story owner

    class Meta:
        model = Story
        fields = ['id', 'user', 'media', 'created_at', 'is_expired']


# Reels Serializer
class ReelsSerializer(serializers.ModelSerializer):
    user = UserProfileSerializerForPost(read_only=True) 
    likes = serializers.StringRelatedField(many=True) 
    created_at = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()  

    class Meta:
        model = Post
        fields = ['id', 'user', 'video', 'caption', 'location', 'likes', 'is_liked', 'like_count', 'created_at']

    def get_created_at(self, obj):
        return get_relative_time(obj.created_at)

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_like_count(self, obj):
        return obj.likes.count()
    


# ExploreSerializer
class PostExploreSerializer(serializers.ModelSerializer):
    user = UserProfileSerializerForPost(read_only=True)  # Nested serializer for user profile
    is_liked = serializers.SerializerMethodField()       # Field to check if the post is liked by the user
    like_count = serializers.SerializerMethodField()     # Field to display like count
    comment_count = serializers.SerializerMethodField()  # Field to display comment count

    class Meta:
        model = Post
        fields = ['id', 'user', 'image', 'video', 'caption', 'like_count', 'comment_count', 'is_liked', 'created_at']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_comment_count(self, obj):
        # Use the reverse relation 'comments' from the Post model
        return obj.comments.count()

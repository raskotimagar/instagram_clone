from django.db import models
from django.contrib.auth.models import User
from users_accounts.models import UserProfile
from django.utils import timezone
from datetime import timedelta

# Create your models here.
class Post(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='posts')
    image = models.ImageField(upload_to='posts-images/', blank=True, null=True)
    video = models.FileField(upload_to='posts-videos', blank=True, null=True)
    caption = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    likes = models.ManyToManyField(User, related_name='post_likes', blank=True)
    created_at =models.DateTimeField(auto_now_add=True)

    def like_count(self):
        return self.likes.count()
    
    def post_type(self):
        if self.image:
            return 'image'
        elif self.video:
            return 'video'
        return None
    
    def __str__(self):
        return f"{self.user.user.username}'s post"
    
class Comment(models.Model):
    post = models.ForeignKey(Post, related_name='comments', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_comments', blank=True)

    def  like_count(self):
        return self.likes.count() 

    def __str__(self):
        return f"Comment by {self.user.username}"   
    
class Save(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='saved_posts')
    saved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} saved {self.post.user.username}'s post"


class Story(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    media = models.FileField(upload_to='stories/')  # This will handle both images and videos
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s story"

    @property
    def is_expired(self):
        return (self.created_at + timedelta(hours=24)) < timezone.now()
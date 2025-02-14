from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from datetime import date
from PIL import Image


def validate_birthdate(value):
    if value > date.today():
        raise ValidationError("Birthdate cannot be in the future.")


def profile_image_path(instance, filename):
    return f"profile_pics/user_{instance.user.id}/{filename}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userprofile')
    bio = models.TextField(blank=True)
    profile_image = models.ImageField(default='profile_pics/default.jpg', upload_to=profile_image_path)
    birthdate = models.DateField(validators=[validate_birthdate])
    full_name = models.CharField(max_length=150, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    followers = models.ManyToManyField('self', symmetrical=False, related_name='user_followers', blank=True)
    following = models.ManyToManyField('self', symmetrical=False, related_name='user_following', blank=True)

    def __str__(self):
        return self.user.username

    def save(self, *args, **kwargs):
        if not self.full_name:
            self.full_name = f"{self.user.first_name} {self.user.last_name}".strip()
        super().save(*args, **kwargs)

        img = Image.open(self.profile_image.path)
        if img.height > 300 or img.width > 300:
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.profile_image.path)

    @property
    def friends(self):
        return self.followers.filter(following=self)
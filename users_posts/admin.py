from django.contrib import admin
from.models import Post, Comment,Save,Story

# Register your models here.
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Story)
admin.site.register(Save)
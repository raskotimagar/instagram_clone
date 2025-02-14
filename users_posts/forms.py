from django import forms
from.models import Post, Comment, Story

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['image', 'video', 'caption','location']

    def clean(self):
        cleaned_data = super().clean()
        image = cleaned_data.get('image')
        video = cleaned_data.get('video')

        if not image and  not video:
            raise forms.ValidationError('Please upload either an image or a video.')
        
        if image and video:
            raise forms.ValidationError('You can upload only one file: either an image or a video.')
        
        return cleaned_data

class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['text']

class StoryForm(forms.ModelForm):
    class Meta:
        model = Story
        fields = ['media']
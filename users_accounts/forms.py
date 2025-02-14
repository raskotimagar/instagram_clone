from django import forms
from django.contrib.auth.models import User
from django.contrib.auth .forms import UserCreationForm, AuthenticationForm
from.models import UserProfile
from django.core.exceptions import ValidationError
import re
from django.core.validators import FileExtensionValidator


class UserRegisterForm(UserCreationForm):
    # Fields we want to include and customize in our form
    email = forms.EmailField(required=True,
                             widget = forms.TextInput(attrs={'placeholder': 'Email',
                                                             'class': 'form-control',}))

    username = forms.CharField(max_length=100,
                               required=True,
                               widget=forms.TextInput(attrs={'placeholder': 'Username',
                                                             'class': 'form-control',}))

    full_name = forms.CharField(max_length=150,
                                required= True,
                                widget=forms.TextInput(attrs={'placeholder': 'Full Name',
                                                              'class': 'form-control',}))
    
    birthdate = forms.DateField(required=True,
                                widget=forms.DateInput(attrs={'type': 'date', 
                                                              'class': 'form-control'}))

    password1 = forms.CharField(max_length=50,
                                required=True,
                                widget=forms.PasswordInput(attrs={'placeholder': 'Password',
                                                                  'class': 'form-control',
                                                                  'data-toggle': 'password',
                                                                  'id': 'password',}))

    password2 = forms.CharField(max_length=50,
                                required= True,
                                widget=forms.PasswordInput(attrs={'placeholder': 'Confirm Password',
                                                                  'class': 'form-control',
                                                                  'data-toggle': 'password',
                                                                  'id': 'password',}))

    class Meta:
        model =User
        fields =['email', 'username', 'full_name', 'birthdate', 'password1', 'password2']

    def clean_username(self):
        username = self.cleaned_data.get('username').lower()  
        if not re.match(r'^[a-z0-9._-]+$', username):
            raise ValidationError("Username can only contain lowercase letters, numbers, dots, underscores, and hyphens.")
        return username
    
    def save(self,commit=True):
        user =super().save(commit=False)
        user.email = self.cleaned_data.get('email')
        user.username = self.cleaned_data.get('username') 
        if commit:
            user.save()
            # Save the full_name and birthdate to UserProfile
            UserProfile.objects.create(user =user,
                                       full_name=self.cleaned_data['full_name'],
                                       birthdate=self.cleaned_data['birthdate'])
            return user


class LoginForm(AuthenticationForm):
    username = forms.CharField(max_length=100,
                               required=True,
                               widget=forms.TextInput(attrs={'placeholder': 'Username',
                                                             'class': 'form-control',}))

    password = forms.CharField(max_length=50,
                               required=True,
                               widget=forms.PasswordInput(attrs={'placeholder': 'Password',
                                                                 'class': 'form-control',
                                                                 'data-toggle': 'password',
                                                                 'id': 'password',
                                                                 'name': 'password',}))

    remember_me = forms.BooleanField(required=False,
                                     widget=forms.CheckboxInput())

    class Meta:
        model = User
        fields = ['username', 'password', 'remember_me']


class UpdateUserForm(forms.ModelForm):
    username = forms.CharField(max_length=100,
                                required=True,
                                widget=forms.TextInput(attrs={'class':'form-control'}))
    
    email = forms.EmailField(required=True,
                                widget=forms.TextInput(attrs={'class': 'form-control'}))
    
    class Meta:
        model = User
        fields = ['username', 'email']


class UpdateProfileForm(forms.ModelForm):
    full_name = forms.CharField(
        max_length=150,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Full Name'
        })
    )
    bio = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Bio',
            'rows': 3,
            'style': 'resize: none;'
        })
    )
    profile_image = forms.ImageField(
        required=False,
        widget=forms.FileInput(attrs={
            'class': 'form-control d-none',
            'accept': 'image/*'
        }),
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])]
    )

    class Meta:
        model = UserProfile
        fields = ['full_name', 'bio', 'profile_image']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add username from User model (but not email)
        self.fields['username'] = forms.CharField(
            initial=self.instance.user.username,
            widget=forms.TextInput(attrs={'class': 'form-control'})
        )

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.exclude(pk=self.instance.user.pk).filter(username=username).exists():
            raise ValidationError("This username is already taken.")
        return username

    def save(self, commit=True):
        # Update username in User model
        self.instance.user.username = self.cleaned_data['username']
        self.instance.user.save()
        return super().save(commit) 

        
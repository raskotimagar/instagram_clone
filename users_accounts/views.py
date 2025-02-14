from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from.forms import UserRegisterForm, LoginForm, UpdateUserForm, UpdateProfileForm
from django.contrib import messages
from django.contrib.auth.views import LoginView, PasswordResetView, PasswordChangeView
from django.contrib.messages.views import SuccessMessageMixin
from django.urls import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from.models import User,UserProfile
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import os
from django.http import HttpResponse 


@login_required
def home(request):
    viewed_user = request.user 
    return render(request, 'home.html', {'viewed_user': viewed_user})


class RegisterView(View):
    form_class = UserRegisterForm
    initial = {'key': 'value'}
    template_name = 'register.html'

    def dispatch(self, request, *args, **kwargs):
        # Will redirect to the homepage if a user tries to access the reigister page while logged in
        if request.user.is_authenticated:
            return redirect('/')

        # Else process dispatch as it otherwise normally would
        return super(RegisterView, self).dispatch(request, *args, **kwargs)
    
    def get(self, request, *args, **kwargs):
        form = self.form_class(initial = self.initial)
        return render(request, self.template_name, {'form':form})
    
    def post(self, request, *args, **kwargs):
        form = self.form_class(request.POST)

        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}')

            return redirect(to='login')
        
        return render(request, self.template_name, {'form':form})


# class based view that extends for the built in login view to add a remember me functionality
class CustomLoginView(LoginView):
    form_class = LoginForm

    def form_valid(self, form):
        remember_me = form.cleaned_data.get('remember_me')
         
        if not remember_me:
            # Set session expiry to 0 seconds. So it will automatically close the session after the browser is closed.
            self.request.session.set_expiry(0)

            # Set session as modified to force data updates/cookie to be saved.
            self.request.session.modified = True

        # else browser session will be as long as the session cookie time "SESSION_COOKIE_AGE" defied in settings.py
        return super(CustomLoginView, self).form_valid(form)
    

class ResetPasswordView(SuccessMessageMixin, PasswordResetView):
    template_name = 'users_accounts/password_reset.html'
    email_template_name = 'users_accounts/password_reset_email.html'
    subject_template_name = 'users_accounts/password_reset_subject'
    success_message =   "We've emailed you instructions for setting your password, "\
                        "if an account exits with this email you entered. You should receive them shortly. "\
                        "If you don't receive an email, "\
                        "please make sure you've entered the address you registered with, and check you spam folder."
    success_url = reverse_lazy('users-home')
                        

class ChangePasswordView(SuccessMessageMixin, PasswordChangeView):
    template_name = 'users_accounts/change_password.html'
    success_message = 'Succesfully Changed Your Password'
    success_url = reverse_lazy('users-home')


# Profile View
class ProfileView(LoginRequiredMixin, View):
    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        
        # Use 'user.userprofile' to access the UserProfile
        user_profile = get_object_or_404(UserProfile, user=user)
        
        user_form = UpdateUserForm(instance=user)
        profile_form = UpdateProfileForm(instance=user_profile)
        return render(request, 'profile.html', {
            'user_form': user_form,
            'profile_form': profile_form,
            'viewed_user': user,
            'is_own_profile': request.user == user,
            'follower_count': user_profile.followers.count(),
            'following_count': user_profile.following.count()
        })

    def post(self, request, username):
        user = get_object_or_404(User, username=username)
        user_profile = get_object_or_404(UserProfile, user=user)

        user_form = UpdateUserForm(request.POST, instance=user)
        profile_form = UpdateProfileForm(request.POST, request.FILES, instance=user_profile)

        if user_form.is_valid() and profile_form.is_valid():
            user_form.save()
            profile_form.save()
            messages.success(request, 'Your profile is updated successfully')
            return redirect('users-profile', username=user.username)

        messages.error(request, 'Please correct the errors below.')
        return render(request, 'profile.html', {
            'user_form': user_form,
            'profile_form': profile_form,
            'viewed_user': user,
            'is_own_profile': request.user == user 
        })



@login_required
def update_profile(request, username):
    if request.user.username != username:
        return JsonResponse({'success': False, 'error': 'Unauthorized'}, status=403)

    try:
        profile = request.user.userprofile
    except UserProfile.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Profile not found'}, status=404)

    if request.method == 'POST':
        form = UpdateProfileForm(
            request.POST, 
            request.FILES, 
            instance=profile
        )
        
        if form.is_valid():
            updated_profile = form.save()
            return JsonResponse({
                'success': True,
                'username': updated_profile.user.username,
                'profile_image': updated_profile.profile_image.url,
                'bio': updated_profile.bio,
                'full_name': updated_profile.full_name
            })
            
        return JsonResponse({
            'success': False,
            'errors': form.errors.as_json()
        }, status=400)
    
    return JsonResponse({'success': False}, status=405)


@login_required
def follow_user(request, username):
    try:
        target_user = User.objects.get(username=username)
        current_profile = request.user.userprofile
        target_profile = target_user.userprofile

        if current_profile == target_profile:
            return JsonResponse({'success': False, 'error': 'You cannot follow yourself'}, status=400)

        if current_profile.following.filter(id=target_profile.id).exists():
            return JsonResponse({'success': False, 'error': 'Already following'}, status=400)

        current_profile.following.add(target_profile)
        target_profile.followers.add(current_profile)
        
        return JsonResponse({
            'success': True,
            'action': 'follow',
            'follower_count': target_profile.followers.count()
        })

    except User.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)


@login_required
def unfollow_user(request, username):
    try:
        target_user = User.objects.get(username=username)
        current_profile = request.user.userprofile
        target_profile = target_user.userprofile

        if current_profile == target_profile:
            return JsonResponse({'success': False, 'error': 'You cannot unfollow yourself'}, status=400)

        if not current_profile.following.filter(id=target_profile.id).exists():
            return JsonResponse({'success': False, 'error': 'Not following'}, status=400)

        current_profile.following.remove(target_profile)
        target_profile.followers.remove(current_profile)
        
        return JsonResponse({
            'success': True,
            'action': 'unfollow',
            'follower_count': target_profile.followers.count()
        })

    except User.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'User not found'}, status=404)




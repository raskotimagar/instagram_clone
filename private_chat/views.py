from django.views.generic import (
    CreateView,
    DeleteView,
    DetailView,
    UpdateView,
    ListView,
)
from .models import (
    MessageModel,
    DialogsModel,
    UploadedFile
)
from .serializers import serialize_message_model, serialize_dialog_model, serialize_file_model, serialize_user_model
from django.db.models import Q

from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse, HttpResponseBadRequest
from django.core.paginator import Page, Paginator
from django.conf import settings
from django.forms import ModelForm, ValidationError
from django.utils.translation import gettext_lazy as _
from django.template.defaultfilters import filesizeformat
import json
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from users_accounts.models import UserProfile
from django.shortcuts import get_object_or_404, render
import logging






# Pagination defaults
MESSAGES_PAGINATION = getattr(settings, 'MESSAGES_PAGINATION', 50)
DIALOGS_PAGINATION = getattr(settings, 'DIALOGS_PAGINATION', 20)
MAX_UPLOAD_SIZE = getattr(settings, 'MAX_FILE_UPLOAD_SIZE', 5242880)  # Default 5MB


class MessagesModelList(LoginRequiredMixin, ListView):
    http_method_names = ['get']
    paginate_by = MESSAGES_PAGINATION

    def get_queryset(self):
        user_profile = self.request.user.userprofile
        dialog_with = self.kwargs.get('dialog_with')

        if dialog_with:
            qs = MessageModel.objects.filter(
                Q(recipient=user_profile, sender_id=dialog_with) |
                Q(sender=user_profile, recipient_id=dialog_with)
            ).select_related('sender', 'recipient')
        else:
            qs = MessageModel.objects.filter(
                Q(recipient=user_profile) | Q(sender=user_profile)
            ).select_related('sender', 'recipient', 'file')

        return qs.order_by('-created')

    def render_to_response(self, context, **response_kwargs):
        if not self.request.user.is_authenticated:
            return JsonResponse({"error": "User not authenticated"}, status=401)

        user_pk = self.request.user.pk
        print(f"Logged-in User ID: {user_pk}, Username: {self.request.user.username}")  # Debugging
        data = [serialize_message_model(i, user_pk) for i in context['object_list']]
        page = context['page_obj']
        paginator = context['paginator']
        return JsonResponse({
            'page': page.number,
            'pages': paginator.num_pages,
            'data': data
        })


class DialogsModelList(LoginRequiredMixin, ListView):
    http_method_names = ['get']
    paginate_by = DIALOGS_PAGINATION

    def get_queryset(self):
        user_profile = self.request.user.userprofile
        qs = DialogsModel.objects.filter(
            Q(user1=user_profile) | Q(user2=user_profile)
        ).select_related('user1', 'user2')
        return qs.order_by('-created')

    def render_to_response(self, context, **response_kwargs):
        user_pk = self.request.user.pk
        data = [serialize_dialog_model(i, user_pk) for i in context['object_list']]
        page: Page = context.pop('page_obj')
        paginator: Paginator = context.pop('paginator')
        return_data = {
            'page': page.number,
            'pages': paginator.num_pages,
            'data': data
        }
        return JsonResponse(return_data, **response_kwargs)


class SelfInfoView(LoginRequiredMixin, DetailView):
    def get_object(self, queryset=None):
        return self.request.user.userprofile

    def render_to_response(self, context, **response_kwargs):
        user_profile = context['object']
        data = {
            "username": user_profile.user.get_username(),
            "pk": str(user_profile.pk),
            "bio": user_profile.bio,
            "full_name": user_profile.full_name,
            "profile_image": user_profile.profile_image.url if user_profile.profile_image else None,
            "followers_count": user_profile.followers.count(),
            "following_count": user_profile.following.count(),
        }
        return JsonResponse(data, **response_kwargs)


class UploadForm(ModelForm):
    def clean_file(self):
        file = self.cleaned_data['file']
        if file.size > MAX_UPLOAD_SIZE:
            raise ValidationError(
                _("File size exceeds the limit of %(limit)s. Current size: %(size)s.") % {
                    "limit": filesizeformat(MAX_UPLOAD_SIZE),
                    "size": filesizeformat(file.size),
                }
            )
        return file

    class Meta:
        model = UploadedFile
        fields = ['file']


class UploadView(LoginRequiredMixin, CreateView):
    http_method_names = ['post']
    model = UploadedFile
    form_class = UploadForm

    def form_valid(self, form):
        self.object = UploadedFile.objects.create(
            uploaded_by=self.request.user.userprofile,
            file=form.cleaned_data['file']
        )
        return JsonResponse(serialize_file_model(self.object))

    def form_invalid(self, form):
        context = self.get_context_data(form=form)
        errors_json = context['form'].errors.get_json_data()
        return HttpResponseBadRequest(content=json.dumps({'errors': errors_json}))


class SidebarConversations:
    def __init__(self, user_profile):
        self.user_profile = user_profile

    def get_dialogs(self):
        return DialogsModel.objects.filter(
            Q(user1=self.user_profile) | Q(user2=self.user_profile)
        ).select_related('user1', 'user2').order_by('-modified')

    def get_other_user(self, dialog):
        return dialog.user1 if dialog.user2 == self.user_profile else dialog.user2

    def get_last_message(self, dialog):
        return MessageModel.get_last_message_for_dialog(dialog.user1, dialog.user2)

    def get_unread_count(self, other_user):
        return MessageModel.get_unread_count_for_dialog_with_user(
            sender=other_user.pk, recipient=self.user_profile.pk
        )

    def serialize_dialog(self, dialog):
        other_user = self.get_other_user(dialog)
        last_message = self.get_last_message(dialog)
        unread_count = self.get_unread_count(other_user)

        return {
            "other_user_id": str(other_user.pk),
            "username": other_user.user.username,
            "profile_image": other_user.profile_image.url if other_user.profile_image else None,
            "last_message": last_message.text if last_message else None,
            "last_message_time": last_message.created.timestamp() if last_message else None,
            "unread_count": unread_count,
        }

    def get_sidebar_data(self):
        dialogs = self.get_dialogs()
        return [self.serialize_dialog(dialog) for dialog in dialogs]


class SidebarConversationsView(LoginRequiredMixin, ListView):
    def get(self, request, *args, **kwargs):
        user_profile = request.user.userprofile
        sidebar = SidebarConversations(user_profile)
        sidebar_data = sidebar.get_sidebar_data()
        return JsonResponse(sidebar_data, safe=False)


@login_required
def user_list(request):
    page = request.GET.get('page', 1)
    per_page = request.GET.get('per_page', 10)

    users = UserProfile.objects.all()
    paginator = Paginator(users, per_page)

    try:
        users_page = paginator.page(page)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    data = [serialize_user_model(user) for user in users_page.object_list]
    return JsonResponse({
        "total_pages": paginator.num_pages,
        "total_users": paginator.count,
        "page": page,
        "users": data,
    })


@login_required
def get_user_details(request, user_id):
    """
    Fetch details for a specific user.
    """
    try:
        user = get_object_or_404(UserProfile, pk=user_id)
        data = {
            "full_name": user.full_name,
            "username": user.user.username,
            "profile_image": user.profile_image.url if user.profile_image else None,
            "bio": user.bio,
            "followers_count": user.followers.count(),
            "following_count": user.following.count(),
        }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    


@login_required
def get_messages(request, user_id):
    """
    Fetch messages between the logged-in user and the specified user.
    """
    try:
        user_profile = request.user.userprofile
        other_user = get_object_or_404(UserProfile, pk=user_id)

        messages = MessageModel.objects.filter(
            Q(sender=user_profile, recipient=other_user) |
            Q(sender=other_user, recipient=user_profile)
        ).order_by('created')

        data = [{
            "text": message.text,
            "sender_id": message.sender.pk,
            "timestamp": message.created.isoformat(),
        } for message in messages]

        return JsonResponse({"data": data})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)



logger = logging.getLogger(__name__)

@require_POST
@login_required
def mark_messages_as_read(request, user_id):
    try:
        user_profile = request.user.userprofile
        other_user = get_object_or_404(UserProfile, pk=user_id)

        # Mark messages as read
        MessageModel.objects.filter(
            sender=other_user, recipient=user_profile, read=False
        ).update(read=True)

        return JsonResponse({"success": True})
    except Exception as e:
        logger.error(f"Error marking messages as read: {e}", exc_info=True)
        return JsonResponse({"error": str(e)}, status=500)
    
@login_required
def message(request):
    return render(request, 'private_chat/private_chat.html')
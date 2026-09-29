from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UserModel, LoanRequest  # Import LoanRequest model

class CustomUserAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password', 'email', 'phone_no', 'photo', 'face_id')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'email', 'phone_no', 'photo', 'face_id'),
        }),
    )
    list_display = ('username', 'email', 'phone_no', 'is_staff')
    search_fields = ('username', 'email', 'phone_no')
    ordering = ('username',)

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if not obj:
            form.base_fields['password1'].required = False
            form.base_fields['password2'].required = False
        return form

admin.site.register(UserModel, CustomUserAdmin)
admin.site.register(LoanRequest)  # Register LoanRequest model
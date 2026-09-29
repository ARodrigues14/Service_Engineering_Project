from django.urls import include, path
from rest_framework.routers import DefaultRouter
from Projeto.quickstart import views
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin  # Import Django admin

urlpatterns = [
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('current-datetime/', views.current_datetime, name='current-datetime'), 
    path('photo-count/', views.photo_count, name='photo-count'), 
    path('search-faces/', views.search_faces_view, name='search-faces'),
    path('index-faces/', views.index_faces_view, name='index-faces'),
    path('login/', views.login_view_user, name='login_view_user'),
    path('login-agent/', views.login_view_agent, name='login_view_agent'),
    path('admin/', admin.site.urls),  # Add path for admin interface
    path('process-loan-result/', views.process_loan_result, name='process_loan_result'),
    
]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
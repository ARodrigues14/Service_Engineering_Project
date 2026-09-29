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
    path('login/', views.login_view_user, name='login_view_user'), # TEM Q SE ALTERAR ISTO NOS JS 
    path('login-cliente1.html', views.login_view_user, name='login_view_user'),
    path('login-agent/', views.login_view_agent, name='login_view_agent'),
    #path('login-cliente.html', views.login_view_user, name='login_view_user'),
    path('documentos.html', views.doc_cliente, name='doc_cliente'),
    path('login-agente.html', views.login_view_agent, name='login_view_agent'),
    path('dashboard-agent.html', views.dashboard_agent, name='dashboard_agent'),
    path('dashboard-cliente.html', views.dashboard_client, name='dashboard_client'),
    path('login-cliente.html', views.login2, name='login2'),
    #path('dashboardC/<str:face_id>/', views.EmprestimoByFaceIDView, name='user-by-face-id'),     
    path('update-interview/<str:face_id>/', views.update_interview_date, name='update-interview'),
    path('api/emprestimos/<str:agent_id>/', views.get_emprestimos_by_agent, name='emprestimos-by-agent'),
    #path('api/emprestimos/<str:face_id>/', views.get_emprestimos_by_client, name='get_emprestimos_by_client'),
    path('api/emprestimos/', views.get_emprestimos_by_client, name='get_emprestimos_by_client'),

    path('', views.index_view, name='index'),  # Esta URL irá servir o arquivo index.html do React
    path('admin/', admin.site.urls),  # Add path for admin interface
    path('cookie-data/', views.cookie_data, name='cookie_data'),
    path('loan-requests/', views.get_all_loan_requests, name='loan_requests'),
    path('view-users/', views.view_users, name='view_users'),


]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
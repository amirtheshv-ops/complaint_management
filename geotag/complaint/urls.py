from django.urls import path
from . import views
from . import api_views

urlpatterns = [
    # Django template views
    path('', views.login_page, name='login'),
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='user_login'),
    path('logout/', views.user_logout, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('add-complaint/', views.add_complaint, name='add_complaint'),
    path('my-complaints/', views.my_complaints, name='my_complaints'),
    path('map/', views.complaint_map, name='complaint_map'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('update-status/<int:id>/', views.update_status, name='update_status'),

    # React API endpoints
    path('api/login/', api_views.api_login, name='api_login'),
    path('api/register/', api_views.api_register, name='api_register'),
    path('api/logout/', api_views.api_logout, name='api_logout'),
    path('api/user/', api_views.api_user_status, name='api_user_status'),
    path('api/complaints/', api_views.api_complaints, name='api_complaints'),
    path('api/complaints/map/', api_views.api_map_complaints, name='api_map_complaints'),
    path('api/complaints/<int:id>/status/', api_views.api_update_status, name='api_update_status'),
]
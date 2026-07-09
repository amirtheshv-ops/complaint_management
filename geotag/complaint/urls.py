from django.urls import path

from . import views



urlpatterns = [

    path('',views.login_page,name='login'),


    path('register/',views.register,name='register'),


    path('login/',views.user_login,name='user_login'),


    path('logout/',views.user_logout,name='logout'),


    path('dashboard/',views.dashboard,name='dashboard'),


    path('add-complaint/',views.add_complaint,name='add_complaint'),


    path('my-complaints/',views.my_complaints,name='my_complaints'),


    path('map/',views.complaint_map,name='complaint_map'),


    path('admin-dashboard/',views.admin_dashboard,name='admin_dashboard'),


    path('update-status/<int:id>/',views.update_status,name='update_status'),

]
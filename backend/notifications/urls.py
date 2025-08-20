from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/read/', views.mark_read, name='notification-mark-read'),
    path('mark-all-read/', views.mark_all_read, name='notification-mark-all-read'),
    path('<int:pk>/', views.delete_notification, name='notification-delete'),
]

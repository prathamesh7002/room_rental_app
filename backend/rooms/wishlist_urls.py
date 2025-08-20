from django.urls import path
from . import views

urlpatterns = [
    path('', views.wishlist_list, name='wishlist-list'),
    path('check/<int:room_id>/', views.wishlist_check, name='wishlist-check'),
    path('add/', views.wishlist_add, name='wishlist-add'),
    path('remove/<int:room_id>/', views.wishlist_remove, name='wishlist-remove'),
    path('clear/', views.wishlist_clear, name='wishlist-clear'),
]

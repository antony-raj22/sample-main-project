from django.urls import path
from .views import PersonListCreate, TaskListCreate, PersonRetrieveUpdateDestroy, TaskRetrieveUpdateDestroy, UserListCreate
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', UserListCreate.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('personlist/', PersonListCreate.as_view(), name='person-list'),
    path('tasklist/', TaskListCreate.as_view(), name='task-list'),
    path('personlist/<int:pk>', PersonRetrieveUpdateDestroy.as_view(), name='single-person'),
    path('tasklist/<int:pk>', TaskRetrieveUpdateDestroy.as_view(), name='single-task'),
]
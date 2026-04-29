from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'todos', views.TodoViewSet)   # or 'app1' if you prefer
# If you still need the old 'app1' route, add: router.register(r'app1', views.TodoViewSet)

urlpatterns = [
    # JWT authentication
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Todo API
    path('', include(router.urls)),
]
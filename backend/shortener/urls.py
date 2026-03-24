from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', views.MeView.as_view(), name='me'),
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('links/', views.ShortLinkListCreateView.as_view(), name='links'),
    path('links/<int:pk>/', views.ShortLinkDetailView.as_view(), name='link-detail'),
    path('r/<str:short_code>/', views.redirect_view, name='redirect'),
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
]

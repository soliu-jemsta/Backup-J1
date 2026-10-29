"""
URL configuration for jemsta_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def home(request):
    return HttpResponse("Jemsta API is running 🚀")

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/landlords/', include('landlords.urls')),
    path('api/properties/', include('properties.urls')),
    path('api/tenants/', include('tenants.urls')),
    path('api/users/', include('Users.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/invoices/', include('invoices.urls')),
    path('api/comments/', include('comments.urls')),
    path('api/public/', include('public_api.urls')),
    path('api/authentication/', include('authentication.urls')),
    path('api/audit/', include('audit.urls')),
    path("api/reports/", include("reports.urls")),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )

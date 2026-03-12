"""
Django URL Configuration — Qaydnoma Blog
=========================================
Bu faylni Django loyihangizning asosiy urls.py ga qo'shing.
Masalan: config/urls.py yoki myproject/urls.py
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# 404 handler
handler404 = "blog.views.custom_404"

urlpatterns = [
    path("admin/", admin.site.urls),

    # API endpoints (sizning Django REST API)
    # path("api/", include("api.urls")),

    # Frontend sahifalar
    path("", include("blog.urls")),
]

# Development: static va media fayllarni serve qilish
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("post/", views.post_page, name="post"),
    path("login/", views.login_page, name="login"),
    path("register/", views.register_page, name="register"),
    path("profile/", views.profile_page, name="profile"),
    path("forgot-password/", views.forgot_password_page, name="forgot_password"),
    path("reset-password/", views.reset_password_page, name="reset_password"),
    path("privacy/", views.privacy_page, name="privacy"),
]

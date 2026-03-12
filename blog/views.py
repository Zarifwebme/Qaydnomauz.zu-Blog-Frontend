from django.shortcuts import render


def home(request):
    return render(request, "index.html")


def post_page(request):
    return render(request, "post.html")


def login_page(request):
    return render(request, "login.html")


def register_page(request):
    return render(request, "register.html")


def profile_page(request):
    return render(request, "profile.html")


def forgot_password_page(request):
    return render(request, "forgot-password.html")


def reset_password_page(request):
    return render(request, "reset-password.html")


def privacy_page(request):
    return render(request, "privacy.html")


def custom_404(request, exception):
    return render(request, "404.html", status=404)

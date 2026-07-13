from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.decorators.http import require_http_methods
from .models import Complaint, Citizen
import json
from django.http import JsonResponse


def register(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        address = request.POST.get('address')
        
        if User.objects.filter(username=username).exists():
            return render(request, 'register.html', {
                'error': 'Username already exists'
            })
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        Citizen.objects.create(
            user=user,
            phone=phone,
            address=address
        )
        
        return redirect('login')
    
    return render(request, 'register.html')


def login_page(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        portal = request.POST.get('portal', 'citizen')

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:
            if portal == 'admin' and not (user.is_staff or user.is_superuser):
                return render(request, 'login.html', {
                    'error': 'This account does not have administrator privileges.',
                    'portal': 'admin'
                })
            login(request, user)
            if user.is_staff or user.is_superuser:
                return redirect('admin_dashboard')
            return redirect('dashboard')
        else:
            return render(request, 'login.html', {
                'error': 'Invalid username or password',
                'portal': portal
            })

    return render(request, 'login.html')


def user_login(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        portal = request.POST.get('portal', 'citizen')

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:
            if portal == 'admin' and not (user.is_staff or user.is_superuser):
                return render(request, 'login.html', {
                    'error': 'This account does not have administrator privileges.',
                    'portal': 'admin'
                })
            login(request, user)
            if user.is_staff or user.is_superuser:
                return redirect('admin_dashboard')
            return redirect('dashboard')
        else:
            return render(request, 'login.html', {
                'error': 'Invalid username or password',
                'portal': portal
            })

    return render(request, 'login.html')


def user_logout(request):
    logout(request)
    return redirect('login')


@login_required
def dashboard(request):
    if request.user.is_staff or request.user.is_superuser:
        return redirect('admin_dashboard')
    complaints = Complaint.objects.filter(user=request.user)
    return render(request, 'dashboard.html', {
        'complaints': complaints
    })


def logout_page(request):
    logout(request)
    return redirect('login')



@login_required
def add_complaint(request):
    if request.method == "POST":
        category = request.POST.get('category')
        title = request.POST.get('title')
        description = request.POST.get('description')
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')
        image = request.FILES.get('image')
        
        Complaint.objects.create(
            user=request.user,
            category=category,
            title=title,
            description=description,
            latitude=latitude,
            longitude=longitude,
            image=image
        )
        
        return redirect('my_complaints')
    
    return render(request, 'add_complaint.html')


@login_required
def my_complaints(request):
    complaints = Complaint.objects.filter(user=request.user)
    return render(request, 'my_complaints.html', {
        'complaints': complaints
    })


@login_required
def complaint_map(request):
    complaints = Complaint.objects.all()
    complaints_data = []
    
    for complaint in complaints:
        complaints_data.append({
            'id': complaint.id,
            'title': complaint.title,
            'latitude': complaint.latitude,
            'longitude': complaint.longitude,
            'status': complaint.status,
            'category': complaint.category
        })
    
    return render(request, 'complaint_map.html', {
        'complaints': json.dumps(complaints_data)
    })


@login_required
def admin_dashboard(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return redirect('dashboard')
    complaints = Complaint.objects.all()
    return render(request, 'admin_dashboard.html', {
        'complaints': complaints
    })


@login_required
def update_status(request, id):
    if not (request.user.is_staff or request.user.is_superuser):
        return redirect('dashboard')
    if request.method == "POST":
        status = request.POST.get('status')
        complaint = Complaint.objects.get(id=id)
        complaint.status = status
        complaint.save()
        return redirect('admin_dashboard')
    
    complaint = Complaint.objects.get(id=id)
    return render(request, 'update_status.html', {
        'complaint': complaint
    })
import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from .models import Complaint, Citizen

def parse_json_or_post(request):
    if request.content_type == 'application/json':
        try:
            return json.loads(request.body)
        except json.JSONDecodeError:
            return {}
    # Combine POST and FILES to handle multipart/form-data with text fields
    data = request.POST.copy()
    return data

def serialize_complaint(request, complaint):
    image_url = ""
    if complaint.image:
        image_url = request.build_absolute_uri(complaint.image.url)
    return {
        'id': complaint.id,
        'category': complaint.category,
        'title': complaint.title,
        'description': complaint.description,
        'image': image_url,
        'latitude': complaint.latitude,
        'longitude': complaint.longitude,
        'status': complaint.status,
        'created_at': complaint.created_at.isoformat(),
        'citizen_username': complaint.user.username
    }

@csrf_exempt
@require_http_methods(["POST"])
def api_register(request):
    data = parse_json_or_post(request)
    username = data.get('username')
    password = data.get('password')
    email = data.get('email', '')
    phone = data.get('phone', '')
    address = data.get('address', '')

    if not username or not password:
        return JsonResponse({'error': 'Username and password are required'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'error': 'Username already exists'}, status=400)

    try:
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
        return JsonResponse({'status': 'success', 'message': 'Citizen registered successfully'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    data = parse_json_or_post(request)
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return JsonResponse({'error': 'Username and password are required'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        # Check if citizen profile exists
        phone = ""
        address = ""
        try:
            citizen = getattr(user, 'citizen', None)
            if citizen:
                phone = citizen.phone
                address = citizen.address
        except Exception:
            pass

        return JsonResponse({
            'status': 'success',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff or user.is_superuser,
                'phone': phone,
                'address': address
            }
        })
    else:
        return JsonResponse({'error': 'Invalid username or password'}, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def api_logout(request):
    logout(request)
    return JsonResponse({'status': 'success', 'message': 'Logged out successfully'})

@require_http_methods(["GET"])
def api_user_status(request):
    if request.user.is_authenticated:
        phone = ""
        address = ""
        try:
            citizen = getattr(request.user, 'citizen', None)
            if citizen:
                phone = citizen.phone
                address = citizen.address
        except Exception:
            pass
            
        return JsonResponse({
            'authenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'is_staff': request.user.is_staff or request.user.is_superuser,
                'phone': phone,
                'address': address
            }
        })
    else:
        return JsonResponse({'authenticated': False})

@require_http_methods(["GET"])
def api_complaints(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    if request.user.is_staff or request.user.is_superuser:
        complaints = Complaint.objects.all().order_by('-created_at')
    else:
        complaints = Complaint.objects.filter(user=request.user).order_by('-created_at')

    data = [serialize_complaint(request, c) for c in complaints]
    return JsonResponse({'status': 'success', 'complaints': data})

@csrf_exempt
@require_http_methods(["POST"])
def api_add_complaint(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    # Note: parsing files and multipart post parameters
    category = request.POST.get('category')
    title = request.POST.get('title')
    description = request.POST.get('description')
    latitude = request.POST.get('latitude')
    longitude = request.POST.get('longitude')
    image = request.FILES.get('image')

    if not all([category, title, description, latitude, longitude]):
        return JsonResponse({'error': 'All fields (category, title, description, latitude, longitude) are required'}, status=400)

    try:
        complaint = Complaint.objects.create(
            user=request.user,
            category=category,
            title=title,
            description=description,
            latitude=float(latitude),
            longitude=float(longitude),
            image=image
        )
        return JsonResponse({
            'status': 'success',
            'complaint': serialize_complaint(request, complaint)
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def api_update_status(request, id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    if not (request.user.is_staff or request.user.is_superuser):
        return JsonResponse({'error': 'Administrator privileges required'}, status=403)

    try:
        complaint = Complaint.objects.get(id=id)
        data = parse_json_or_post(request)
        new_status = data.get('status')
        if not new_status:
            return JsonResponse({'error': 'Status field is required'}, status=400)
            
        valid_statuses = [choice[0] for choice in Complaint.STATUS]
        if new_status not in valid_statuses:
            return JsonResponse({'error': f'Invalid status. Choose from: {valid_statuses}'}, status=400)

        complaint.status = new_status
        complaint.save()
        return JsonResponse({
            'status': 'success',
            'complaint': serialize_complaint(request, complaint)
        })
    except Complaint.DoesNotExist:
        return JsonResponse({'error': 'Complaint not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import Complaint, Citizen

def serialize_complaint(complaint, request=None):
    image_url = ""
    if complaint.image:
        if request:
            image_url = request.build_absolute_uri(complaint.image.url)
        else:
            image_url = complaint.image.url
    
    return {
        'id': complaint.id,
        'title': complaint.title,
        'description': complaint.description,
        'category': complaint.category,
        'status': complaint.status,
        'latitude': complaint.latitude,
        'longitude': complaint.longitude,
        'created_at': complaint.created_at.isoformat(),
        'image': image_url,
        'user': complaint.user.username
    }

@csrf_exempt
def api_login(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
    except Exception:
        # Fallback to POST parameters if JSON parsing fails (e.g. multipart/form-data)
        username = request.POST.get('username')
        password = request.POST.get('password')

    if not username or not password:
        return JsonResponse({'error': 'Username and password are required'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        # Check if Citizen profile exists
        phone = ""
        address = ""
        try:
            citizen = user.citizen
            phone = citizen.phone
            address = citizen.address
        except Exception:
            pass

        return JsonResponse({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'phone': phone,
                'address': address
            }
        })
    else:
        return JsonResponse({'error': 'Invalid username or password'}, status=400)

@csrf_exempt
def api_register(request):
    if request.method != "POST":
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email', '')
        phone = data.get('phone', '')
        address = data.get('address', '')
    except Exception:
        # Fallback to POST parameters
        username = request.POST.get('username')
        password = request.POST.get('password')
        email = request.POST.get('email', '')
        phone = request.POST.get('phone', '')
        address = request.POST.get('address', '')

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
        return JsonResponse({'success': True, 'message': 'Registration successful'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def api_logout(request):
    logout(request)
    return JsonResponse({'success': True, 'message': 'Logged out successfully'})

def api_user_status(request):
    if request.user.is_authenticated:
        user = request.user
        phone = ""
        address = ""
        try:
            citizen = user.citizen
            phone = citizen.phone
            address = citizen.address
        except Exception:
            pass

        return JsonResponse({
            'authenticated': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'phone': phone,
                'address': address
            }
        })
    else:
        return JsonResponse({'authenticated': False})

@csrf_exempt
def api_complaints(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    if request.method == "GET":
        if request.user.is_staff:
            complaints = Complaint.objects.all().order_by('-created_at')
        else:
            complaints = Complaint.objects.filter(user=request.user).order_by('-created_at')
        
        data = [serialize_complaint(c, request) for c in complaints]
        return JsonResponse({'complaints': data})

    elif request.method == "POST":
        # Usually file uploads are sent via FormData, so we fetch from request.POST
        category = request.POST.get('category')
        title = request.POST.get('title')
        description = request.POST.get('description', '')
        latitude_str = request.POST.get('latitude')
        longitude_str = request.POST.get('longitude')
        image = request.FILES.get('image')

        if not all([category, title, latitude_str, longitude_str]):
            return JsonResponse({'error': 'Missing required fields (category, title, latitude, longitude)'}, status=400)

        try:
            latitude = float(latitude_str)
            longitude = float(longitude_str)
        except ValueError:
            return JsonResponse({'error': 'Latitude and longitude must be valid numbers'}, status=400)

        try:
            complaint = Complaint.objects.create(
                user=request.user,
                category=category,
                title=title,
                description=description,
                latitude=latitude,
                longitude=longitude,
                image=image
            )
            return JsonResponse({
                'success': True,
                'complaint': serialize_complaint(complaint, request)
            }, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

def api_map_complaints(request):
    # Public route to get pin details for the map
    complaints = Complaint.objects.all().order_by('-created_at')
    data = []
    for c in complaints:
        image_url = ""
        if c.image:
            image_url = request.build_absolute_uri(c.image.url)
        data.append({
            'id': c.id,
            'title': c.title,
            'category': c.category,
            'status': c.status,
            'latitude': c.latitude,
            'longitude': c.longitude,
            'image': image_url,
            'created_at': c.created_at.isoformat()
        })
    return JsonResponse({'complaints': data})

@csrf_exempt
def api_update_status(request, id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    if not request.user.is_staff:
        return JsonResponse({'error': 'Admin status required'}, status=403)

    if request.method != "POST":
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)

    try:
        data = json.loads(request.body)
        status = data.get('status')
    except Exception:
        status = request.POST.get('status')

    if not status:
        return JsonResponse({'error': 'Status field is required'}, status=400)

    valid_statuses = [s[0] for s in Complaint.STATUS]
    if status not in valid_statuses:
        return JsonResponse({'error': f'Invalid status. Must be one of {valid_statuses}'}, status=400)

    try:
        complaint = Complaint.objects.get(id=id)
        complaint.status = status
        complaint.save()
        return JsonResponse({
            'success': True,
            'complaint': serialize_complaint(complaint, request)
        })
    except Complaint.DoesNotExist:
        return JsonResponse({'error': 'Complaint not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

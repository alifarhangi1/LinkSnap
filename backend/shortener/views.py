from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect, HttpResponseGone
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import ShortLink, Click
from .serializers import (
    UserSerializer, RegisterSerializer,
    ShortLinkSerializer, ShortLinkDetailSerializer
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    def post(self, request):
        user = request.user
        current = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')
        if not user.check_password(current):
            return Response(
                {'current_password': ['Incorrect password.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(new_password) < 8:
            return Response(
                {'new_password': ['Password must be at least 8 characters.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password updated successfully.'})


class ShortLinkListCreateView(generics.ListCreateAPIView):
    serializer_class = ShortLinkSerializer

    def get_queryset(self):
        qs = ShortLink.objects.filter(user=self.request.user)
        search = self.request.query_params.get('search', '').strip()
        is_active = self.request.query_params.get('is_active', '')
        if search:
            qs = qs.filter(
                Q(title__icontains=search)
                | Q(original_url__icontains=search)
                | Q(short_code__icontains=search)
            )
        if is_active in ('true', 'false'):
            qs = qs.filter(is_active=(is_active == 'true'))
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ShortLinkDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ShortLinkDetailSerializer

    def get_queryset(self):
        return ShortLink.objects.filter(user=self.request.user)


@api_view(['GET'])
@permission_classes([AllowAny])
def redirect_view(request, short_code):
    link = get_object_or_404(ShortLink, short_code=short_code, is_active=True)

    if link.expires_at and link.expires_at < timezone.now():
        return HttpResponseGone('This link has expired.')

    ip = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    referer = request.META.get('HTTP_REFERER', '')

    Click.objects.create(
        link=link,
        ip_address=ip,
        user_agent=user_agent,
        referer=referer or '',
    )

    return HttpResponseRedirect(link.original_url)


class DashboardStatsView(APIView):
    def get(self, request):
        links = ShortLink.objects.filter(user=request.user)
        total_links = links.count()
        total_clicks = sum(link.click_count for link in links)
        active_links = links.filter(is_active=True).count()
        top_links = sorted(links, key=lambda l: l.click_count, reverse=True)[:5]

        return Response({
            'total_links': total_links,
            'total_clicks': total_clicks,
            'active_links': active_links,
            'top_links': ShortLinkSerializer(top_links, many=True).data,
        })

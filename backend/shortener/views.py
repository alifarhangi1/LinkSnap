from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
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


class ShortLinkListCreateView(generics.ListCreateAPIView):
    serializer_class = ShortLinkSerializer

    def get_queryset(self):
        return ShortLink.objects.filter(user=self.request.user)

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

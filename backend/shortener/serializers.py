from rest_framework import serializers
from django.contrib.auth.models import User
from .models import ShortLink, Click


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class ClickSerializer(serializers.ModelSerializer):
    class Meta:
        model = Click
        fields = ['id', 'clicked_at', 'ip_address', 'referer']


class ShortLinkSerializer(serializers.ModelSerializer):
    click_count = serializers.IntegerField(read_only=True)
    short_url = serializers.SerializerMethodField()

    class Meta:
        model = ShortLink
        fields = ['id', 'original_url', 'short_code', 'title', 'created_at', 'is_active', 'click_count', 'short_url']
        read_only_fields = ['id', 'short_code', 'created_at', 'click_count', 'short_url']

    def get_short_url(self, obj):
        return f'http://localhost:8000/api/r/{obj.short_code}'


class ShortLinkDetailSerializer(ShortLinkSerializer):
    clicks_by_day = serializers.SerializerMethodField()

    class Meta(ShortLinkSerializer.Meta):
        fields = ShortLinkSerializer.Meta.fields + ['clicks_by_day']

    def get_clicks_by_day(self, obj):
        from django.db.models import Count
        from django.db.models.functions import TruncDate
        from django.utils import timezone
        import datetime

        thirty_days_ago = timezone.now() - datetime.timedelta(days=30)
        clicks = (
            obj.clicks.filter(clicked_at__gte=thirty_days_ago)
            .annotate(date=TruncDate('clicked_at'))
            .values('date')
            .annotate(count=Count('id'))
            .order_by('date')
        )
        return [{'date': str(c['date']), 'count': c['count']} for c in clicks]

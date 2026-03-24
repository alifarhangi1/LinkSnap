import re
from collections import Counter
from urllib.parse import urlparse
from rest_framework import serializers
from django.contrib.auth.models import User
from django.conf import settings
from .models import ShortLink, Click


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'username']


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


def _parse_device(user_agent):
    ua = user_agent.lower()
    if 'mobile' in ua or 'android' in ua or 'iphone' in ua:
        return 'Mobile'
    if 'tablet' in ua or 'ipad' in ua:
        return 'Tablet'
    return 'Desktop'


def _parse_browser(user_agent):
    if 'Edg/' in user_agent:
        return 'Edge'
    if 'OPR/' in user_agent or 'Opera' in user_agent:
        return 'Opera'
    if 'Firefox/' in user_agent:
        return 'Firefox'
    if 'Chrome/' in user_agent:
        return 'Chrome'
    if 'Safari/' in user_agent:
        return 'Safari'
    return 'Other'


class ShortLinkSerializer(serializers.ModelSerializer):
    click_count = serializers.IntegerField(read_only=True)
    short_url = serializers.SerializerMethodField()
    is_expired = serializers.BooleanField(read_only=True)
    custom_code = serializers.CharField(
        max_length=50, required=False, allow_blank=True, write_only=True
    )

    class Meta:
        model = ShortLink
        fields = [
            'id', 'original_url', 'short_code', 'title', 'created_at',
            'is_active', 'expires_at', 'is_expired', 'click_count', 'short_url', 'custom_code',
        ]
        read_only_fields = ['id', 'short_code', 'created_at', 'click_count', 'short_url', 'is_expired']

    def get_short_url(self, obj):
        base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
        return f'{base_url}/api/r/{obj.short_code}'

    def validate_custom_code(self, value):
        if not value:
            return value
        if not re.match(r'^[a-zA-Z0-9_-]+$', value):
            raise serializers.ValidationError(
                'Only letters, numbers, hyphens, and underscores allowed.'
            )
        qs = ShortLink.objects.filter(short_code=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('This short code is already taken.')
        return value

    def create(self, validated_data):
        custom_code = validated_data.pop('custom_code', '') or ''
        if custom_code:
            validated_data['short_code'] = custom_code
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('custom_code', None)
        return super().update(instance, validated_data)


class ShortLinkDetailSerializer(ShortLinkSerializer):
    clicks_by_day = serializers.SerializerMethodField()
    device_breakdown = serializers.SerializerMethodField()
    browser_breakdown = serializers.SerializerMethodField()
    top_referrers = serializers.SerializerMethodField()

    class Meta(ShortLinkSerializer.Meta):
        fields = ShortLinkSerializer.Meta.fields + [
            'clicks_by_day', 'device_breakdown', 'browser_breakdown', 'top_referrers',
        ]

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

    def get_device_breakdown(self, obj):
        devices = Counter(_parse_device(c.user_agent) for c in obj.clicks.all())
        return [{'device': k, 'count': v} for k, v in devices.most_common()]

    def get_browser_breakdown(self, obj):
        browsers = Counter(_parse_browser(c.user_agent) for c in obj.clicks.all())
        return [{'browser': k, 'count': v} for k, v in browsers.most_common()]

    def get_top_referrers(self, obj):
        referrers = []
        for c in obj.clicks.all():
            if c.referer:
                try:
                    domain = urlparse(c.referer).netloc or c.referer
                    referrers.append(domain)
                except Exception:
                    pass
        counter = Counter(referrers)
        return [{'referrer': k, 'count': v} for k, v in counter.most_common(10)]

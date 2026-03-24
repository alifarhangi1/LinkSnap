import random
import string
from django.db import models
from django.contrib.auth.models import User


def generate_short_code():
    chars = string.ascii_letters + string.digits
    return ''.join(random.choices(chars, k=7))


class ShortLink(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='links')
    original_url = models.URLField(max_length=2048)
    short_code = models.CharField(max_length=50, unique=True, default=generate_short_code)
    title = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.short_code} -> {self.original_url}'

    @property
    def click_count(self):
        return self.clicks.count()

    @property
    def is_expired(self):
        from django.utils import timezone
        return self.expires_at is not None and self.expires_at < timezone.now()


class Click(models.Model):
    link = models.ForeignKey(ShortLink, on_delete=models.CASCADE, related_name='clicks')
    clicked_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    referer = models.URLField(max_length=2048, blank=True, default='')

    class Meta:
        ordering = ['-clicked_at']

    def __str__(self):
        return f'Click on {self.link.short_code} at {self.clicked_at}'

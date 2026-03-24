import shortener.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shortener', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shortlink',
            name='short_code',
            field=models.CharField(default=shortener.models.generate_short_code, max_length=50, unique=True),
        ),
        migrations.AddField(
            model_name='shortlink',
            name='expires_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

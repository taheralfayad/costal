# Generated by Django 5.1 on 2025-03-25 23:34

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lti", "0018_alter_module_prequiz"),
    ]

    operations = [
        migrations.AddField(
            model_name="questionattempt",
            name="created_at",
            field=models.DateTimeField(
                auto_now_add=True, default=django.utils.timezone.now
            ),
            preserve_default=False,
        ),
    ]

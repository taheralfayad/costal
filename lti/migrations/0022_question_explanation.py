# Generated by Django 5.1 on 2025-04-03 21:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("lti", "0021_assignment_canvas_id"),
    ]

    operations = [
        migrations.AddField(
            model_name="question",
            name="explanation",
            field=models.TextField(default=""),
        ),
    ]

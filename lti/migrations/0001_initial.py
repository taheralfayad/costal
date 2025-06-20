# Generated by Django 5.1 on 2025-01-15 00:14

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="CanvasUser",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("uid", models.CharField(max_length=200)),
                ("refresh_token", models.CharField(max_length=255, null=True)),
                ("expires_in", models.BigIntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name="Deployment",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("deployment_id", models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name="Key",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("public_key", models.TextField()),
                ("private_key", models.TextField()),
                ("alg", models.TextField(default="RS256")),
            ],
        ),
        migrations.CreateModel(
            name='PossibleAnswer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('answer', models.TextField(default='')),
                ('is_correct', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Textbook',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('author', models.CharField(max_length=255)),
                ('published_date', models.DateField(blank=True, null=True)),
                ('isbn', models.CharField(blank=True, max_length=13, null=True, unique=True)),
                ('file', models.FileField(blank=True, null=True, upload_to='textbooks/')),
            ],
        ),
        migrations.CreateModel(
            name='Course',
            fields=[
                ('course_id', models.CharField(max_length=200, primary_key=True, serialize=False)),
                ('teachers', models.ManyToManyField(related_name='teaching_courses', to='lti.canvasuser')),
                ('users', models.ManyToManyField(to='lti.canvasuser')),
            ],
        ),
        migrations.CreateModel(
            name='Assignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('course', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='lti.course')),
            ],
        ),
        migrations.CreateModel(
            name='KeySet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('keys', models.ManyToManyField(blank=True, related_name='key_sets', to='lti.key')),
            ],
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='Question', max_length=255)),
                ('text', models.TextField()),
                ('difficulty', models.IntegerField(default=0)),
                ('num_points', models.IntegerField(default=1)),
                ('assignments', models.ManyToManyField(blank=True, to='lti.assignment')),
                ('possible_answers', models.ManyToManyField(blank=True, to='lti.possibleanswer')),
            ],
        ),
        migrations.AddField(
            model_name='possibleanswer',
            name='related_question',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='lti.question'),
        ),
        migrations.AddField(
            model_name='assignment',
            name='questions',
            field=models.ManyToManyField(blank=True, to='lti.question'),
        ),
        migrations.CreateModel(
            name='Registration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('issuer', models.CharField(max_length=255)),
                ('client_id', models.CharField(max_length=255)),
                ('platform_login_auth_endpoint', models.CharField(max_length=255)),
                ('platform_service_auth_endpoint', models.CharField(max_length=255)),
                ('platform_jwks_endpoint', models.CharField(max_length=255)),
                ('deployments', models.ManyToManyField(blank=True, related_name='registrations', to='lti.deployment')),
                ('key_set', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='registrations', to='lti.keyset')),
            ],
        ),
        migrations.AddField(
            model_name='deployment',
            name='registration',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lti.registration'),
        ),
        migrations.CreateModel(
            name='Response',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number_of_seconds_to_answer', models.IntegerField(default=0)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lti.question')),
                ('response', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lti.possibleanswer')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='lti.canvasuser')),
            ],
        ),
        migrations.CreateModel(
            name='Skill',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField()),
                ('assignments', models.ManyToManyField(blank=True, to='lti.assignment')),
                ('course', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='lti.course')),
                ('questions', models.ManyToManyField(blank=True, to='lti.question')),
            ],
        ),
        migrations.AddField(
            model_name='question',
            name='associated_skill',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='lti.skill'),
        ),
        migrations.AddConstraint(
            model_name="registration",
            constraint=models.UniqueConstraint(
                fields=("issuer", "client_id"), name="unique_issuer_client_id"
            ),
        ),
    ]

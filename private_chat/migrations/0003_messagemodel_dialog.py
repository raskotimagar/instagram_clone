# Generated by Django 5.1.2 on 2025-01-03 04:20

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('private_chat', '0002_alter_uploadedfile_file_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='messagemodel',
            name='dialog',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='private_chat.dialogsmodel'),
        ),
    ]

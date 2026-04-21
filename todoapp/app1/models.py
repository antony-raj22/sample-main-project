from django.db import models
from django.contrib.auth.models import User
class Person(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.name

class Task(models.Model):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
    person = models.ForeignKey(Person, on_delete=models.CASCADE)

    def __str__(self):
        return self.title
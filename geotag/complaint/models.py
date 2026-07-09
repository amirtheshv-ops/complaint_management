from django.db import models
from django.contrib.auth.models import User



class Citizen(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    phone = models.CharField(
        max_length=15
    )

    address = models.TextField()


    def __str__(self):
        return self.user.username





class Complaint(models.Model):


    CATEGORY = (

        ('Garbage','Garbage'),

        ('Road Damage','Road Damage'),

        ('Water Leakage','Water Leakage'),

        ('Street Light','Street Light'),

        ('Drainage','Drainage'),

        ('Other','Other'),

    )



    STATUS = (

        ('Pending','Pending'),

        ('In Progress','In Progress'),

        ('Resolved','Resolved'),

    )



    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )


    category = models.CharField(
        max_length=100,
        choices=CATEGORY
    )


    title = models.CharField(
        max_length=200
    )


    description = models.TextField()


    image = models.ImageField(
        upload_to='complaints/'
    )


    latitude = models.FloatField()


    longitude = models.FloatField()


    status = models.CharField(
        max_length=50,
        choices=STATUS,
        default='Pending'
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )



    def __str__(self):

        return self.title
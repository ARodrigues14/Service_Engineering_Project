from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator

class UserModel(AbstractUser):
    phone_no = models.CharField(
        max_length=9,
        validators=[RegexValidator(regex='^\d{9}$', message='Phone number must be exactly 9 digits')],
        default='000000000'
    )
    photo = models.ImageField(upload_to='verify/', null=True, blank=True)
    face_id = models.CharField(max_length=255, blank=True, null=True)
    password = models.CharField(max_length=128, null=True, blank=True)


class LoanRequest(models.Model):
    face_id = models.CharField(max_length=255)
    initial_amount = models.DecimalField(max_digits=10, decimal_places=2)
    amount_with_interest = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.CharField(max_length=20)
    installment = models.DecimalField(max_digits=10, decimal_places=2)
    income = models.DecimalField(max_digits=10, decimal_places=2)
    expenses = models.DecimalField(max_digits=10, decimal_places=2)
    loan_date = models.DateTimeField()
    agent_id = models.IntegerField()
    status = models.CharField(max_length=20)
    interview_datetime = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'quickstart'
        verbose_name = 'Loan'
        verbose_name_plural = 'Loans'

    def __str__(self):
        return f"Loan {self.id} - {self.status}"
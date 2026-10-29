from rest_framework import serializers

BASIS_CHOICES = [("invoice", "Invoice basis"), ("cash", "Cash basis")]


class PeriodSerializer(serializers.Serializer):
    date_from = serializers.DateField()
    date_to = serializers.DateField()

    def validate(self, attrs):
        if attrs["date_from"] > attrs["date_to"]:
            raise serializers.ValidationError("date_from must be on or before date_to.")
        return attrs


class CompanyStatementQuerySerializer(PeriodSerializer):
    basis = serializers.ChoiceField(choices=BASIS_CHOICES, default="invoice")


class LandlordStatementQuerySerializer(PeriodSerializer):
    landlord = serializers.IntegerField()
    property = serializers.IntegerField(required=False)


class MarkPaidSerializer(serializers.Serializer):
    paid_at = serializers.DateField()

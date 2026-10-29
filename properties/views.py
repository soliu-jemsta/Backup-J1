from .models import Property, PropertyImage
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .serializers import PropertySerializer, PropertyImageSerializer
from comments.serializers import CommentSerializer
from Users.permissions import AuthenticatedExceptOptions


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [AuthenticatedExceptOptions]

    def get_queryset(self):
        queryset = Property.objects.all()
        landlord_id = self.request.query_params.get('landlord')

        if landlord_id:
            queryset = queryset.filter(landlord_id=landlord_id)

        return queryset

    # 🔹 COMMENTS ENDPOINT
    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        property_obj = self.get_object()

        if request.method == 'GET':
            comments = property_obj.comments.all().order_by('-created_at')
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            data = request.data.copy()
            data['content_type'] = 'property'
            data['object_id'] = property_obj.id

            serializer = CommentSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data)

    # 🔹 IMAGE UPLOAD ENDPOINT
    @action(detail=True, methods=["post"], url_path="images")
    def upload_images(self, request, pk=None):
        property_obj = self.get_object()

        image_files = request.FILES.getlist("images")

        if not image_files:
            return Response(
                {"detail": "No images were provided."},
                status=400
            )

        images = []

        for image_file in image_files:
            image = PropertyImage.objects.create(
                property=property_obj,
                image=image_file
            )

            images.append(image)

        serializer = PropertyImageSerializer(
            images,
            many=True,
            context={"request": request}
        )

        return Response(
            serializer.data,
            status=201
        )


# The legacy InvoiceViewSet that lived here has been removed. It called
# create_invoice_pipeline and read invoice.invoice_number, neither of which
# exists any more. Landlord invoices are generated from the Projects page via
# POST /projects/<id>/generate-invoice/, and remittance statements through
# invoices.services.create_remittance_statement.
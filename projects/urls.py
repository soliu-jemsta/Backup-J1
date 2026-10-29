# projects/urls.py
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectTypeViewSet, ProjectImageViewSet

router = DefaultRouter()
router.register("projects", ProjectViewSet, basename="project")
router.register("project-types", ProjectTypeViewSet, basename="project-type")
router.register("project-images", ProjectImageViewSet, basename="project-image")

urlpatterns = router.urls
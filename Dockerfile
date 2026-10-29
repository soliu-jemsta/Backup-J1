FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# MySQL dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/')" || exit 1

RUN python manage.py collectstatic --noinput

CMD ["sh", "-c", "\
echo '===== RUNNING MIGRATIONS =====' && \
python manage.py migrate && \
echo '===== COLLECTING STATIC FILES =====' && \
python manage.py collectstatic --noinput && \
echo '===== STARTING GUNICORN =====' && \
gunicorn jemsta_backend.wsgi:application \
--bind 0.0.0.0:${PORT:-8000} \
--workers 2 \
--threads 2 \
--timeout 120 \
--access-logfile - \
--error-logfile -"]
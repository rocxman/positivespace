FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY apps/api/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --force-reinstall bcrypt==4.0.1 && \
    pip install --no-cache-dir -r /tmp/requirements.txt

COPY apps/api/ /app/apps/api/

ENV PYTHONPATH=/app/apps/api
ENV PORT=8000

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

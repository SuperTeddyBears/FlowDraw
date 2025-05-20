FROM python:3.12-slim

WORKDIR /app

RUN pip install poetry

COPY ./ /app/

EXPOSE 8080

CMD ["sh", "-c", "poetry install --no-root && python manage.py runserver 0.0.0.0:8080"]

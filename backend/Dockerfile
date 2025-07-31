FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for GeoDjango
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    postgresql-client \
    && apt-get clean

# Set the working directory
WORKDIR /app

# Copy project files into the container
COPY . /app/

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose the port Render will use
EXPOSE 8000

# Migrate Django Models && Start Gunicorn server
CMD ["sh", "-c", "python manage.py migrate && gunicorn photoapp.wsgi:application --bind 0.0.0.0:8000"]
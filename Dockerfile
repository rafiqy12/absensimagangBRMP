FROM php:8.2-apache

# Install dependencies untuk PHP GD dan SQLite
RUN apt-get update && apt-get install -y \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libsqlite3-dev \
    sqlite3 \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_sqlite \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# Set direktori kerja
WORKDIR /var/www/html

# Salin seluruh file proyek
COPY . /var/www/html/

# Set hak akses folder uploads & data database SQLite
RUN chown -R www-data:www-data /var/www/html/data /var/www/html/uploads \
    && chmod -R 775 /var/www/html/data /var/www/html/uploads

EXPOSE 80

CMD ["apache2-foreground"]

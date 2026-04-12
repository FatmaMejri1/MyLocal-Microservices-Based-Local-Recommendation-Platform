FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libicu-dev \
    libonig-dev \
    libzip-dev \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        intl \
        zip \
    && docker-php-ext-enable opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable Apache rewrite
RUN a2enmod rewrite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Configure Apache to use Symfony public/
ENV APACHE_DOCUMENT_ROOT /var/www/html/public

RUN sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf \
    && sed -ri -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Allow .htaccess
RUN echo '<Directory /var/www/html/public>' > /etc/apache2/conf-available/custom.conf \
    && echo '    AllowOverride All' >> /etc/apache2/conf-available/custom.conf \
    && echo '    Require all granted' >> /etc/apache2/conf-available/custom.conf \
    && echo '</Directory>' >> /etc/apache2/conf-available/custom.conf \
    && a2enconf custom

# Copy project code
COPY . .

# Install dependencies
RUN composer install --no-interaction --optimize-autoloader --no-scripts

# Fix permissions
RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data /var/www/html

# Create .htaccess for Symfony routing
RUN printf 'DirectoryIndex index.php\n\
<IfModule mod_rewrite.c>\n\
    RewriteEngine On\n\
    RewriteCond %%{REQUEST_URI}::$$1 ^(/.+)/(.*)::\\2$$\n\
    RewriteRule ^(.*) - [E=BASE:%%1]\n\
    RewriteCond %%{HTTP:Authorization} .\n\
    RewriteRule ^ - [E=HTTP_AUTHORIZATION:%%{HTTP:Authorization}]\n\
    RewriteCond %%{ENV:REDIRECT_STATUS} ^$$\n\
    RewriteRule ^index\\.php(?:/(.*)|$$) %%{ENV:BASE}/$$1 [R=301,L]\n\
    RewriteCond %%{REQUEST_FILENAME} -f\n\
    RewriteRule ^ - [L]\n\
    RewriteRule ^ %%{ENV:BASE}/index.php [L]\n\
</IfModule>\n' > /var/www/html/public/.htaccess

# Entrypoint to auto-fix DB on startup
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

CMD ["docker-entrypoint.sh"]

EXPOSE 80

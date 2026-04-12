FROM php:8.2-apache
# =========================
# System dependencies
# =========================
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
# =========================
# Apache modules
# =========================
RUN a2enmod rewrite
# =========================
# Composer
# =========================
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
# =========================
# Working directory
# =========================
WORKDIR /var/www/html
# =========================
# Apache config
# =========================
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e "s!/var/www/html!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/sites-available/*.conf \
    && sed -ri -e "s!/var/www/!${APACHE_DOCUMENT_ROOT}!g" /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN echo '<Directory /var/www/html/public>' > /etc/apache2/conf-available/custom.conf \
    && echo '    AllowOverride All' >> /etc/apache2/conf-available/custom.conf \
    && echo '    Require all granted' >> /etc/apache2/conf-available/custom.conf \
    && echo '</Directory>' >> /etc/apache2/conf-available/custom.conf \
    && a2enconf custom
# =========================
# Copy project
# =========================
COPY . .
# =========================
# PHP dependencies
# =========================
RUN composer install --no-interaction --optimize-autoloader --no-scripts
# =========================
# Permissions
# =========================
RUN mkdir -p var/cache var/log vendor \
    && chown -R www-data:www-data var
# =========================
# htaccess
# =========================

RUN echo 'DirectoryIndex index.php' > /var/www/html/public/.htaccess \
    && echo '<IfModule mod_rewrite.c>' >> /var/www/html/public/.htaccess \
    && echo '    RewriteEngine On' >> /var/www/html/public/.htaccess \
    && echo '    RewriteCond %{REQUEST_FILENAME} -f' >> /var/www/html/public/.htaccess \
    && echo '    RewriteRule ^ - [L]' >> /var/www/html/public/.htaccess \
    && echo '    RewriteRule ^ index.php [L]' >> /var/www/html/public/.htaccess \
    && echo '</IfModule>' >> /var/www/html/public/.htaccess
# =========================
# Entrypoint
# =========================
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
CMD ["docker-entrypoint.sh"]
# =========================
# Expose port
# =========================
EXPOSE 80

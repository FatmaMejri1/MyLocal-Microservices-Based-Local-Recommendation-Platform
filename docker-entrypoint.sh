#!/bin/bash
cd /var/www/html
php bin/console doctrine:schema:update --force --no-interaction 2>/dev/null || true
apache2-foreground

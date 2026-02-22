set -e

echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
if [ -z "${DB_PASSWORD}" ]; then
  until mysqladmin ping -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USERNAME}" --silent; do
    sleep 2
  done
else
  until mysqladmin ping -h"${DB_HOST}" -P"${DB_PORT}" -u"${DB_USERNAME}" -p"${DB_PASSWORD}" --silent; do
    sleep 2
  done
fi

echo "MySQL is up."

php artisan config:clear || true
php artisan cache:clear || true
php artisan route:clear || true
php artisan view:clear || true

if [ ! -f .env ]; then
  cp .env.example .env
fi

php artisan key:generate --force || true
php artisan migrate:fresh --seed --force
php artisan serve --host=0.0.0.0 --port=8000

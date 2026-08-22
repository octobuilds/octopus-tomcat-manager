#!/bin/bash

# Extract version from package.json
VERSION=$(grep '"version"' package.json | cut -d '"' -f 4)

# Allow overriding version via argument
if [ ! -z "$1" ]; then
  VERSION=$1
fi

echo "======================================"
echo "Octopus APM Version: v$VERSION"
echo "======================================"

echo "Docker Hub'a giris yapin:"
docker login -u octopusapm

echo "Imaj derleniyor..."
docker build -t octopusapm/octopus-apm:v$VERSION .

echo "Imaj Docker Hub'a gonderiliyor (v$VERSION)..."
docker push octopusapm/octopus-apm:v$VERSION

# Tag as latest too (optional but good practice)
docker tag octopusapm/octopus-apm:v$VERSION octopusapm/octopus-apm:latest
docker push octopusapm/octopus-apm:latest

# Update docker-compose.customer.yml to use the specific version
sed -i "s|image: octopusapm/octopus-apm:.*|image: octopusapm/octopus-apm:v$VERSION|g" docker-compose.customer.yml

echo "Islem tamamlandi! Musterilerinize guncellenen 'docker-compose.customer.yml' dosyasini verebilirsiniz."

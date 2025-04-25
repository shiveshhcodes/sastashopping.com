#!/bin/bash

# Create images directory if it doesn't exist
mkdir -p public/images

# Download placeholder images
curl -o public/images/smartphone.jpg https://picsum.photos/300/300
curl -o public/images/headphones.jpg https://picsum.photos/300/300
curl -o public/images/sneakers.jpg https://picsum.photos/300/300
curl -o public/images/camera.jpg https://picsum.photos/300/300
curl -o public/images/electronics-category.jpg https://picsum.photos/800/400
curl -o public/images/fashion-category.jpg https://picsum.photos/800/400
curl -o public/images/home-category.jpg https://picsum.photos/800/400 
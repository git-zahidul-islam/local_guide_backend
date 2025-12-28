#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Install TypeScript type definitions
echo "Installing TypeScript type definitions..."
npm install --save-dev @types/express @types/cors @types/cookie-parser @types/jsonwebtoken @types/multer @types/node

# Check if types are installed
if [ ! -d "node_modules/@types/express" ]; then
    echo "Warning: @types/express not found, installing..."
    npm install --save-dev @types/express
fi

# Compile TypeScript with more permissive settings if needed
echo "Compiling TypeScript..."
npx tsc --skipLibCheck

echo "Build completed!"
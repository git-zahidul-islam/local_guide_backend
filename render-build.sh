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

# Alternative: Build without strict type checking (use as fallback)
# echo "Building with relaxed TypeScript settings..."
# npx tsc --skipLibCheck --noEmitOnError false || {
#     echo "TypeScript compilation failed, creating declaration file workaround..."
#     # Create a simple declaration file for missing modules
#     cat > src/custom.d.ts << 'EOF'
# declare module 'express';
# declare module 'cors';
# declare module 'cookie-parser';
# declare module 'jsonwebtoken';
# declare module 'multer';
# EOF
#     # Try compilation again
#     npx tsc --skipLibCheck
# }

echo "Build completed!"
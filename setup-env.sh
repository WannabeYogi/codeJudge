#!/bin/bash

# Script to set up environment variables for Shodh-a-Code

echo "Setting up environment for Shodh-a-Code..."

# Create backend .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env file..."
    cat > backend/.env << EOL
# MongoDB Connection (replace with your own credentials)
# IMPORTANT: DO NOT COMMIT THIS FILE TO VERSION CONTROL
MONGODB_URI=mongodb://localhost:27017/shodhdb

# Server Configuration
SERVER_PORT=8080

# Docker Configuration
DOCKER_HOST=unix:///var/run/docker.sock
EOL
    echo "✅ Created backend/.env file"
else
    echo "⚠️ backend/.env already exists, skipping"
fi

# Create frontend .env.local file if it doesn't exist
if [ ! -f frontend/.env.local ]; then
    echo "Creating frontend/.env.local file..."
    cat > frontend/.env.local << EOL
NEXT_PUBLIC_API_BASE=http://localhost:8080
EOL
    echo "✅ Created frontend/.env.local file"
else
    echo "⚠️ frontend/.env.local already exists, skipping"
fi

echo ""
echo "🚨 IMPORTANT: Update the MongoDB URI in backend/.env with your credentials 🚨"
echo "Setup complete! You can now run the application with:"
echo "docker-compose up --build"
echo ""
echo "Or run the backend and frontend separately:"
echo "cd backend && ./mvnw spring-boot:run"
echo "cd frontend && npm run dev"

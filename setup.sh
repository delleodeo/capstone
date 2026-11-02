#!/bin/bash

# AgriDrone Setup Script
# This script helps set up the development environment

echo "🌿 Setting up AgriDrone development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB doesn't appear to be running. Please start MongoDB first."
    echo "   Run: mongod"
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama not found. Installing..."
    curl -fsSL https://ollama.ai/install.sh | sh
fi

# Check if llama3.1:8b model is available
if ! ollama list | grep -q "llama3.1:8b"; then
    echo "📦 Pulling llama3.1:8b model..."
    ollama pull llama3.1:8b
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install server dependencies"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/agridrone
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
PORT=3000
NODE_ENV=development
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

# Install client dependencies
echo "📦 Installing client dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install client dependencies"
    exit 1
fi

# Check model files
echo "🔍 Checking model files..."
if [ ! -d "public/model" ]; then
    echo "⚠️  Model files not found in client/public/model/"
    echo "   Please copy your Teachable Machine model files to client/public/model/"
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start development:"
echo "1. Start MongoDB: mongod"
echo "2. Start Ollama: ollama serve"
echo "3. Start server: cd server && npm run dev"
echo "4. Start client: cd client && npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
echo "Optional: Seed the database with sample data:"
echo "cd server && npm run seed"
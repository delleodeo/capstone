@echo off
REM AgriDrone Setup Script for Windows
REM This script helps set up the development environment

echo 🌿 Setting up AgriDrone development environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if MongoDB is running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if errorlevel 1 (
    echo ⚠️  MongoDB doesn't appear to be running. Please start MongoDB first.
    echo    Run: mongod
)

REM Check if Ollama is installed
ollama --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Ollama not found. Please install Ollama from https://ollama.ai
    pause
    exit /b 1
)

REM Check if llama3.1:8b model is available
ollama list | findstr "llama3.1:8b" >nul
if errorlevel 1 (
    echo 📦 Pulling llama3.1:8b model...
    ollama pull llama3.1:8b
)

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ❌ Failed to install server dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo ⚙️  Creating .env file...
    (
        echo MONGODB_URI=mongodb://localhost:27017/agridrone
        echo OLLAMA_BASE_URL=http://localhost:11434
        echo OLLAMA_MODEL=llama3.1:8b
        echo PORT=3000
        echo NODE_ENV=development
    ) > .env
    echo ✅ Created .env file
) else (
    echo ✅ .env file already exists
)

REM Install client dependencies
echo 📦 Installing client dependencies...
cd ..\client
call npm install
if errorlevel 1 (
    echo ❌ Failed to install client dependencies
    pause
    exit /b 1
)

REM Check model files
echo 🔍 Checking model files...
if not exist "public\model" (
    echo ⚠️  Model files not found in client\public\model\
    echo    Please copy your Teachable Machine model files to client\public\model\
)

cd ..

echo.
echo 🎉 Setup complete!
echo.
echo To start development:
echo 1. Start MongoDB: mongod
echo 2. Start Ollama: ollama serve
echo 3. Start server: cd server ^&^& npm run dev
echo 4. Start client: cd client ^&^& npm run dev
echo.
echo Then open http://localhost:5173 in your browser
echo.
echo Optional: Seed the database with sample data:
echo cd server ^&^& npm run seed
echo.
pause
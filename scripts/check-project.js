#!/usr/bin/env node

/**
 * AgriDrone Project Status Checker
 * Verifies that all components are properly set up
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(color + message + colors.reset);
}

function checkFile(filePath, description) {
  const fullPath = path.join(projectRoot, filePath);
  const exists = fs.existsSync(fullPath);
  log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`, exists ? colors.green : colors.red);
  return exists;
}

function checkDirectory(dirPath, description) {
  const fullPath = path.join(projectRoot, dirPath);
  const exists = fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  log(`${exists ? '✅' : '❌'} ${description}: ${dirPath}`, exists ? colors.green : colors.red);
  return exists;
}

function checkPackageJson(filePath) {
  try {
    const fullPath = path.join(projectRoot, filePath);
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const hasScripts = content.scripts && Object.keys(content.scripts).length > 0;
    const hasDependencies = content.dependencies && Object.keys(content.dependencies).length > 0;
    
    log(`✅ ${filePath} - Scripts: ${Object.keys(content.scripts || {}).length}, Dependencies: ${Object.keys(content.dependencies || {}).length}`, colors.green);
    return true;
  } catch (error) {
    log(`❌ ${filePath} - Invalid JSON or missing`, colors.red);
    return false;
  }
}

async function main() {
  log('\n🌿 AgriDrone Project Status Check', colors.bold + colors.blue);
  log('================================\n');

  let allGood = true;

  // Check project structure
  log('📁 Project Structure:', colors.bold);
  allGood &= checkDirectory('server', 'Server directory');
  allGood &= checkDirectory('client', 'Client directory');
  allGood &= checkDirectory('citrus-model', 'Model directory');

  // Check server files
  log('\n🖥️  Server Files:', colors.bold);
  allGood &= checkFile('server/package.json', 'Server package.json');
  allGood &= checkFile('server/src/index.js', 'Server entry point');
  allGood &= checkFile('server/src/models/Recommendation.js', 'Recommendation model');
  allGood &= checkFile('server/src/models/ChatMessage.js', 'ChatMessage model');
  allGood &= checkFile('server/src/routes/health.js', 'Health routes');
  allGood &= checkFile('server/src/routes/recommendations.js', 'Recommendations routes');
  allGood &= checkFile('server/src/routes/chat.js', 'Chat routes');
  allGood &= checkFile('server/src/services/llmAdapter.js', 'LLM adapter service');
  allGood &= checkFile('server/src/services/seedData.js', 'Seed data service');

  // Check client files
  log('\n🎨 Client Files:', colors.bold);
  allGood &= checkFile('client/package.json', 'Client package.json');
  allGood &= checkFile('client/index.html', 'HTML entry point');
  allGood &= checkFile('client/src/main.js', 'Vue entry point');
  allGood &= checkFile('client/src/App.vue', 'Root Vue component');
  allGood &= checkFile('client/src/router/index.js', 'Vue router');
  allGood &= checkFile('client/src/views/Home.vue', 'Home page');
  allGood &= checkFile('client/src/views/Detect.vue', 'Detect page');
  allGood &= checkFile('client/src/views/Chat.vue', 'Chat page');
  allGood &= checkFile('client/src/views/About.vue', 'About page');
  allGood &= checkFile('client/src/views/NotFound.vue', '404 page');

  // Check components
  log('\n🧩 Vue Components:', colors.bold);
  allGood &= checkFile('client/src/components/AppShell.vue', 'App shell');
  allGood &= checkFile('client/src/components/ImageUploader.vue', 'Image uploader');
  allGood &= checkFile('client/src/components/PredictionCard.vue', 'Prediction card');
  allGood &= checkFile('client/src/components/RecommendationCard.vue', 'Recommendation card');
  allGood &= checkFile('client/src/components/ChatWidget.vue', 'Chat widget');
  allGood &= checkFile('client/src/components/Toast.vue', 'Toast component');

  // Check utilities
  log('\n🔧 Utilities:', colors.bold);
  allGood &= checkFile('client/src/utils/api.js', 'API client');
  allGood &= checkFile('client/src/utils/modelLoader.js', 'ML model loader');
  allGood &= checkFile('client/src/assets/styles.css', 'CSS styles');

  // Check model files
  log('\n🤖 ML Model Files:', colors.bold);
  allGood &= checkFile('citrus-model/model.json', 'TensorFlow model');
  allGood &= checkFile('citrus-model/metadata.json', 'Model metadata');
  allGood &= checkFile('client/public/model/model.json', 'Client model copy');
  allGood &= checkFile('client/public/model/metadata.json', 'Client metadata copy');

  // Check package.json files
  log('\n📦 Package Files:', colors.bold);
  allGood &= checkPackageJson('server/package.json');
  allGood &= checkPackageJson('client/package.json');

  // Check configuration files
  log('\n⚙️  Configuration:', colors.bold);
  checkFile('server/.env', 'Server environment variables');
  checkFile('client/vite.config.js', 'Vite configuration');

  // Summary
  log('\n📊 Summary:', colors.bold);
  if (allGood) {
    log('🎉 All critical files are present! Project is ready for development.', colors.green + colors.bold);
  } else {
    log('⚠️  Some files are missing. Check the items marked with ❌ above.', colors.yellow + colors.bold);
  }

  // Next steps
  log('\n🚀 Next Steps:', colors.bold);
  log('1. Install dependencies: npm run install:all');
  log('2. Set up environment variables in server/.env');
  log('3. Start MongoDB: mongod');
  log('4. Start Ollama: ollama serve');
  log('5. Pull LLM model: ollama pull llama3.1:8b');
  log('6. Seed database: npm run seed');
  log('7. Start development: npm run dev');
  log('8. Open http://localhost:5173');

  log('\n✨ Happy coding!', colors.blue);
}

main().catch(console.error);
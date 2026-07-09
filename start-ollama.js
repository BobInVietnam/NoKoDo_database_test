const { spawn } = require('child_process');
const http = require('http');

const OLLAMA_HOST = '127.0.0.1';
const OLLAMA_PORT = 11434;
const MODEL_NAME = 'gemma4:31b-cloud';

function isOllamaRunning() {
  return new Promise((resolve) => {
    const req = http.get(`http://${OLLAMA_HOST}:${OLLAMA_PORT}/api/tags`, { timeout: 1000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve({ running: true, models: parsed.models || [] });
          } catch (e) {
            resolve({ running: true, models: [] });
          }
        } else {
          resolve({ running: false });
        }
      });
    });

    req.on('error', () => {
      resolve({ running: false });
    });
  });
}

function startOllama() {
  console.log('🚀 Ollama is not running. Starting Ollama daemon background process...');
  const child = spawn('ollama', ['serve'], {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('🔍 Checking Ollama service status...');
  let status = await isOllamaRunning();

  if (!status.running) {
    startOllama();
    
    // Wait and poll for Ollama to start up
    let retries = 5;
    while (retries > 0) {
      console.log(`⏳ Waiting for Ollama to initialize... (${retries} attempts left)`);
      await sleep(2000);
      status = await isOllamaRunning();
      if (status.running) {
        break;
      }
      retries--;
    }
  }

  if (status.running) {
    console.log('✅ Ollama is running successfully.');
    const modelExists = status.models.some(
      (m) => m.name === MODEL_NAME || m.name.startsWith(MODEL_NAME + ':') || m.name.startsWith(MODEL_NAME)
    );
    if (modelExists) {
      console.log(`✅ Model "${MODEL_NAME}" is available locally.`);
    } else {
      console.warn(`⚠️ Warning: Model "${MODEL_NAME}" was not detected in local models list:`, status.models.map(m => m.name));
      console.log(`💡 You may need to run "ollama pull ${MODEL_NAME}" to use it.`);
    }
  } else {
    console.error('❌ Failed to start Ollama. Please ensure ollama is installed and run "ollama serve" manually.');
  }
}

main().catch(console.error);

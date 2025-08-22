// == PACKAGES == //
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const sharp = require('sharp');

// == PATHS == //
const picPath = path.join(__dirname, 'image.png'); // -- Your Image Path -- //
const luaScriptPath = path.join(__dirname, 'processing.lua'); // -- Main Lua Script -- //
const inputFile = path.join(__dirname, 'input.bin'); // -- Binary Data file -- //
const outputFile = path.join(__dirname, 'output.txt'); // -- Encoded Output file -- //

// == FIND LUAJIT == //
let luajitPath;
try {
  luajitPath = execSync('where luajit').toString().split(/\r?\n/)[0].trim();
  console.log('Found luajit at:', luajitPath);
} catch (err) {
  console.error('Could not find luajit in PATH. Please install it or add it to PATH.');
  process.exit(1);
}

// == MAIN == //
(async () => {
  try {
    // == CONVERT IMAGE TO BINARY DATA == //
    const image = sharp(picPath).resize(32, 32).raw().ensureAlpha();
    let { data } = await image.toBuffer({ resolveWithObject: true }); 
    fs.writeFileSync(inputFile, data);

    // == RUN LUA SCRIPT TO PROCESS BINARY DATA == //
    const lua = spawn(luajitPath, [luaScriptPath, inputFile, outputFile]);

    lua.stderr.on('data', (chunk) => {
      console.error('lua err ', chunk.toString());
    });

    lua.on('close', (code) => {
      if (code !== 0) {
        console.error('lua err ', code);
        return;
      }
      // == DELETE INPUT FILE AFTER PROCESSING == //
      fs.unlinkSync(inputFile);
      console.log('Completed');
    });

  } catch (err) {
    console.error(err);
  }
})();

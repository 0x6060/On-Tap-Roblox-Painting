// == PACKAGES == //
const fs = require('fs');
const { spawn } = require('child_process');
const sharp = require('sharp');

// == PATHS == //
const picPath = 'IMAGE_NAME'; //  -- Your Image Path that you want to convert to code for On Tap in Roblox. (e.g., 'image.png') -- //
const luaScriptPath = 'processing.lua';  // -- Main Lua Script. -- //
const inputFile = `input.bin`; // -- Binary file for Binary Data. -- //
const outputFile = `output.txt`; // -- Encoded Output file. -- //

// == MAIN == //
(async () => {
  try {

    // == CONVERT IMAGE TO BINARY DATA == //
    const image = sharp(picPath).resize(32, 32).raw().ensureAlpha();
    let { data } = await image.toBuffer({ resolveWithObject: true }); 
    fs.writeFileSync(inputFile, data);

    // == RUN LUA SCRIPT TO PROCESS BINARY DATA AND COMPRESS THEN ENCODE == //
    const lua = spawn('luajit', [luaScriptPath, inputFile, outputFile]);

    lua.stderr.on('data', (chunk) => {
      console.error('lua err ', chunk.toString());
    });

    lua.on('close', (code) => {
      if (code !== 0) {
        console.error('lua err ',code);
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

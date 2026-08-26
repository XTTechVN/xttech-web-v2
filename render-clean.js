const sharp = require('sharp');
const fs = require('fs');

const svg = fs.readFileSync('C:/Users/linhb/.gemini/antigravity-ide/brain/0b2cfed2-339c-4e0b-a1b8-f5e9b819f41f/scratch/logo_real_clean.svg');

sharp(svg).resize(300, 300).png().toFile('C:/Users/linhb/.gemini/antigravity-ide/brain/0b2cfed2-339c-4e0b-a1b8-f5e9b819f41f/scratch/preview_clean.png')
.then(() => console.log('CLEAN_PREVIEW_GENERATED'));

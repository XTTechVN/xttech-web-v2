const sharp = require('sharp');
const fs = require('fs');

const svg = fs.readFileSync('C:/Users/linhb/.gemini/antigravity-ide/brain/0b2cfed2-339c-4e0b-a1b8-f5e9b819f41f/scratch/logo_exact_traced.svg');

sharp(svg).resize(300, 300).png().toFile('C:/Users/linhb/.gemini/antigravity-ide/brain/0b2cfed2-339c-4e0b-a1b8-f5e9b819f41f/scratch/preview_traced.png')
.then(() => console.log('TRACED_PREVIEW_GENERATED'));

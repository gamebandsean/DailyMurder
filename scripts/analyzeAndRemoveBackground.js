const { Jimp } = require('jimp');
const path = require('path');

async function analyzeAndRemoveBackground() {
  const imagePath = path.join(__dirname, '../assets/characters/Body2.png');
  const outputPath = path.join(__dirname, '../assets/characters/Body2.png');
  
  try {
    const image = await Jimp.read(imagePath);
    
    // First, let's analyze the corners to find the background color
    const { width, height, data } = image.bitmap;
    
    // Sample corner pixels
    const corners = [
      { x: 0, y: 0 },
      { x: width - 1, y: 0 },
      { x: 0, y: height - 1 },
      { x: width - 1, y: height - 1 },
    ];
    
    console.log('Corner pixel colors:');
    corners.forEach(({ x, y }) => {
      const idx = (y * width + x) * 4;
      console.log(`  (${x}, ${y}): R=${data[idx]}, G=${data[idx+1]}, B=${data[idx+2]}, A=${data[idx+3]}`);
    });
    
    // Get background color from top-left corner
    const bgIdx = 0;
    const bgR = data[bgIdx];
    const bgG = data[bgIdx + 1];
    const bgB = data[bgIdx + 2];
    
    console.log(`\nDetected background color: R=${bgR}, G=${bgG}, B=${bgB}`);
    console.log('Removing pixels similar to this color...\n');
    
    let removedCount = 0;
    
    // Remove pixels that match or are close to the background color
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const red = data[idx];
        const green = data[idx + 1];
        const blue = data[idx + 2];
        
        // Calculate color distance from background
        const distance = Math.sqrt(
          Math.pow(red - bgR, 2) + 
          Math.pow(green - bgG, 2) + 
          Math.pow(blue - bgB, 2)
        );
        
        // If very close to background color (within threshold of 30), make transparent
        if (distance < 30) {
          data[idx + 3] = 0;
          removedCount++;
        }
      }
    }
    
    console.log(`Removed ${removedCount} pixels`);
    
    await image.write(outputPath);
    console.log('Successfully processed Body2.png');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

analyzeAndRemoveBackground();



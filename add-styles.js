const fs = require('fs');
const path = require('path');

// Run this script after the build process
console.log('Adding custom font styles to index.html...');

// Define the path to the built index.html
const indexPath = path.join(__dirname, 'web-build', 'index.html');

try {
  // Read the file
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // Define the font styles to inject
  const fontStyles = `
  <style>
    /* Font override styles */
    * {
      font-family: 'Poppins', sans-serif !important;
    }
    
    body {
      font-family: 'Poppins', sans-serif !important;
    }
    
    /* Override for app components */
    div, span, p, h1, h2, h3, h4, h5, h6, button, input, textarea {
      font-family: 'Poppins', sans-serif !important;
    }
  </style>
  `;
  
  // Insert the styles right before the closing </head> tag
  html = html.replace('</head>', `${fontStyles}</head>`);
  
  // Write the modified HTML back to the file
  fs.writeFileSync(indexPath, html);
  
  console.log('Custom styles added successfully!');
  
  // Copy favicon files
  const sourceDir = path.join(__dirname, 'assets', 'images');
  const destDir = path.join(__dirname, 'web-build');
  
  try {
    // Copy favicon.ico and favicon.png if they exist
    if (fs.existsSync(path.join(sourceDir, 'favicon.ico'))) {
      fs.copyFileSync(
        path.join(sourceDir, 'favicon.ico'),
        path.join(destDir, 'favicon.ico')
      );
      console.log('Copied favicon.ico to web-build directory');
    }
    
    if (fs.existsSync(path.join(sourceDir, 'favicon.png'))) {
      fs.copyFileSync(
        path.join(sourceDir, 'favicon.png'),
        path.join(destDir, 'favicon.png')
      );
      console.log('Copied favicon.png to web-build directory');
    }
  } catch (faviconErr) {
    console.error('Error copying favicon files:', faviconErr);
  }
} catch (err) {
  console.error('Error adding styles:', err);
} 
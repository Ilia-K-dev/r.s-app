const fs = require('fs');
const path = require('path');

function listDirectories(startPath, filter = null, depth = 0, maxDepth = 5) { // Increased maxDepth to 5
  if (!fs.existsSync(startPath)) {
    return [];
  }

  const files = fs.readdirSync(startPath);
  let output = [];

  for (let i = 0; i < files.length; i++) {
    const filename = path.join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    const isDirectory = stat.isDirectory();
    const isFile = stat.isFile();

    if (isDirectory) {
      if (!filter || filter(filename)) {
        output.push('│   '.repeat(depth) + (depth > 0 ? '├── ' : '') + files[i] + '/');
        if (depth < maxDepth) {
          const subDirs = listDirectories(filename, filter, depth + 1, maxDepth);
          output = output.concat(subDirs);
        }
      }
    } else if (isFile && depth >= 0 && (!filter || filter(filename))) { // Include files at root and deeper
       output.push('│   '.repeat(depth) + (depth > 0 ? '├── ' : '') + files[i]);
    }
  }

  return output;
}

// Example usage: listDirectories('.', (filename) => !filename.includes('node_modules'), 0, 5);
const directoryTree = listDirectories('.', (filename) => !filename.includes('node_modules'), 0, 5);
console.log(directoryTree.join('\n'));

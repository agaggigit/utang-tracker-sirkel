const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src', function(filePath) {
    if (filePath.endsWith('.ts') && !filePath.includes('errorHandler.ts') && !filePath.includes('index.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find the outermost try block and remove it
        // A simple way is to use regex, assuming standard formatting:
        // try { ... } catch (error) { ... }
        
        // This regex looks for 'try {' then everything inside lazily until '} catch'
        // and then matches the catch block which ends with '});\n    }' or similar.
        
        const tryCatchRegex = /try\s*\{([\s\S]*?)\}\s*catch\s*\([^\)]*\)\s*\{[\s\S]*?res\.status\(500\)[\s\S]*?\}/g;
        
        let newContent = content.replace(tryCatchRegex, (match, tryBody) => {
            // we remove one level of indentation for the tryBody
            return tryBody.split('\n').map(line => {
                if (line.startsWith('    ')) return line.substring(4);
                return line;
            }).join('\n').trim();
        });

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Refactored:', filePath);
        }
    }
});

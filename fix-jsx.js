import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('src/app', (filePath) => {
    if (filePath.endsWith('page.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let fixed = content.replace(/ disabled=""/gi, ' disabled')
                           .replace(/ checked=""/gi, ' checked')
                           .replace(/ required=""/gi, ' required')
                           .replace(/ readonly=""/gi, ' readOnly')
                           .replace(/ autofocus=""/gi, ' autoFocus')
                           .replace(/ selected=""/gi, ' selected')
                           .replace(/ stroke-opacity/gi, ' strokeOpacity')
                           .replace(/ fill-opacity/gi, ' fillOpacity')
                           .replace(/ allowfullscreen=""/gi, ' allowFullScreen')
                           .replace(/ maxlength="(\d+)"/gi, ' maxLength={$1}')
                           .replace(/ tabindex/gi, ' tabIndex');

        fixed = fixed.replace(/style='([^']*)'/gi, (match, val) => {
            if(!val.trim()) return `style={{}}`;
            const styleObj = val.split(';').filter(Boolean).map(s => {
                const parts = s.split(':');
                if(parts.length < 2) return '';
                const key = parts[0].trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
                return `"${key}": "${parts.slice(1).join(':').trim().replace(/"/g, "'")}"`;
            }).filter(Boolean).join(', ');
            return `style={{${styleObj}}}`;
        });
                           
        if (content !== fixed) {
            fs.writeFileSync(filePath, fixed);
            console.log(`Fixed boolean props in ${filePath}`);
        }
    }
});

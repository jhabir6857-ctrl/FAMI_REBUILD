/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const files = walkSync('src/app/admin');
files.filter(f => f.endsWith('.tsx')).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('<table className="w-full text-sm">') && !content.includes('<div className="overflow-x-auto">\\n            <table className="w-full text-sm">')) {
    content = content.replace(/(<table className="w-full text-sm">[\s\S]*?<\/table>)/g, '<div className="overflow-x-auto">\n            $1\n          </div>');
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});

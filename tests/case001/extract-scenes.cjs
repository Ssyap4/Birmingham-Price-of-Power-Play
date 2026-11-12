const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const source=fs.readFileSync(path.join(root,'case-v14.js'),'utf8');
const literal=source.split('const scenes=')[1].split('\nconst items=')[0].trim().replace(/;$/,'');
process.stdout.write(JSON.stringify(vm.runInNewContext('('+literal+')')));

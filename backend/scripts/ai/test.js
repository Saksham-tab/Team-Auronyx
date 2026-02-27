const cp = require('child_process');
const data = { "moisture": 45, "temperature": 28, "humidity": 60 };
const res = cp.spawnSync('python', ['c:/Users/ms/Desktop/SSH2026/backend/scripts/ai/yield_prediction.py', JSON.stringify(data)]);
console.log('STDOUT:', res.stdout.toString());
console.log('STDERR:', res.stderr.toString());

const fs = require('fs');

const vert = fs.readFileSync('./shaders/default/vert.glsl');
const frag = fs.readFileSync('./shaders/default/frag.glsl');

const buff = Buffer.from(vert.toString('ascii') +'\0' + frag.toString('ascii'))


fs.writeFileSync('./static/cdn/shaders/default.shader', buff);
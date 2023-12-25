
const ShaderTypes = {
	VERTEX:   'vertex',
	FRAGMENT: 'fragment'
};

const canvas = document.createElement('canvas');
const gl     = canvas.getContext('webgl2');

canvas.width  = 600;
canvas.height = 600;


function CreateShader(shaderUrl) {
	return Shader.fromURL(shaderUrl);
}

function ShaderSource(s) {
	this.src = s;
}

function ShaderPack(v, s) {
	this.fragment = new ShaderSource(v);
	this.vertex = new ShaderSource(s);
}

function Shader(vshader, fshader) {
	this.vshader = vshader;
	this.fshader = fshader;
	this.program = null;
}



Shader.prototype = {
	CompileProgram() {
		if (!this.vshader || !this.fshader)
			return;

		if (this.program)
			gl.deleteProgram(this.program);

		const vertexShader   = CreateGLShader(this.vshader, gl.VERTEX_SHADER);
		const fragmentShader = CreateGLShader(this.fshader, gl.FRAGMENT_SHADER);
	
		if (!vertexShader || !fragmentShader)
			return;

		gl.compileShader(vertexShader);
		gl.compileShader(fragmentShader);


		if (LogShaderCompilationStatus([
			new ShaderWrapper(vertexShader, ShaderTypes.VERTEX), 
			new ShaderWrapper(fragmentShader, ShaderTypes.FRAGMENT)
		]))
			return;
		

		this.program = gl.createProgram();

		
		// Attach pre-existing shaders
		gl.attachShader(this.program, vertexShader);
		gl.attachShader(this.program, fragmentShader);

		gl.linkProgram(this.program);

		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			const info = gl.getProgramInfoLog(this.program);
			console.error(`Could not compile WebGL program. \n\n${info}`);
		}

		gl.deleteShader(this.vertexShader);
		gl.deleteShader(this.fragmentShader);
	},

	OnShaderLoaded(sp) {
		this.vshader = sp.vertex.src;
		this.fshader = sp.fragment.src;
		this.CompileProgram();
		console.log('program compiled!');
	},

	use() {
		gl.useProgram(this.program);
	}
};


Shader.fromURL = (url) => {
	const s = new Shader(null, null);


	const req = new XMLHttpRequest();
	req.open("GET", url, true);
	req.responseType = "arraybuffer";

	req.onload = (event) => {
		const arrayBuffer = req.response;
		if (arrayBuffer) {
			const byteArray = new Uint8Array(arrayBuffer);
			const sources = [
				new String(),
				new String()
			];

			const shaderPack = new ShaderPack(null, null);

			let ind = 0;

			byteArray.forEach((element, index) => {
				if (element == 0) {
					ind++;
					return;
				}

				if (ind > sources.length)
					return;

				sources[ind] += String.fromCharCode(element);
			});

			shaderPack.vertex.src   = sources[0];
			shaderPack.fragment.src = sources[1];

			s.OnShaderLoaded(shaderPack);
		}
	};

	req.send(null);

	return s;
};

function CreateGLShader(src, stype) {
	const s = gl.createShader(stype);
	gl.shaderSource(s, src);
	return s;
}

function LogShaderCompilationStatus(shaders) {
	let result = false;
	for (const s of shaders) {
		if (!ShaderCompiledOk(s.shader)) {
			console.error(`Error during compilation of shader ${s.type}: ${gl.getShaderInfoLog(s.shader)}`);	
			result = true;
		}
	}
	return result;
}

function ShaderCompiledOk(s) {
	return gl.getShaderParameter(s, gl.COMPILE_STATUS);
}

function ShaderWrapper(s, t) {
	this.shader = s;
	this.type 	= t;
}

const shader = CreateShader("/cdn/shaders/default.shader");
console.log(shader);

gl.clearColor(.4, 0.2, .1, 1.0);

gl.enable(gl.DEPTH_TEST);

const vertices = [
  	 -.5, -.5, 0,
	.5, -.5, 0,
	.5, .5, 0,
	-.5, .5, 0
];

const indices = [
	0, 1, 2,
	0, 1, 2,
	2, 3, 0
];

const VAO = gl.createVertexArray();
const VBO = gl.createBuffer();
const EBO = gl.createBuffer();

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

gl.bindVertexArray(VAO);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
gl.enableVertexAttribArray(0),
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

gl.viewport(0, 0, canvas.width, canvas.height);

function loop() {
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	shader.use();

	gl.bindVertexArray(VAO);
	gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

	requestAnimationFrame(loop);
}

requestAnimationFrame(loop);


document.body.appendChild(canvas);
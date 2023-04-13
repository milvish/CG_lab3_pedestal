var gl;

const fragmentShaderText =

    [
        '#version 300 es',
        '#ifdef GL_ES',
        'precision highp float;',
        '#endif',
        'uniform vec4 fColor;',
        'out vec4 fragColor;',
        'void main(void) {',
        '    fragColor = fColor;',
        '}',
    ].join('\n');

const vertexShaderText =
    [
        '#version 300 es',
        'in vec3 aVertexPosition;',
        'uniform mat4 mWorld;',
        'uniform mat4 mView;',
        'uniform mat4 mProj;',
        'out vec3 vPosition;',
        'void main() {',
        '    gl_Position = mProj * mView * mWorld * vec4(aVertexPosition, 1.0);',
        '    vPosition = aVertexPosition;',
        '}',
    ].join('\n');

function buttonsInfo(){
    var text = document.getElementById('text');
    var tex = text.getContext('2d')
    tex.font = "30px Arial"
    tex.fillStyle = "#ff0088"
    tex.fillText("Q - pink, W - orange, E - blue, R - green, T - pedestal, Y - scene",40,40)
}

function initWebGL(canvas) {
    gl = null;
    try {
        gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimentalwebgl");
    } catch(e) {}
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        gl = null;
    }
    return gl;
}

function initProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function main() {
    buttonsInfo()
    var canvas = document.getElementById('pedestal');
    if (!canvas) {
        console.log('failed to find canvas');
        return;
    }

    gl = initWebGL(canvas);

    if (gl) {
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.1, 0.11, 0.13, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    }

    const program = initProgram(gl, vertexShaderText, fragmentShaderText);
    gl.useProgram(program);
    window.addEventListener("keydown", keyControls);

    function render() {
        if(program) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.clearDepth(1.0);

            drawCube(program, pinkCube, [-20.0, 1.4, 0.0],[1.0, 0.0, 0.92, 1.0], current.get('pink').angle);
            drawCube(program, orangeCube,[-14.0, 2.4, 0.0],[0.9, 0.6, 0.34, 1.0], current.get('orange').angle);
            drawCube(program, blueCube, [-8.0, 1.8, 0.0],[0.02, 0.61, 0.89, 1.0], current.get('blue').angle);
            drawCube(program, lightGreenCube,[-4.0, 1, 0.0],[0.0, 0.78, 0.68, 1.0], current.get('light_green').angle);
        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}




//region CreateCubeVertices
var boxVertices =
    [
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, // Front
        -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, // Back
        -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, // Top
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // Bottom
        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, // Right
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, // Left
    ];


function createCubeVertices (x){
    var newCV = Object.assign([],boxVertices);
    for (let i=0; i<newCV.length; i++){
        newCV[i] = boxVertices[i]*x
    }
    return newCV
}
var pinkCube = createCubeVertices(1.4)
var blueCube = createCubeVertices(1.8)
var orangeCube = createCubeVertices(2.4)
var lightGreenCube = createCubeVertices(1)

//endregion


function drawCube(program, cube, position, color, angleRotation) {
    const vertices = cube

    let cubeVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
    const mProj = gl.getUniformLocation(program, "mProj");
    const mView = gl.getUniformLocation(program, "mView");
    const mWorld = gl.getUniformLocation(program, "mWorld");
    const fColor = gl.getUniformLocation(program, "fColor");

    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPositionAttribute);

    const projectionMatrix = glMatrix.mat4.create();
    const viewMatrix = glMatrix.mat4.create();
    const worldMatrix = glMatrix.mat4.create();

    glMatrix.mat4.perspective(projectionMatrix, (60 * Math.PI) / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);

    glMatrix.mat4.translate(worldMatrix, worldMatrix, [0.0, 0.0, 0.0]);
    glMatrix.mat4.rotate(worldMatrix, worldMatrix, current.get('scene').angle, [0, 1, 0]);


    glMatrix.mat4.translate(worldMatrix, worldMatrix, [-14, 0.0, 0.0]);
    glMatrix.mat4.rotate(worldMatrix, worldMatrix, current.get('pedestal').angle, [0, 1, 0]);
    glMatrix.mat4.translate(worldMatrix, worldMatrix, [12.2, 0.0, 0.0]);

    glMatrix.mat4.translate(worldMatrix, worldMatrix, position);
    glMatrix.mat4.rotate(worldMatrix, worldMatrix, angleRotation, [0, 1, 0]);



    glMatrix.mat4.lookAt(viewMatrix, [0.0, 2.0, -40], [0,0,0],[0,1,0])
    gl.uniform4f(fColor, color[0], color[1], color[2], color[3]);
    gl.uniformMatrix4fv(mProj, false, projectionMatrix);
    gl.uniformMatrix4fv(mView, false, viewMatrix);
    gl.uniformMatrix4fv(mWorld, false, worldMatrix);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 36);
}


//region KeyControls

var current = new Map([
    ['pink', {'angle': 0.0}],
    ['orange', {'angle': 0.0}],
    ['blue', {'angle': 0.0}],
    ['light_green', {'angle': 0.0}],
    ['pedestal', {'angle': 0.0}],
    ['scene', {'angle': 0.0}]
]);
var op = 'pink'
var _angle
function keyControls(e){
    //Q - pink 81
    if (e.keyCode == "81") {
        op = 'pink';
        console.log(op)
    }
    //W - orange
    if (e.keyCode == "87") {
        op = 'orange'
        console.log(op)

    }

    //E - blue
    if (e.keyCode == "69") {
        op = 'blue'
        console.log(op)
        //tex.strokeText("light_green", 10, 50)
    }

    //R - light_green
    if (e.keyCode == "82") {
        op = 'light_green'
        console.log(op)
        //tex.strokeText("pedestal", 10, 50)
    }

    //T 'pedestal'
    if (e.keyCode == "84") {
        op = 'pedestal'
        console.log(op);
        //tex.strokeText("scene", 10, 50)
    }

    //Y - scene
    if(e.keyCode =='89')
    {
        op ='scene'
        console.log(op);
    }


    // ->
    if (e.keyCode == "37") {
        console.log(current)
        _angle = current.get(op).angle
        current.set(op, {'angle':_angle-0.04});
    }
    // <-
    if (e.keyCode == "39") {
        console.log(current)
        _angle = current.get(op).angle
        current.set(op, {'angle':_angle+0.04});
    }

}
//endregion

console.log("Script is running")

let canvas = document.getElementById("pedestal");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;



initWebGl(canvas);
console.log(gl)


let model = loadJSON('src/models/wooden_sphere.json')

let modelVertices = model.meshes[0].vertices;
let modelIndices = [].concat.apply([], model.meshes[0].faces);
let modelTexCoords = model.meshes[0].texturecoords[0];
let nodelNormal = model.meshes[0].normals;

console.log(modelVertices, modelIndices, nodelNormal)

let imgSRC = "src/textures/bump9.jpg";
let texture = gl.createTexture();
let image = new Image();
image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
}
image.src = imgSRC;


//
//  Set buffer data to attributes
//
let shaderProgram = initShaderProgram(gl, vsSource, fsSource)
gl.useProgram(shaderProgram)

initBuffer(gl, modelVertices, gl.ARRAY_BUFFER, Float32Array);
initBuffer(gl, modelIndices, gl.ELEMENT_ARRAY_BUFFER, Uint16Array);

let positionAttribLocationCube = enableVertexAttrib(
    shaderProgram,
    "vertPositions",
    3, 3, 0);
gl.enableVertexAttribArray(positionAttribLocationCube);


initBuffer(gl, nodelNormal, gl.ARRAY_BUFFER, Float32Array);

let normalAttribLocationCube = enableVertexAttrib(
    shaderProgram,
    "vertNormal",
    3, 3, 0);
gl.enableVertexAttribArray(normalAttribLocationCube);

initBuffer(gl, modelTexCoords, gl.ARRAY_BUFFER, Float32Array);

let textureAttribLocationCube = enableVertexAttrib(
    shaderProgram,
    "vertTexCoords",
    2, 2, 0);
gl.enableVertexAttribArray(textureAttribLocationCube);


//--------------------------WORLD--VIEW--PROJECTION--MATRIСES-------------------------------

let normalMatrix;
let worldMatrixCube = new Float32Array(16);
let viewMatrixCube = new Float32Array(16);
let projMatrixCube = new Float32Array(16);

glMatrix.mat4.identity(worldMatrixCube)
glMatrix.mat4.translate(worldMatrixCube, worldMatrixCube, [0.0, -3.0, 0.0])
glMatrix.mat4.lookAt(viewMatrixCube, [0, 0, -20], [0, 0, 0], [0, 1, 0]);
glMatrix.mat4.scale(worldMatrixCube, worldMatrixCube, [1.0, 1.0, 1.0])
glMatrix.mat4.perspective(projMatrixCube, getRadAngle(45), canvas.width / canvas.height, 0.1, 1000.0);
normalMatrix = getNormalMatrix(worldMatrixCube);

let matWorldLocationCube = gl.getUniformLocation(shaderProgram, "mWorld");
let matViewLocationCube = gl.getUniformLocation(shaderProgram, "mView");
let matProjLocationCube = gl.getUniformLocation(shaderProgram, "mProj");
let normalmatrixLocation = gl.getUniformLocation(shaderProgram, "u_normalMatrix");

gl.uniformMatrix4fv(matWorldLocationCube, false, worldMatrixCube);
gl.uniformMatrix4fv(matViewLocationCube, false, viewMatrixCube);
gl.uniformMatrix4fv(matProjLocationCube, false, projMatrixCube);
gl.uniformMatrix4fv(normalmatrixLocation, false, normalMatrix);

//---------------------------SOURCE--SETTINGS-----------------------------------------------

let viewDirection = glMatrix.vec3.create();
let sourceDirection = glMatrix.vec3.create();
let sourceDiffuseColor = glMatrix.vec3.create();
let sourceSpecularColor = glMatrix.vec3.create();

glMatrix.vec3.transformMat4(viewDirection, viewDirection, viewMatrixCube);
glMatrix.vec3.set(sourceDirection,-50.0,15.0,-50.0);
glMatrix.vec3.set(sourceDiffuseColor, 1.0, 1.0, 1.0);
glMatrix.vec3.set(sourceSpecularColor, 1.0, 1.0, 1.0);

let viewDirectionLocation = gl.getUniformLocation(shaderProgram, "u_viewDirection");
let sourceDirectionLocation = gl.getUniformLocation(shaderProgram, "u_sourceDirection");
let sourceDiffuseColorLocation = gl.getUniformLocation(shaderProgram, "u_sourceDiffuseColor");
let sourceSpecularColorLocation = gl.getUniformLocation(shaderProgram, "u_sourceSpecularColor");

gl.uniform3fv(viewDirectionLocation, viewDirection);
gl.uniform3fv(sourceDirectionLocation, sourceDirection);
gl.uniform3fv(sourceDiffuseColorLocation, sourceDiffuseColor);
gl.uniform3fv(sourceSpecularColorLocation, sourceSpecularColor);


//---------------------------COLOR--SETTINGS------------------------------------------------

let coefColor = 1.0;
let coefColorLocation = gl.getUniformLocation(shaderProgram, "u_coefColor");
gl.uniform1f(coefColorLocation, coefColor);

let shininess = 9;
let cubeColor = glMatrix.vec3.create();

let ambientColor = glMatrix.vec3.fromValues(0.3, 0.3, 0.3);

let cubeColorLocation = gl.getUniformLocation(shaderProgram, "cubeColor");
let shininessLocation = gl.getUniformLocation(shaderProgram, "u_shininess");
let ambientColorLocation = gl.getUniformLocation(shaderProgram, "u_sourceAmbientColor");

gl.uniform1f(shininessLocation, shininess);
gl.uniform3fv(cubeColorLocation,  [1.0, 0.35, 0.1]);
gl.uniform3fv(ambientColorLocation, ambientColor);


shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "u_sampler");
gl.uniform1i(shaderProgram.samplerUniform, 0);

let sourceStep = 5.0

document.addEventListener('keydown', (event) => {
    let name = event.key;
    if (name == "[")
    {
        glMatrix.vec3.set(sourceDirection, sourceDirection[0] + sourceStep, sourceDirection[1], sourceDirection[2]);
        gl.uniform3fv(sourceDirectionLocation, sourceDirection);

        console.log(sourceDirection[0], sourceDirection[1], sourceDirection[2])
    }
    if (name == "]")
    {
        glMatrix.vec3.set(sourceDirection, sourceDirection[0] - sourceStep, sourceDirection[1], sourceDirection[2]);
        gl.uniform3fv(sourceDirectionLocation, sourceDirection);

        console.log(sourceDirection[0], sourceDirection[1], sourceDirection[2])
    }
    if (name == ";")
    {
        glMatrix.vec3.set(sourceDirection, sourceDirection[0], sourceDirection[1] + sourceStep, sourceDirection[2]);
        gl.uniform3fv(sourceDirectionLocation, sourceDirection);

        console.log(sourceDirection[0], sourceDirection[1], sourceDirection[2])
    }
    if (name == "'")
    {
        glMatrix.vec3.set(sourceDirection, sourceDirection[0], sourceDirection[1] - sourceStep, sourceDirection[2]);
        gl.uniform3fv(sourceDirectionLocation, sourceDirection);

        console.log(sourceDirection[0], sourceDirection[1], sourceDirection[2])
    }
    if (name == ".")
    {
        glMatrix.vec3.set(sourceDirection, sourceDirection[0], sourceDirection[1], sourceDirection[2] + sourceStep);
        gl.uniform3fv(sourceDirectionLocation, sourceDirection);

        console.log(sourceDirection[0], sourceDirection[1], sourceDirection[2])
    }
    if (name == "/")
    {
        glMatrix.vec3.set(sourceDirection, sourceDirection[0], sourceDirection[1], sourceDirection[2] - sourceStep);
        gl.uniform3fv(sourceDirectionLocation, sourceDirection);

        console.log(sourceDirection[0], sourceDirection[1], sourceDirection[2])
    }
}, false);

let loop = () =>

{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.drawElements(gl.TRIANGLES, modelIndices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

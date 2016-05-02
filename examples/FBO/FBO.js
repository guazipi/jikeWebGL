var gl;//WebGLRenderingContext
var cubeVBO;//Cube buffer ID
var sphereVBO;//球体VBO
var sphereEBO;//球体EBO
var cubeTexID;//立方体纹理ID
var fboBuffer;//桢缓存对象
var glCubeProgram;//立方体着色器应用
var glSphereProgram;//球体着色器应用

var fboWidth = 512;//桢缓存绑定纹理宽度
var fboHeight = 512;//桢缓存绑定纹理高度
var targets;//立方体贴图六个方向

var pMatrix = mat4.create();//透视矩阵
var vMatrix = mat4.create();//视图矩阵
var eyePos = vec3.fromValues(0.0, 1.0, 0.0);//眼睛位置
var eyeLookat = vec3.fromValues(0.0, -0.0, 0.0);//眼睛方向
var spherePos = vec3.fromValues(0.0, -0.0, 0.0);//球体位置
var canvanName;

function webGLStart(cName) {
    canvanName = cName;
    InitWebGL();
    InitCubeShader();
    InitSphereShader();
    InitCubeBuffer();
    InitSphereBuffer();
    InitFBOCube();
    //RenderFBO();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    tick();
}

function InitWebGL() {
    //var canvas = document.getElementById(canvanName);
    InitGL(canvanName);
}

function InitGL(canvas) {
    try {
        //WebGLRenderingContext 
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

        targets = [gl.TEXTURE_CUBE_MAP_POSITIVE_X,
                     gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
                     gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
                     gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                     gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                     gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];
    } catch (e) { }
    if (!gl) { alert("你的浏览器不支持WebGL"); }
}

//http://msdn.microsoft.com/zh-TW/library/ie/dn302360(v=vs.85)
function GetShader(id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) { return null; }
    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }
    //WebGLShader
    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else { return null; }
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("compile" + gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function InitFBOCube() {
    // WebGLFramebuffer
    fboBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboBuffer);
    fboBuffer.width = 512;
    fboBuffer.height = 512;

    cubeTexID = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexID);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    for (var i = 0; i < targets.length; i++) {
        gl.texImage2D(targets[i], 0, gl.RGBA, fboBuffer.width, fboBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function RenderFBO() {
    gl.disable(gl.DEPTH_TEST);
    gl.viewport(0, 0, fboBuffer.width, fboBuffer.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fboBuffer);
    for (var i = 0; i < targets.length; i++) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, targets[i], cubeTexID, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    mat4.perspective(pMatrix, 45, fboBuffer.width / fboBuffer.height, 0.1, 100.0);
    for (var i = 0; i < targets.length; i++) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, targets[i], cubeTexID, null);
        var lookat = vec3.create();
        var up = vec3.create();
        up[1] = 1.0;
        if (i == 0) {
            lookat[0] = -1.0;
        } else if (i == 1) {
            lookat[0] = 1.0;            
        } else if (i == 2) {
            lookat[1] = -1.0;
            up[0] = 1.0;
        } else if (i == 3) {
            lookat[1] = 1.0;
            up[0] = 1.0;
        } else if (i == 4) {
            lookat[2] == -1.0;            
        } else if (i == 5) {
            lookat[2] = 1.0;            
        } else {         
        }
        //vec3.fromValues(0.0, 0.0, 0.0)
        vMatrix = mat4.create();
        mat4.lookAt(vMatrix, vec3.fromValues(0.0, 0.0, 0.0), lookat, up);
        //mat4.scale(vMatrix, vMatrix, vec3.fromValues(-1.0, -1.0, -1.0));
        //mat4.translate(vMatrix, vMatrix, spherePos);        
        RenderCube();
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.enable(gl.DEPTH_TEST);
}


function InitCubeShader() {
    //WebGLShader
    var shader_vertex = GetShader("cubeshader-vs");
    var shader_fragment = GetShader("cubeshader-fs");
    //WebglCubeProgram
    glCubeProgram = gl.createProgram();
    gl.attachShader(glCubeProgram, shader_vertex);
    gl.attachShader(glCubeProgram, shader_fragment);
    gl.linkProgram(glCubeProgram);
    if (!gl.getProgramParameter(glCubeProgram, gl.LINK_STATUS)) {
        alert("Shader hava error.");
    }
    gl.useProgram(glCubeProgram);
    glCubeProgram.positionAttribute = gl.getAttribLocation(glCubeProgram, "a_position");
    glCubeProgram.normalAttribute = gl.getAttribLocation(glCubeProgram, "a_normal");
    glCubeProgram.texCoordAttribute = gl.getAttribLocation(glCubeProgram, "a_texCoord");

    glCubeProgram.view = gl.getUniformLocation(glCubeProgram, "view");
    glCubeProgram.perspective = gl.getUniformLocation(glCubeProgram, "perspective");
}

function InitCubeBuffer() {
    var cubeData = [
            -10.0, -10.0, -10.0, 0.0, 0.0, -10.0, 1.0, 0.0,
            -10.0, 10.0, -10.0, 0.0, 0.0, -10.0, 1.0, 1.0,
            10.0, 10.0, -10.0, 0.0, 0.0, -10.0, 0.0, 1.0,

            10.0, 10.0, -10.0, 0.0, 0.0, -10.0, 0.0, 1.0,
            10.0, -10.0, -10.0, 0.0, 0.0, -10.0, 0.0, 0.0,
            -10.0, -10.0, -10.0, 0.0, 0.0, -10.0, 1.0, 0.0,

            -10.0, -10.0, 10.0, 0.0, 0.0, 10.0, 0.0, 0.0,
            10.0, -10.0, 10.0, 0.0, 0.0, 10.0, 1.0, 0.0,
            10.0, 10.0, 10.0, 0.0, 0.0, 10.0, 1.0, 1.0,

            10.0, 10.0, 10.0, 0.0, 0.0, 10.0, 1.0, 1.0,
            -10.0, 10.0, 10.0, 0.0, 0.0, 10.0, 0.0, 1.0,
            -10.0, -10.0, 10.0, 0.0, 0.0, 10.0, 0.0, 0.0,

            -10.0, -10.0, -10.0, 0.0, -10.0, 0.0, 0.0, 0.0,
            10.0, -10.0, -10.0, 0.0, -10.0, 0.0, 1.0, 0.0,
            10.0, -10.0, 10.0, 0.0, -10.0, 0.0, 1.0, 1.0,

            10.0, -10.0, 10.0, 0.0, -10.0, 0.0, 1.0, 1.0,
            -10.0, -10.0, 10.0, 0.0, -10.0, 0.0, 0.0, 1.0,
            -10.0, -10.0, -10.0, 0.0, -10.0, 0.0, 0.0, 0.0,

            10.0, -10.0, -10.0, 10.0, 0.0, 0.0, 0.0, 0.0,
            10.0, 10.0, -10.0, 10.0, 0.0, 0.0, 1.0, 0.0,
            10.0, 10.0, 10.0, 10.0, 0.0, 0.0, 1.0, 1.0,

            10.0, 10.0, 10.0, 10.0, 0.0, 0.0, 1.0, 1.0,
            10.0, -10.0, 10.0, 10.0, 0.0, 0.0, 0.0, 1.0,
            10.0, -10.0, -10.0, 10.0, 0.0, 0.0, 0.0, 0.0,

            10.0, 10.0, -10.0, 0.0, 10.0, 0.0, 0.0, 0.0,
            -10.0, 10.0, -10.0, 0.0, 10.0, 0.0, 1.0, 0.0,
            -10.0, 10.0, 10.0, 0.0, 10.0, 0.0, 1.0, 1.0,

            -10.0, 10.0, 10.0, 0.0, 10.0, 0.0, 1.0, 1.0,
            10.0, 10.0, 10.0, 0.0, 10.0, 0.0, 0.0, 1.0,
            10.0, 10.0, -10.0, 0.0, 10.0, 0.0, 0.0, 0.0,

            -10.0, 10.0, -10.0, -10.0, 0.0, 0.0, 0.0, 0.0,
            -10.0, -10.0, -10.0, -10.0, 0.0, 0.0, 1.0, 0.0,
            -10.0, -10.0, 10.0, -10.0, 0.0, 0.0, 1.0, 1.0,

            -10.0, -10.0, 10.0, -10.0, 0.0, 0.0, 1.0, 1.0,
            -10.0, 10.0, 10.0, -10.0, 0.0, 0.0, 0.0, 1.0,
            -10.0, 10.0, -10.0, -10.0, 0.0, 0.0, 0.0, 0.0,
    ];
    cubeVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeData), gl.STATIC_DRAW);
}

function RenderCube() {
    gl.useProgram(glCubeProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVBO);

    gl.vertexAttribPointer(glCubeProgram.positionAttribute, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(glCubeProgram.positionAttribute);

    gl.vertexAttribPointer(glCubeProgram.normalAttribute, 3, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(glCubeProgram.normalAttribute);

    gl.vertexAttribPointer(glCubeProgram.texCoordAttribute, 2, gl.FLOAT, false, 32, 24);
    gl.enableVertexAttribArray(glCubeProgram.texCoordAttribute);

    gl.uniformMatrix4fv(glCubeProgram.view, false, vMatrix);
    gl.uniformMatrix4fv(glCubeProgram.perspective, false, pMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, 36);
}


function InitSphereShader() {
    //WebGLShader
    var shader_vertex = GetShader("sphereshader-vs");
    var shader_fragment = GetShader("sphereshader-fs");
    //WebglCubeProgram
    glSphereProgram = gl.createProgram();
    gl.attachShader(glSphereProgram, shader_vertex);
    gl.attachShader(glSphereProgram, shader_fragment);
    gl.linkProgram(glSphereProgram);
    if (!gl.getProgramParameter(glSphereProgram, gl.LINK_STATUS)) {
        alert("Shader hava error.");
    }
    glSphereProgram.positionAttribute = gl.getAttribLocation(glSphereProgram, "a_position");
    glSphereProgram.normalAttribute = gl.getAttribLocation(glSphereProgram, "a_normal");

    glSphereProgram.eye = gl.getUniformLocation(glSphereProgram, "eye");
    glSphereProgram.mapCube = gl.getUniformLocation(glSphereProgram, "mapCube");

    glSphereProgram.model = gl.getUniformLocation(glSphereProgram, "model");
    glSphereProgram.view = gl.getUniformLocation(glSphereProgram, "view");
    glSphereProgram.perspective = gl.getUniformLocation(glSphereProgram, "perspective");
}

function InitSphereBuffer() {
    var radius = 1;
    var segments = 16;
    var rings = 16;
    var length = segments * rings * 6;
    var sphereData = new Array();
    var sphereIndex = new Array();
    for (var y = 0; y < rings; y++) {
        var phi = (y / (rings - 1)) * Math.PI;
        for (var x = 0; x < segments; x++) {
            var theta = (x / (segments - 1)) * 2 * Math.PI;
            sphereData.push(radius * Math.sin(phi) * Math.cos(theta));
            sphereData.push(radius * Math.cos(phi));
            sphereData.push(radius * Math.sin(phi) * Math.sin(theta));
            sphereData.push(Math.sin(phi) * Math.cos(theta));
            sphereData.push(radius * Math.cos(phi))
            sphereData.push(Math.sin(phi) * Math.sin(theta));
        }
    }
    for (var y = 0; y < rings - 1; y++) {
        for (var x = 0; x < segments - 1; x++) {
            sphereIndex.push((y + 0) * segments + x);
            sphereIndex.push((y + 1) * segments + x);
            sphereIndex.push((y + 1) * segments + x + 1);

            sphereIndex.push((y + 1) * segments + x + 1);
            sphereIndex.push((y + 0) * segments + x + 1)
            sphereIndex.push((y + 0) * segments + x);
        }
    }
    sphereVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereData), gl.STATIC_DRAW);
    sphereVBO.numItems = segments * rings;
    sphereEBO = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereEBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndex), gl.STATIC_DRAW);
    sphereEBO.numItems = sphereIndex.length;
}

function RenderSphere() {
    gl.useProgram(glSphereProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVBO);

    gl.vertexAttribPointer(glSphereProgram.positionAttribute, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(glSphereProgram.positionAttribute);

    gl.vertexAttribPointer(glSphereProgram.normalAttribute, 3, gl.FLOAT, false, 24, 12);
    gl.enableVertexAttribArray(glSphereProgram.normalAttribute);

    var mMatrix = mat4.create();
    mat4.translate(mMatrix, mMatrix, spherePos);
    gl.uniform3f(glSphereProgram.eye, eyePos[0],eyePos[1],eyePos[2]);
    gl.uniformMatrix4fv(glSphereProgram.model, false, mMatrix);
    gl.uniformMatrix4fv(glSphereProgram.view, false, vMatrix);
    gl.uniformMatrix4fv(glSphereProgram.perspective, false, pMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeTexID);
    //gl.uniformMatrix4fv(glSphereProgram.mapCube, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereEBO);
    gl.drawElements(gl.TRIANGLES, sphereEBO.numItems, gl.UNSIGNED_SHORT, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
}


function OnDraw() {
    //fbo rander CUBE_MAP
    RenderFBO();
    //element rander
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);
    mat4.lookAt(vMatrix, eyePos, eyeLookat, vec3.fromValues(0.0, 1.0, 0.0));
    RenderCube();
    RenderSphere();
}

var lastTime = new Date().getTime();
function Update() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        //3000控制人眼的旋转速度。8控制人眼的远近
        eyePos[0] = Math.cos(elapsed / 3000) * 8;
        eyePos[2] = Math.sin(elapsed / 2000) * 8;

        spherePos[0] = Math.cos(elapsed / 4000) * 3;
        spherePos[2] = Math.cos(elapsed / 4000) * 3;
    }

}

function tick() {
    Update();
    OnDraw();
    setTimeout(function () { tick() }, 15);
}
//vector normal texcoord

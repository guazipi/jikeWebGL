/**
 * Created by chet on 16/4/18.
 */
function initShader(context, vertexShaderSource, fragmentShaderSource) {
    var cxt = context;
    var vertexShader = cxt.createShader(cxt.VERTEX_SHADER);
    var fragmentShader = cxt.createShader(cxt.FRAGMENT_SHADER);
    cxt.shaderSource(vertexShader, vertexShaderSource);
    cxt.shaderSource(fragmentShader, fragmentShaderSource);
    cxt.compileShader(vertexShader);
    cxt.compileShader(fragmentShader);
    if (!cxt.getShaderParameter(vertexShader, cxt.COMPILE_STATUS)) {
        alert("error:vertexShaderObject编译错误!");
        return;
    }
    if (!cxt.getShaderParameter(fragmentShader, cxt.COMPILE_STATUS)) {
        alert("error:fragmentShaderObject编译错误!");
        return;
    }

    var program = cxt.createProgram();
    cxt.attachShader(program, vertexShader);
    cxt.attachShader(program, fragmentShader);
    cxt.linkProgram(program);
    cxt.useProgram(program);

    return program;
}

function bindAttribute(cxt, attributeName, data, program) {
    var buffer = cxt.createBuffer();
    cxt.bindBuffer(cxt.ARRAY_BUFFER, buffer);
    cxt.bufferData(cxt.ARRAY_BUFFER, data, cxt.STATIC_DRAW);

    var posLocation = cxt.getAttribLocation(program, attributeName);
    cxt.vertexAttribPointer(posLocation, 2, cxt.FLOAT, false, 0, 0);
    cxt.enableVertexAttribArray(posLocation);
}
//矩阵相乘
function multiplyMatrix(matrixA, matrixB) {
    var result = new Float32Array(16);
    for (var i = 0; i < 4; i++) {
        result[i] = matrixA[i] * matrixB[0] + matrixA[i + 4] * matrixB[1] + matrixA[i + 8] * matrixB[3] + matrixA[i + 12] * matrixB[3];
        result[i + 4] = matrixA[i] * matrixB[4] + matrixA[i + 4] * matrixB[5] + matrixA[i + 8] * matrixB[6] + matrixA[i + 12] * matrixB[7];
        result[i + 8] = matrixA[i] * matrixB[8] + matrixA[i + 4] * matrixB[9] + matrixA[i + 8] * matrixB[10] + matrixA[i + 12] * matrixB[11];
        result[i + 12] = matrixA[i] * matrixB[12] + matrixA[i + 4] * matrixB[13] + matrixA[i + 8] * matrixB[14] + matrixA[i + 12] * matrixB[15];
    }
    return result;
}
//创建旋转矩阵
function createRotateMatrix(angle){
    var t=Math.PI*angle/180;
    var sinB=Math.sin(t);
    var cosB=Math.cos(t);
    return new Float32Array([
        cosB, sinB, 0.0, 0.0,
        -sinB, cosB, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
}
//创建缩放矩阵
function createScaleMatrix(sx,sy){
    return new Float32Array([
        sx, 0.0, 0.0, 0.0,
        0.0, sy, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

}
//创建平移矩阵
function createTranslateMatrix(tx,ty){
    return new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        tx, ty, 0.0, 1.0
    ]);
}
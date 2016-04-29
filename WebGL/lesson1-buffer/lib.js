/**
 * Created by chet on 16/4/18.
 */
function initShader(context,vertexShaderSource,fragmentShaderSource){
    var cxt=context;
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
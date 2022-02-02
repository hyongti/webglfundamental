function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  // console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function resizeCanvasToDisplaySize(canvas) {
  // 브라우저가 캔버스를 표시하고 있는 크기를 CSS 픽셀 단위로 얻어옵니다.
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // 캔버스와 크기가 다른지 확인합니다.
  const needResize =
    canvas.width !== displayWidth || canvas.height !== displayHeight;

  if (needResize) {
    // 캔버스를 동일한 크기가 되도록 합니다.
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}

const webglUtils = { createShader, createProgram, resizeCanvasToDisplaySize };

export default webglUtils;

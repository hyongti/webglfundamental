import webglUtils from "./webglUtils.js";

function main() {
  // Get A WebGL context
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // webGL 셰이더를 위한 소스
  var vertexShaderSource = `
    // x, y만 사용하므로 2차원 벡터로
    attribute vec2 a_position;
  
    // uniform을 추가해줬으므로, 68번, 110번 라인도 추가
    uniform vec2 u_resolution;
  
    void main() {
    // 위치를 픽셀에서 0.0과 1.0사이로 변환
    vec2 zeroToOne = a_position / u_resolution;

    // 0->1에서 0->2로 변환
    vec2 zeroToTwo = zeroToOne * 2.0;

    // 0->2에서 -1->+1로 변환 (클립 공간)
    vec2 clipSpace = zeroToTwo - 1.0;

    // 클립스페이스에서는 위가 + 아래가 - 인데 아래와 같이 vec2(1, -1)을 곱함으로써 전통적인 좌표계를 얻을 수 있음
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
    // vertexShaderSource를 위와 같이 바꿔서 이제 클립공간이 아닌 픽셀로 작업 가능
  `;
  var fragmentShaderSource = `
    // 프래그먼트 셰이더는 기본 정밀도를 가지고 있지 않으므로 하나를 선택해야 합니다.
    // "mediump"은 좋은 기본값으로 "중간 정밀도"를 의미합니다.
    precision mediump float;
    
    // 72번 라인 추가
    uniform vec4 u_color;

    void main() {
      // "gl_FragColor"는 프래그먼트 셰이더가 설정을 담당하는 특수 변수
      gl_FragColor = u_color;
    }
  `;

  // 셰이더를 만ㄷ름
  // create GLSL shaders, upload the GLSL source, compile the shaders
  var vertexShader = webglUtils.createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
  );
  var fragmentShader = webglUtils.createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  // 두 셰이더를 엮어서 프로그램을 만ㄷ름
  var program = webglUtils.createProgram(gl, vertexShader, fragmentShader);

  // 바로 위에서 생성한 프로그램의 속성 위치를 찾음
  // attribute vec4 a_position
  // 속성과 유니폼 위치를 찾는 것은 렌더링할 때가 아니라 초기화하는 동안 해야 함
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
  );
  var colorUniformLocation = gl.getUniformLocation(program, "u_color");

  // attribute는 버퍼에서 데이터를 가져오므로 버퍼를 생성함
  var positionBuffer = gl.createBuffer();

  // WebGL은 전역 바인드 포인트에 있는 많은 WebGL 리소스를 조작하게 해줍니다.
  // 바인드 포인트는 WebGL 안에 있는 내부 전역 변수라고 생각하면 됩니다.
  // 리소스를 바인드 포인트에 바인딩하면 모든 함수가 바인드 포인트를 통해 리소스를 참조합니다
  // 위에서 만든 positionBuffer를 ARRAY_BUFFER(바인드 포인트)에 바인드
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 이제 바인드포인트를 통해 해당 버퍼를 참조해서 데이터를 넣을 수 있음
  var positions = [10, 20, 80, 20, 10, 30, 10, 30, 80, 20, 80, 30];

  // webGL은 강력한 데이터 타입을 가지는 데이터가 필요하므로 Float32Array(positions)를 통해 부동 소수점 배열을 생성하고 값을 복사
  // gl.bufferData는 데이터를 GPU의 positionBuffer로 복사함(위에서 ARRAY_BUFFER 바인드포인트에 positionBuffer를 할당해서 가능)
  // gl.STATIC_DRAW는 데이터를 어떻게 사용할 것인지 webGL에게 알려줌. STATIC_DRAW는 데이터가 많이 바뀌지 않을 것 같다고 알려주는 것임.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // 여기까지가 초기화 코드

  // 아래부터가 렌더링 코드
  webglUtils.resizeCanvasToDisplaySize(gl.canvas); // 이건 캔버스를 화면 크기에 맞춰주는 함수

  // gl_Position으로 설정할 클립 공간 값을 어떻게 화면 공간으로 변환하는지 알려줌
  // 이는 [-1, 1] 클립 공간을 [0, gl.canvas.width]와 [0, gl.canvas.height]로 매핑
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // 캔버스 지우기
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 프로그램(셰이더 쌍)을 사용하라는 지시
  gl.useProgram(program);

  // 위에서 설정한 버퍼에서 데이터를 가져와 셰이더의 속성에 제공하는 방법을 WebGL에 알려줘야 함. 우선 속성을 활성화해야 함.
  gl.enableVertexAttribArray(positionAttributeLocation);
  // 해상도 설정
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  // 위치 버퍼 할당(위에서 해준 거 아닌가? -> 잘 모르겠음)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // positionBuffer(ARRAY_BUFFER)의 데이터를 꺼내오는 방법을 속성에 지시
  var size = 2; // 반복마다 2개의 컴포넌트
  var type = gl.FLOAT; // 데이터는 32비트 부동 소수점
  var normalize = false; // 데이터 정규화 안 함
  var stride = 0; // 0 = 다음 위치를 가져오기 위해 반복마다 size * sizeof(type) 만큼 앞으로 이동
  var offset = 0; // 버퍼의 처음부터 시작
  // 현재 바인딩된 ARRAY_BUFFER를 속성에 할당한다는 것. 이 속성은 이제 positionBuffer에 바인딩 됨.
  gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    offset
  );

  // 임의의 색상으로 임의의 사각형 50개 그리기
  for (var ii = 0; ii < 50; ++ii) {
    // 임의의 사각형 설정
    // ARRAY_BUFFER 바인드 포인트에 마지막으로 바인딩한 것이므로 `positionBuffer`에 작성됩니다.
    setRectangle(
      gl,
      randomInt(300),
      randomInt(300),
      randomInt(300),
      randomInt(300)
    );

    // 임의의 색상 설정
    gl.uniform4f(
      colorUniformLocation,
      Math.random(),
      Math.random(),
      Math.random(),
      1
    );

    // 사각형 그리기
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // 0부터 -1사이 임의의 정수 반환
  function randomInt(range) {
    return Math.floor(Math.random() * range);
  }

  // 사각형을 정의한 값들로 버퍼 채우기
  function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;

    // 참고: gl.bufferData(gl.ARRAY_BUFFER, ...)는 `ARRAY_BUFFER` 바인드 포인트에 바인딩된 버퍼에 영향을 주지만 지금까지는 하나의 버퍼만 있었습니다.
    // 두 개 이상이라면 원하는 버퍼를 `ARRAY_BUFFER`에 먼저 바인딩해야 합니다.
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
      gl.STATIC_DRAW
    );
  }
  // draw
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6; // count만큼 그리는 것
  gl.drawArrays(primitiveType, offset, count);
}

main();

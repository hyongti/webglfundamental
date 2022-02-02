import webglUtils from "./webglUtils";

function main() {
  // Get A WebGL context
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // webGL 셰이더를 위한 소스
  var vertexShaderSource = `
    // 속성은 버퍼에서 데이터를 받습니다.
    attribute vec4 a_position;
  
    // 모든 셰이더는 main 함수를 가집니다.
    void main() {
  
    // "gl_Position"은 정점 셰이더가 설정을 담당하는 특수 변수
    gl_Position = a_position;
  }
  `;
  var fragmentShaderSource = `
    // 프래그먼트 셰이더는 기본 정밀도를 가지고 있지 않으므로 하나를 선택해야 합니다.
    // "mediump"은 좋은 기본값으로 "중간 정밀도"를 의미합니다.
    precision mediump float;
    
    void main() {
      // "gl_FragColor"는 프래그먼트 셰이더가 설정을 담당하는 특수 변수
      gl_FragColor = vec4(1, 0, 0.5, 1); // 자주색 반환
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

  // attribute는 버퍼에서 데이터를 가져오므로 버퍼를 생성함
  var positionBuffer = gl.createBuffer();

  // WebGL은 전역 바인드 포인트에 있는 많은 WebGL 리소스를 조작하게 해줍니다.
  // 바인드 포인트는 WebGL 안에 있는 내부 전역 변수라고 생각하면 됩니다.
  // 리소스를 바인드 포인트에 바인딩하면 모든 함수가 바인드 포인트를 통해 리소스를 참조합니다
  // 위에서 만든 positionBuffer를 ARRAY_BUFFER(바인드 포인트)에 바인드
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // 이제 바인드포인트를 통해 해당 버퍼를 참조해서 데이터를 넣을 수 있음
  var positions = [0, 0, 0, 0.5, 0.7, 0];
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

  // draw
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 3;
  gl.drawArrays(primitiveType, offset, count);
}

main();

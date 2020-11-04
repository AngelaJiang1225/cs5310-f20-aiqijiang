const webglUtils = {
  hexToRgb: (hex) => {
    let parseRgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let rgb = {
      red: parseInt(parseRgb[1], 16),
      green: parseInt(parseRgb[2], 16),
      blue: parseInt(parseRgb[3], 16)
    }
    rgb.red /= 256
    rgb.green /= 256
    rgb.blue /= 256
    return rgb
  },
  componentToHex: (c) => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  },
  rgbToHex: (rgb) => {
    return `#${webglUtils.componentToHex(rgb.red * 256)}${webglUtils.componentToHex(rgb.green * 256)}${webglUtils.componentToHex(rgb.blue * 256)}`
  },
  createProgramFromScripts: (gl, vertexShaderElementId, fragmentShaderElementId) => {
    // Get the strings for our GLSL shaders
    const vertexShaderSource = document.querySelector(vertexShaderElementId).text;
    const fragmentShaderSource = document.querySelector(fragmentShaderElementId).text;

    // Create GLSL shaders, upload the GLSL source, compile the shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Link the two shaders into a program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program
  },
  updateCameraAngle: (event) => {
    cameraAngleRadians = m4.degToRad(event.target.value);
    render();
  },
  updateLookUp: (event) => {
    lookAt = event.target.checked
    render();
  },
  updateFieldOfView: (event) => {
    fieldOfViewRadians = m4.degToRad(event.target.value);
    render();
  },
  updateTranslation: (event, axis) => {
    shapes[selectedShapeIndex].translation[axis] = event.target.value
    render()
  },
  updateRotation: (event, axis) => {
    shapes[selectedShapeIndex].rotation[axis] = event.target.value
    render();
  },
  updateScale: (event, axis) => {
    shapes[selectedShapeIndex].scale[axis] = event.target.value
    render()
  },
  updateColor: (event) => {
    const hex = event.target.value
    const rgb = webglUtils.hexToRgb(hex)
    shapes[selectedShapeIndex].color = rgb
    render()
  },
  toggleLookAt: (event) => {
    lookAt = event.target.checked
    render()
  },
  updateCameraTranslation: (event, axis) => {
    camera.translation[axis] = event.target.value
    render()
  },
  updateCameraRotation: (event, axis) => {
    camera.rotation[axis] = event.target.value
    render();
  },
  updateLookAtTranslation: (event, index) => {
    target[index] = event.target.value
    render();
  },
  addShape: (newShape, type) => {
    const colorHex = document.getElementById("color").value
    const colorRgb = webglUtils.hexToRgb(colorHex)
    let tx = 0
    let ty = 0
    let tz = 0
    let shape = {
      type: type,
      position: origin,
      dimensions: sizeOne,
      color: colorRgb,
      translation: { x: tx, y: ty, z: tz },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 20, y: 20, z: 20 }
    }
    if (newShape) {
      Object.assign(shape, newShape)
    }
    shapes.push(shape)
    render()
  },
  deleteShape: (shapeIndex) => {
    shapes.splice(shapeIndex, 1)
    if (shapes.length > 0) {
      webglUtils.selectShape(0)
      render()
    } else {
      selectedShapeIndex = -1
    }
  },
  selectShape: (selectedIndex) => {
    selectedShapeIndex = selectedIndex
    document.getElementById("tx").value = shapes[selectedIndex].translation.x
    document.getElementById("ty").value = shapes[selectedIndex].translation.y
    document.getElementById("tz").value = shapes[selectedIndex].translation.z
    document.getElementById("sx").value = shapes[selectedIndex].scale.x
    document.getElementById("sy").value = shapes[selectedIndex].scale.y
    document.getElementById("sz").value = shapes[selectedIndex].scale.z
    document.getElementById("rx").value = shapes[selectedIndex].rotation.x
    document.getElementById("ry").value = shapes[selectedIndex].rotation.y
    document.getElementById("rz").value = shapes[selectedIndex].rotation.z
    document.getElementById("fv").value = webglUtils.radToDeg(fieldOfViewRadians)
    const hexColor = webglUtils.rgbToHex(shapes[selectedIndex].color)
    document.getElementById("color").value = hexColor
  },
  doMouseDown: (event) => {
    const boundingRectangle = canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - boundingRectangle.left - boundingRectangle.width / 2);
    const y = -Math.round(event.clientY - boundingRectangle.top - boundingRectangle.height / 2);
    const translation = { x, y, z: -150 }
    const rotation = { x: 0, y: 0, z: 180 }
    const shapeType = document.querySelector("input[name='shape']:checked").value
    const shape = {
      translation, rotation, type: shapeType
    }
    webglUtils.addShape(shape, shapeType)
  },
  renderCube: (cube) => {
    const geometry = [
      0, 0, 0, 0, 30, 0, 30, 0, 0,
      0, 30, 0, 30, 30, 0, 30, 0, 0,
      0, 0, 30, 30, 0, 30, 0, 30, 30,
      0, 30, 30, 30, 0, 30, 30, 30, 30,
      0, 30, 0, 0, 30, 30, 30, 30, 30,
      0, 30, 0, 30, 30, 30, 30, 30, 0,
      0, 0, 0, 30, 0, 0, 30, 0, 30,
      0, 0, 0, 30, 0, 30, 0, 0, 30,
      0, 0, 0, 0, 0, 30, 0, 30, 30,
      0, 0, 0, 0, 30, 30, 0, 30, 0,
      30, 0, 30, 30, 0, 0, 30, 30, 30,
      30, 30, 30, 30, 0, 0, 30, 30, 0,
    ]
    const float32Array = new Float32Array(geometry)
    gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW)
    var primitiveType = gl.TRIANGLES;
    var normals = new Float32Array([
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
  },
  renderRectangle: (rectangle) => {
    const x1 = rectangle.position.x
      - rectangle.dimensions.width / 2;
    const y1 = rectangle.position.y
      - rectangle.dimensions.height / 2;
    const x2 = rectangle.position.x
      + rectangle.dimensions.width / 2;
    const y2 = rectangle.position.y
      + rectangle.dimensions.height / 2;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1, 0, x2, y1, 0, x1, y2, 0,
      x1, y2, 0, x2, y1, 0, x2, y2, 0,
    ]), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  },
  renderTriangle: (triangle) => {
    const x1 = triangle.position.x
      - triangle.dimensions.width / 2
    const y1 = triangle.position.y
      + triangle.dimensions.height / 2
    const x2 = triangle.position.x
      + triangle.dimensions.width / 2
    const y2 = triangle.position.y
      + triangle.dimensions.height / 2
    const x3 = triangle.position.x
    const y3 = triangle.position.y
      - triangle.dimensions.height / 2

    const float32Array = new Float32Array([
      x1, y1, 0, x3, y3, 0, x2, y2, 0])

    gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  },
  renderLetterF: (letterF) => {
    const geometry = [
      // left column front [ok]
      0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0,
      30, 150, 0, 30, 0, 0,

      // top rung front
      30, 0, 0, 30, 30, 0, 100, 0, 0,
      30, 30, 0, 100, 30, 0, 100, 0, 0,

      // middle rung front
      30, 60, 0, 30, 90, 0, 67, 60, 0,
      30, 90, 0, 67, 90, 0, 67, 60, 0,

      // left column back [ok]
      0, 0, 30, 30, 0, 30, 0, 150, 30,
      0, 150, 30, 30, 0, 30, 30, 150, 30,

      // top rung back
      30, 0, 30, 100, 0, 30, 30, 30, 30,
      30, 30, 30, 100, 0, 30, 100, 30, 30,

      // middle rung back
      30, 60, 30, 67, 60, 30, 30, 90, 30,
      30, 90, 30, 67, 60, 30, 67, 90, 30,

      // top [ok]
      0, 0, 0, 100, 0, 0, 100, 0, 30,
      0, 0, 0, 100, 0, 30, 0, 0, 30,

      // top rung right
      100, 0, 0, 100, 30, 0, 100, 30, 30,
      100, 0, 0, 100, 30, 30, 100, 0, 30,

      // under top rung
      30, 30, 0, 30, 30, 30, 100, 30, 30,
      30, 30, 0, 100, 30, 30, 100, 30, 0,

      // between top rung and middle
      30, 30, 0, 30, 60, 30, 30, 30, 30,
      30, 30, 0, 30, 60, 0, 30, 60, 30,

      // top of middle rung
      30, 60, 0, 67, 60, 30, 30, 60, 30,
      30, 60, 0, 67, 60, 0, 67, 60, 30,

      // right of middle rung
      67, 60, 0, 67, 90, 30, 67, 60, 30,
      67, 60, 0, 67, 90, 0, 67, 90, 30,

      // bottom of middle rung.
      30, 90, 0, 30, 90, 30, 67, 90, 30,
      30, 90, 0, 67, 90, 30, 67, 90, 0,

      // right of bottom
      30, 90, 0, 30, 150, 30, 30, 90, 30,
      30, 90, 0, 30, 150, 0, 30, 150, 30,

      // bottom [ok]
      0, 150, 0, 0, 150, 30, 30, 150, 30,
      0, 150, 0, 30, 150, 30, 30, 150, 0,

      // left side [ok]
      0, 0, 0, 0, 0, 30, 0, 150, 30,
      0, 0, 0, 0, 150, 30, 0, 150, 0
    ]
    const float32Array = new Float32Array(geometry)
    gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW)
    var primitiveType = gl.TRIANGLES;
    gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
  },
  doKeyDown: (event) => {
    if (event.keyCode === 81) {
      document.getElementById("turnLeft").click();
    }
    else if (event.keyCode === 87) {
      document.getElementById("up").click();
    }
    else if (event.keyCode === 69) {
      document.getElementById("turnRight").click();
    }
    else if (event.keyCode === 65) {
      document.getElementById("left").click();
    }
    else if (event.keyCode === 83) {
      document.getElementById("down").click();
    }
    else if (event.keyCode === 68) {
      document.getElementById("right").click();
    }
  },
  updateCameraTranslation_rotateLeft: () => {
    crx = parseFloat(document.getElementById("crx").value);
    cry = parseFloat(document.getElementById("cry").value);
    crz = parseFloat(document.getElementById("crz").value) * Math.PI / 180;

    crx = crx - 2 * Math.sin(crz);
    cry = cry - 2 * Math.cos(crz);

    document.getElementById("crx").value = crx;
    document.getElementById("cry").value = cry;
    camera.rotation.x = crx;
    camera.rotation.y = cry;
    render()
  },
  updateCameraTranslation_rotateRight: () => {
    crx = parseFloat(document.getElementById("crx").value);
    cry = parseFloat(document.getElementById("cry").value);
    crz = parseFloat(document.getElementById("crz").value) * Math.PI / 180;

    crx = crx + 2 * Math.sin(crz);
    cry = cry + 2 * Math.cos(crz);

    document.getElementById("crx").value = crx;
    document.getElementById("cry").value = cry;
    camera.rotation.x = crx;
    camera.rotation.y = cry;
    render()
  },
  updateCameraTranslation_forward: () => {
    rx = document.getElementById("crx").value * Math.PI / 180;
    ry = document.getElementById("cry").value * Math.PI / 180;
    rz = document.getElementById("crz").value * Math.PI / 180;
    ctx = parseFloat(document.getElementById("ctx").value);
    cty = parseFloat(document.getElementById("cty").value);
    ctz = parseFloat(document.getElementById("ctz").value);

    ctx = ctx - 5 * Math.sin(ry);
    cty = cty + 5 * Math.sin(rx);
    ctz = ctz + 5 * Math.cos(ry);

    document.getElementById("ctx").value = ctx;
    document.getElementById("cty").value = cty;
    document.getElementById("ctz").value = ctz;
    camera.translation.x = ctx;
    camera.translation.y = cty;
    camera.translation.z = ctz;
    render()
  },
  updateCameraTranslation_left: () => {
    rx = document.getElementById("crx").value * Math.PI / 180;
    ry = document.getElementById("cry").value * Math.PI / 180;
    rz = document.getElementById("crz").value * Math.PI / 180;
    ctx = parseFloat(document.getElementById("ctx").value);
    cty = parseFloat(document.getElementById("cty").value);
    ctz = parseFloat(document.getElementById("ctz").value);

    ctx = ctx + 5 * Math.cos(ry) * Math.cos(rz);
    cty = cty - 5 * Math.sin(rz);
    ctz = ctz + 5 * Math.sin(ry) * Math.cos(rz);

    document.getElementById("ctx").value = ctx;
    document.getElementById("cty").value = cty;
    document.getElementById("ctz").value = ctz;
    camera.translation.x = ctx;
    camera.translation.y = cty;
    camera.translation.z = ctz;
    render()
  },
  updateCameraTranslation_backward: () => {
    rx = document.getElementById("crx").value * Math.PI / 180;
    ry = document.getElementById("cry").value * Math.PI / 180;
    rz = document.getElementById("crz").value * Math.PI / 180;
    ctx = parseFloat(document.getElementById("ctx").value);
    cty = parseFloat(document.getElementById("cty").value);
    ctz = parseFloat(document.getElementById("ctz").value);

    ctx = ctx + 5 * Math.sin(ry);
    cty = cty - 5 * Math.sin(rx);
    ctz = ctz - 5 * Math.cos(ry);

    document.getElementById("ctx").value = ctx;
    document.getElementById("cty").value = cty;
    document.getElementById("ctz").value = ctz;
    camera.translation.x = ctx;
    camera.translation.y = cty;
    camera.translation.z = ctz;
    render()
  },
  updateCameraTranslation_right: () => {
    rx = document.getElementById("crx").value * Math.PI / 180;
    ry = document.getElementById("cry").value * Math.PI / 180;
    rz = document.getElementById("crz").value * Math.PI / 180;
    ctx = parseFloat(document.getElementById("ctx").value);
    cty = parseFloat(document.getElementById("cty").value);
    ctz = parseFloat(document.getElementById("ctz").value);

    ctx = ctx - 5 * Math.cos(ry) * Math.cos(rz);
    cty = cty + 5 * Math.sin(rz);
    ctz = ctz - 5 * Math.sin(ry) * Math.cos(rz);

    document.getElementById("ctx").value = ctx;
    document.getElementById("cty").value = cty;
    document.getElementById("ctz").value = ctz;
    camera.translation.x = ctx;
    camera.translation.y = cty;
    camera.translation.z = ctz;
    render()
  },
  degToRad: (degrees) => degrees * Math.PI / 180,
  radToDeg: (radians) => radians * 180 / Math.PI,
  updateLightDirection: (event, index) => {
    lightSource[index] = parseFloat(event.target.value)
    render()
  },
}
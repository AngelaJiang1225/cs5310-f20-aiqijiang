
<!--attribute means input-->
<!--uniform means constant can't be modified -->
<script id="vertex-shader-2d"
        type="x-shader/x-vertex">
    attribute vec2 a_coords;
    uniform   vec2 u_resolution;

    void main() {
    vec2 zeroToOne = a_coords / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 minusOneToOne = zeroToTwo - 1.0;
    vec2 clipSpace = minusOneToOne * vec2(1, -1);
    gl_Position = vec4(clipSpace, 0, 1);
}
</script>

<script id="fragment-shader-2d" type="x-shader/x-fragment">
    precision mediump float;
    uniform vec4 u_color;
    void main() {
    gl_FragColor = u_color;
}
</script>

<script>
    const hexToRgb = (hex) => {
    let parseRgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let rgb = {
    red:   parseInt(parseRgb[1], 16),
    green: parseInt(parseRgb[2], 16),
    blue:  parseInt(parseRgb[3], 16)
}
    rgb.red /= 256
    rgb.green /= 256
    rgb.blue /= 256
    return rgb
}

    const RED_HEX = "#FF0000"
    const RED_RGB = hexToRgb(RED_HEX)
    const BLUE_HEX = "#0000FF"
    const BLUE_RGB = hexToRgb(BLUE_HEX)

    // now gpu knows what to do with things above
    const createProgramFromScripts = (gl, vertexShaderElementId, fragmentShaderElementId) => {
    // Get the strings for our GLSL shaders
    const vertexShaderSource   = document.querySelector(vertexShaderElementId).text;
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
}
    // rectangle type shapes
    const RECTANGLE = "RECTANGLE"
    let shapes = [
    {
        type: RECTANGLE,
        position: {
        x: 200,
        y: 100
    },
        dimensions: {
        width:  50,
        height: 50
    },
        color: {
        red: BLUE_RGB.red,
        green: BLUE_RGB.green,
        blue: BLUE_RGB.blue
    }
    }
    ]

    // triangle type shapes
    const TRIANGLE = "TRIANGLE"
    let shapes = [
    { type: RECTANGLE, ... },
    {
        type: TRIANGLE,
        position: {
        x: 300,
        y: 100
    },
        dimensions: {
        width: 50,
        height: 50
    },
        color: {
        red: RED_RGB.red,
        green: RED_RGB.blue,
        blue: RED_RGB.green
    }
    }
    ]
    // next cope with the input variables
    let gl
    let attributeCoords
    let uniformColor
    let bufferCoords

    const init = () => {
    // get a reference to the canvas and WebGL context
    const canvas = document.querySelector("#canvas");
    gl = canvas.getContext("webgl");

    // create and use a GLSL program
    const program = createProgramFromScripts(gl,
    "#vertex-shader-2d", "#fragment-shader-2d");
    gl.useProgram(program);

    // get reference to GLSL attributes and uniforms
    attributeCoords = gl.getAttribLocation(program, "a_coords");
    const uniformResolution = gl.getUniformLocation(program, "u_resolution");
    uniformColor = gl.getUniformLocation(program, "u_color");

    // initialize coordinate attribute to send each vertex to GLSL program
    gl.enableVertexAttribArray(attributeCoords);

    // initialize coordinate buffer to send array of vertices to GPU
    // every time to create a shape need to empty and create the buffer
    bufferCoords = gl.createBuffer();

    // configure canvas resolution and clear the canvas
    gl.uniform2f(uniformResolution, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

    const render = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCoords);
    gl.vertexAttribPointer(
    attributeCoords, 2, gl.FLOAT, false, 0, 0);

    shapes.forEach(shape => {
    gl.uniform4f(uniformColor,
    shape.color.red,
    shape.color.green,
    shape.color.blue, 1);

    if(shape.type === RECTANGLE) {
    renderRectangle(shape)
} else if(shape.type == TRIANGLE) {
    renderTriangle(shape)
}
})
}

    const renderRectangle = (rectangle) => {
    const x1 = rectangle.position.x
    - rectangle.dimensions.width/2;
    const y1 = rectangle.position.y
    - rectangle.dimensions.height/2;
    const x2 = rectangle.position.x
    + rectangle.dimensions.width/2;
    const y2 = rectangle.position.y
    + rectangle.dimensions.height/2;

    const float32Array = new Float32Array([
    x1, y1, x2, y1, x1, y2,
    x1, y2, x2, y1, x2, y2,
    ])

    gl.bufferData(gl.ARRAY_BUFFER, float32Array, gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
    const renderTriangle = (triangle) => {
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
    x1, y1,   x2, y2,   x3, y3
    ])

    gl.bufferData(gl.ARRAY_BUFFER,
    float32Array, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
    const addRectangle = () => {
    let x = parseInt(document
    .getElementById("x").value)
    let y = parseInt(document
    .getElementById("y").value)
    const width = parseInt(document
    .getElementById("width").value)
    const height = parseInt(document
    .getElementById("height").value)

    const rectangle = {
    type: RECTANGLE,
    position: {
    "x": x,
    y: y
},
    dimensions: {
    width,
    height
},
    color: {
    red: Math.random(),
    green: Math.random(),
    blue: Math.random()
}
}

    shapes.push(rectangle)
    render()
}
</script>

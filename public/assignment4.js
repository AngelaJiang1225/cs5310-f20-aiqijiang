
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

const RECTANGLE = "RECTANGLE"
const TRIANGLE = "TRIANGLE"
const CIRCLE = "CIRCLE"

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
    },
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
    },
    {
        type: CIRCLE,
        position: {
            x: 400,
            y: 100
        },
        dimensions: {
            r: 25
        },
        color: {
            red: BLUE_RGB.red,
            green: BLUE_RGB.green,
            blue: BLUE_RGB.blue
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
    canvas.addEventListener(
        "mousedown",
        doMouseDown,
        false);
    // create and use a GLSL program
    const program = createProgramFromScripts(gl,
        "#vertex-shader-2d", "#fragment-shader-2d");
    gl.useProgram(program);

    // get reference to GLSL attributes and uniforms
    attributeCoords = gl.getAttribLocation(program, "a_coords");
    const uniformResolution = gl.getUniformLocation(program, "u_resolution");
    uniformColor = gl.getUniformLocation(program, "u_color");

    // attributeVPosition = gl.getAttribLocation(program, "vPosition");
    // const uniformTheta = gl.getUniform(program, "theta"); //


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

const doMouseDown = (event) => {
    const boundingRectangle = canvas.getBoundingClientRect();
    const x = event.clientX - boundingRectangle.left;
    const y = event.clientY - boundingRectangle.top;
    const center = {position: {x, y}}
    const shape = document.querySelector("input[name='shape']:checked").value

    if (shape === "RECTANGLE") {
        addRectangle(center)
    } else if (shape === "TRIANGLE") {
        addTriangle(center)
    }
}


const render = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER,
        bufferCoords);
    gl.vertexAttribPointer(
        attributeCoords,
        2,
        gl.FLOAT,
        false,
        0,

        0);

    shapes.forEach(shape => {
        gl.uniform4f(uniformColor,
            shape.color.red,
            shape.color.green,
            shape.color.blue, 1);

        if(shape.type === RECTANGLE) {
            renderRectangle(shape)
        } else if(shape.type === TRIANGLE) {
            renderTriangle(shape)
        } else if(shape.type === CIRCLE) {
            renderCircle(shape)
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

const renderCircle = (circle) => {
    for(var th = 0.0; th <90; th += 0.1) {
        const sin = 10*Math.sin(th);
        const cos = 10*Math.cos(th);
        vertices[0] = vec2(sin, cos);
        vertices[1] = vec2(sin, -cos);
        vertices[2] = vec2(-sin, -cos);
        vertices[3] = vec2(-sin, cos);
        const float32Array = new Float32Array([
            x1, y1,   x2, y2,   x3, y3
        ])

        gl.bufferData(gl.ARRAY_BUFFER,
            float32Array, gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        //gl.bufferSubData( … )
        render();
    }
}
// const renderCircle = (circle) => {
//     var theta =
//         gl.getUniformLocation(program, "theta");
//     let thetaLocal = 0.0;
//     function render() {
//         gl.clear(gl.COLOR_BUFFER_BIT);
//         thetaLocal += 0.1;
//         gl.uniform1f(theta, thetaLocal);
//         gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
//         render();
//     }
// }
const addRectangle = (center) => {
    let x = parseInt(document
        .getElementById("x").value)
    let y = parseInt(document
        .getElementById("y").value)
    const width = parseInt(document
        .getElementById("width").value)
    const height = parseInt(document
        .getElementById("height").value)
    const colorHex = document.getElementById("color").value
    const colorRgb = hexToRgb(colorHex)
    if (center) {
        x = center.position.x
        y = center.position.y
    }
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
        color: colorRgb
    }
    shapes.push(rectangle)
    render()
}

const addTriangle = (center) => {
    let x = parseInt(document.getElementById("x").value)
    let y = parseInt(document.getElementById("y").value)
    const colorHex = document.getElementById("color").value
    const colorRgb = hexToRgb(colorHex)
    const width = parseInt(document.getElementById("width").value)
    const height = parseInt(document.getElementById("height").value)
    if (center) {
        x = center.position.x
        y = center.position.y
    }
    const triangle = {
        type: TRIANGLE,
        position: {x, y},
        dimensions: {width, height},
        color: colorRgb
    }
    shapes.push(triangle)
    render()
}

var theta =
    gl.getUniformLocation(program, "theta");
const program2 = createProgramFromScripts(gl,
    "#vertex-shader-circle", "#fragment-shader-2d");
gl.useProgram(program);
let thetaLocal = 0.0;
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    thetaLocal += 0.1;
    gl.uniform1f(theta, thetaLocal);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    render();
}


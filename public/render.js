const configurePositionBufferRead =
    (gl, buffers, parameters) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
        gl.vertexAttribPointer(
            parameters.attribLocations.vertexPosition,
            2,
            gl.FLOAT,
            false,
            0,
            0);
        gl.enableVertexAttribArray(
            parameters.attribLocations.vertexPosition);
    }

const configureColorBufferRead
    = (gl, buffers, parameters) =>   {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        buffers.color);
    gl.vertexAttribPointer(
        parameters.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        parameters.attribLocations.vertexColor);
}

const setUniforms = (gl, parameters, projectionMatrix, modelViewMatrix) => {
    gl.uniformMatrix4fv(
        parameters.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);
    gl.uniformMatrix4fv(
        parameters.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);
}

const getProgramParameters = (gl, shaderProgram) => {
    return {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation
            (shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation
            (shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation
            (shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation
            (shaderProgram, 'uModelViewMatrix'),
        },
    };
}


// pull positions from position buffer

// into vertexPosition attribute
// pull out 2 values per iteration
// data in buffer is 32bit floats
// don't normalize
// how many bytes to get from one set
// of values to the next
// 0 = use same as above, e.g., 2
// bytes to start from (offset)


// 45 degrees field of view
// aspect ration matching canvas size

// render objects between 0.1 units
// and 100 units away from camera
// create an identity matrix to get started

// create a perspective matrix that
// distorts vertices based on distance




// clear the scene
// create a projection matrix
// set drawing position to "identity" point, e.g.,
// center of the scene
// move drawing position -6 in Z



// configure how to consume position buffer
// use our program when drawing
// send uniforms to GLSL program

// draw the square

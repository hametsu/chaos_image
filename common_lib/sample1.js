var GLC = hametsu.GLCommon;
var gl;
var shaderProgram;

function initShaders() {
  var fragmentShader = GLC.getShader(gl, "shader-fs");
  var vertexShader = GLC.getShader(gl, "shader-vs");

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}


/**
 * Define class for model
 */
var Itoyanagi = function(config) {
  this.initialize.call(this, config);
}

Itoyanagi.prototype = {
  initialize : function(config) {
    this.imageUrl = config.imageUrl;
    this.currentPosition = config.initialPosition || [0,0,0];
    this.initBuffer();
    this.initTexture(config.imageUrl);
  },

  initBuffer : function() {
    // Vertex Position Buffer
    var vPBuffer = this.vPBuffer = GLC.createBuffer({
      itemSize : 3
    });
    vPBuffer.addItem([
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
    ]);
    vPBuffer.bindData();

    // Vertex Texture Coord Buffer
    var vTCBuffer = this.vTCBuffer = GLC.createBuffer({
      itemSize: 2
    });
    vTCBuffer.addItem([
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ]);
    vTCBuffer.bindData();

    // Vertex Index Buffer
    var vIBuffer = this.vIBuffer = GLC.createBuffer({
      type : gl.ELEMENT_ARRAY_BUFFER,
      arrType : Uint16Array,
      itemSize : 1
    });
    vIBuffer.addItem([
      0, 1, 2,      0, 2, 3,    // Front face
    ]);
    vIBuffer.bindData();
  },

  initTexture : function(fileName) {
    this.texture = GLC.createTexture(fileName);
  },


  draw : function() {
    this.vPBuffer.bind();
    this.vPBuffer.vertexAttribPointer(shaderProgram.vertexPositionAttribute);

    this.vTCBuffer.bind();
    this.vTCBuffer.vertexAttribPointer(shaderProgram.textureCoordAttribute);


    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    this.vIBuffer.bind();
    GLC.setMatrixUniforms(shaderProgram);
    gl.drawElements(gl.TRIANGLES, this.vIBuffer.numItems, gl.UNSIGNED_SHORT, 0);
  },

  move : function() {
    var y = this.currentPosition[1] - 0.1;
    if (y < -5) {
      y = y*-1;
    }
    this.currentPosition[1] = y;

    GLC.mvTranslate(this.currentPosition);
  },

  moveAndDraw : function() {
    GLC.mvPushMatrix();
    this.move();
    this.draw();
    GLC.mvPopMatrix();
  }

}


var objects = [];
function initObjects() {

  for (var i=0; i<10; i++) {
    objects.push(new Itoyanagi({
      initialPosition : [
        Math.random()*2, 
        Math.random()*5, 
        Math.random()*2
      ],
      imageUrl : './face.jpg'
    }));
  }
}

var xRot = 0;
var yRot = 0;
var zRot = 0;
function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  GLC.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
  GLC.loadIdentity();

  GLC.mvTranslate([0.0, -1.0, -5.0]);

  //mvRotate(xRot, [1, 0, 0]);
  GLC.mvRotate(30, [1, 0, 0]);
  GLC.mvRotate(yRot, [0, 1, 0]);
  //GLC.mvRotate(zRot, [0, 0, 1]);
  
  objects.forEach(function(o) {
    o.moveAndDraw();
  });

}

var lastTime = 0;
function animate() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;

    xRot += (90 * elapsed) / 1000.0;
    yRot += (90 * elapsed) / 1000.0;
    zRot += (90 * elapsed) / 1000.0;
  }
  lastTime = timeNow;
}

function tick() {
  drawScene();
  animate();
}



function webGLStart() {
  gl = GLC.initGL("lesson01-canvas");
  initShaders();
  initObjects();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clearDepth(1.0);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  setInterval(tick, 50);
}

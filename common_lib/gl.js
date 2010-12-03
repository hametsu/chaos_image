(function(namespace) {

  //////////////////////////////////////////////////
  // Interface
  //////////////////////////////////////////////////
  namespace.GLCommon = {
    initGL : initGL,
    getShader : getShader,
    mvPushMatrix : mvPushMatrix,
    mvPopMatrix : mvPopMatrix,
    loadIdentity : loadIdentity,
    multMatrix : multMatrix,
    mvTranslate : mvTranslate,
    mvRotate : mvRotate,
    perspective : perspective,
    setMatrixUniforms : setMatrixUniforms,
    createBuffer : createBuffer,
    createTexture : createTexture
  }

  ///////////////////////////////////////////////////
  // Implementation
  ///////////////////////////////////////////////////
  var gl;

  function initGL(canvasId) {
    try {
      var canvas = document.getElementById(canvasId);
      gl = canvas.getContext("experimental-webgl");
      gl.viewportWidth = canvas.width;
      gl.viewportHeight = canvas.height;
    } catch(e) {
    }
    if (!gl) {
      alert("Could not initialise WebGL, sorry :-(");
    }
    return gl;
  }
  
  function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
      if (k.nodeType == 3) {
        str += k.textContent;
      }
      k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  var mvMatrix;
  var mvMatrixStack = [];

  function mvPushMatrix(m) {
    if (m) {
      mvMatrixStack.push(m.dup());
      mvMatrix = m.dup();
    } else {
      mvMatrixStack.push(mvMatrix.dup());
    }
  }

  function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "invalid popMatrix";
    }
    mvMatrix = mvMatrixStack.pop();
    return mvMatrix;
  }

  function loadIdentity() {
    mvMatrix = Matrix.I(4);
  }


  function multMatrix(m) {
    mvMatrix = mvMatrix.x(m);
  }


  function mvTranslate(v) {
    var m = Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
    return m;
  }

  function mvRotate(arg, v) {
    var arad = arg * Math.PI / 180.0;
    var m = Matrix.Rotation(arad, $V([v[0], v[1], v[2]])).ensure4x4();
    multMatrix(m);
  }

  var pMatrix;
  function perspective(fovy, aspect, znear, zfar) {
    pMatrix = makePerspective(fovy, aspect, znear, zfar);
  }

  function setMatrixUniforms(shaderProgram) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix.flatten()));
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix.flatten()));
  }

  /////////////////////////////////////////////////////////
  // Texture
  /////////////////////////////////////////////////////////

  /**
   * @private
   */
  function handleLoadedTextureDefault(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  function createTexture(fileName, handleLoadedFn) {
    handleLoadedFn = handleLoadedFn || handleLoadedTextureDefault; 
    var texture = gl.createTexture();
    texture.image = new Image();
    texture.image.onload = function() {
      handleLoadedFn(texture);
    }
    texture.image.onerror = function() {
      alert('Image load error');
    }

    texture.image.src = fileName;
    return texture;
  }


  /////////////////////////////////////////////////////////
  // Buffer 
  /////////////////////////////////////////////////////////
  function createBuffer(config) {
    return new Buffer(config);
  }


  /**
   * @class Buffer
   */
  function Buffer(config) {
    this.initialize.call(this, config);
  }

  Buffer.prototype = {
    initialize : function(config) {
      this.bufferArr = [];
      this.type = config.type || gl.ARRAY_BUFFER;
      this.arrType = config.arrType || Float32Array
      this.itemSize = config.itemSize;
      this.buffer = gl.createBuffer();
    },

    addItem : function(arr) {
      this.bufferArr.push.apply(this.bufferArr, arr);
    },

    get : function() {
      return this.buffer;
    },

    bind : function() {
      gl.bindBuffer(this.type, this.buffer);
    },

    vertexAttribPointer : function(attr) {
      gl.vertexAttribPointer(attr, this.itemSize, gl.FLOAT, false, 0, 0);
    },

    bindData : function() {
      gl.bindBuffer(this.type, this.buffer);
      gl.bufferData(this.type, new this.arrType(this.bufferArr), gl.STATIC_DRAW);
      this.numItems = this.bufferArr.length / this.itemSize;
      return this.buffer;
    }
  }


})((function(){
  if (!window.hametsu) {
    window.hametsu = {};
  }
  return window.hametsu;
})());



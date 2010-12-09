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
  var ctx;

  function initGL(canvasId) {
    try {
      var canvas = document.getElementById(canvasId);
      ctx = canvas.getContext("experimental-webgl");
      if (WebGLDebugUtils) {
        ctx = WebGLDebugUtils.makeDebugContext(ctx);
      }
      ctx.viewportWidth = canvas.width;
      ctx.viewportHeight = canvas.height;
    } catch(e) {
    }
    if (!ctx) {
      alert("Could not initialise WebGL, sorry :-(");
    }
    return ctx;
  }
  
  function getShader(ctx, id) {
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
      shader = ctx.createShader(ctx.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = ctx.createShader(ctx.VERTEX_SHADER);
    } else {
      return null;
    }

    ctx.shaderSource(shader, str);
    ctx.compileShader(shader);

    if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
      console.error('Shader Comple Error:', ctx.getShaderInfoLog(shader));
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
    ctx.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, new Float32Array(pMatrix.flatten()));
    ctx.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, new Float32Array(mvMatrix.flatten()));
  }

  /////////////////////////////////////////////////////////
  // Texture
  /////////////////////////////////////////////////////////

  /**
   * @private
   */
  function handleLoadedTextureDefault(texture) {
    ctx.bindTexture(ctx.TEXTURE_2D, texture);
    ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, texture.image);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
    ctx.bindTexture(ctx.TEXTURE_2D, null);
  }

  function createTexture(fileName, handleLoadedFn) {
    handleLoadedFn = handleLoadedFn || handleLoadedTextureDefault; 
    var texture = ctx.createTexture();
    texture.image = new Image();
    texture.image.onload = function() {
      handleLoadedFn(texture);
    }
    texture.image.onerror = function() {
      console.error('Image load error:', fileName);
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
      this.type = config.type || ctx.ARRAY_BUFFER;
      this.arrType = config.arrType || Float32Array
      this.itemSize = config.itemSize;
      this.buffer = ctx.createBuffer();
    },

    addItem : function(arr) {
      this.bufferArr.push.apply(this.bufferArr, arr);
    },

    get : function() {
      return this.buffer;
    },

    bind : function() {
      ctx.bindBuffer(this.type, this.buffer);
    },

    vertexAttribPointer : function(attr) {
      ctx.vertexAttribPointer(attr, this.itemSize, ctx.FLOAT, false, 0, 0);
    },

    bindData : function() {
      ctx.bindBuffer(this.type, this.buffer);
      ctx.bufferData(this.type, new this.arrType(this.bufferArr), ctx.STATIC_DRAW);
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



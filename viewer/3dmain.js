/**
 * @Class hametsu.F3DController
 *
 *
 */
(function(namespace) {

  // INTERFACE
  namespace.F3DController = {
    start : webGLStart
  }


  var GLC = hametsu.GLCommon;
  var gl;
  var shaderProgram;
  var faceList;

  var fShaders = [
    'shader-fs3',
    'shader-fs1',
    'shader-fs2',
    'shader-fs4',
    'shader-fs5'
  ];

  function initShaders(idx) {
    var idx = idx || 0;

    if (idx == 0) {
      _initShaders(idx);
      idx++;
    }

    var queue = new AsyncQueue({name : 'shaders'});
    queue.push({
      fn : function(callback) {
        $('#3d').fadeOut(300, callback);
      },
      callback : function(){},
      delay : 10000
    });
    queue.push({
      fn : _initShaders,
      args : [idx]
    });
    queue.push(initObjects);
    queue.push({
      fn : function(callback) {
        $('#3d').fadeIn(300, callback);
      },
      callback : function(){}
    });
    queue.push({
      fn : initShaders,
      args : [++idx]
    });

  }

  function _initShaders(idx) {
    console.info('_initShaddres', idx);
    var idx = idx%fShaders.length;
    console.info(idx);
    var fragmentShader = GLC.getShader(gl, fShaders[idx]);
    var vertexShader = GLC.getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
    }
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

  }


  /**
   * Define class for model
   */
  var BackGround = function(config) {
    this.initialize.call(this, config);
  }

  BackGround.prototype = {
    initialize : function(config) {
      console.info('new background');
      this.imageUrl = config.imageUrl;
      this.currentPosition = config.initialPosition || [0,0,0];
      this.initBuffer();
      this.initTexture(config.imageUrl);
    },

    initBuffer : function() {
      // Vertex Position Buffer
      var vPBuffer = this.vPBuffer = GLC.createBuffer({
        itemSize : 1
      });
      var vertices = [ -1., -1.,   1., -1.,    -1.,  1.,     1., -1.,    1.,  1.,    -1.,  1.];
      vPBuffer.addItem(vertices);
      vPBuffer.bindData();
    },

    initTexture : function(fileName) {
      this.texture = GLC.createTexture(fileName, function(texture) {
        console.info('start : createTexture');

        var ctx = gl;

        ctx.enable(ctx.TEXTURE_2D);
        ctx.bindTexture(ctx.TEXTURE_2D, texture);
        ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, texture.image);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_LINEAR);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.REPEAT);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.REPEAT);
        ctx.generateMipmap(ctx.TEXTURE_2D)
        ctx.bindTexture(ctx.TEXTURE_2D, null);
        console.info('end : createTexture');
      });
    },

    draw : function() {
      var passedTime = new Date().getTime() - firstTime;
      //console.info('draw!!', passedTime);

      var l1 = gl.getAttribLocation(shaderProgram, "pos");
      var l2 = gl.getUniformLocation(shaderProgram, "time");
      var l3 = gl.getUniformLocation(shaderProgram, "resolution");
      var l4 = gl.getUniformLocation(shaderProgram, "mouse");

      var t0 = gl.getUniformLocation(shaderProgram, "tex0");
      var t1 = gl.getUniformLocation(shaderProgram, "tex1");
      var t2 = gl.getUniformLocation(shaderProgram, "tex2");
      var t3 = gl.getUniformLocation(shaderProgram, "tex3");

      this.vPBuffer.bind();

      if( l2!=null ) gl.uniform1f(l2, passedTime/1000);
      if( l3!=null ) gl.uniform2f(l3, gl.viewportWidth, gl.viewportHeight);
      //if( l4!=null ) gl.uniform4f(l4, mousePosX, this.mYres-1-mousePosY, mouseOriX, this.Yres-1-mouseOriY);
      if( l4!=null ) gl.uniform4f(l4, 50, 50, gl.viewportWidth-50, gl.viewportHeight-50);

      gl.vertexAttribPointer(l1, 2, gl.FLOAT, false, 0, 0);

      gl.enableVertexAttribArray(l1);

      if( t0!=null ) { 
        gl.uniform1i(t0, 0 ); 
        gl.activeTexture(gl.TEXTURE0); 
        gl.bindTexture(gl.TEXTURE_2D, this.texture); 
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.disableVertexAttribArray(l1);
    },

    move : function() {
    },

    moveAndDraw : function() {
      GLC.mvPushMatrix();
      this.move();
      this.draw();
      GLC.mvPopMatrix();
      gl.flush();
    }

  }


  var faceList;
  var faceListIdx = 0;
  var face;
  function initObjects() {
    var img =  img || faceList[(faceListIdx++)%faceList.length];
    console.info(hametsu.Face.getAPIBase() + img);
    face = new BackGround({
      imageUrl : hametsu.Face.getAPIBase() + img
    });
  }

  function handleNewFace(data) {
    var lastFace;
    data.faces.forEach(function(f) {
      faceList.shift();
      var faceUrl = hametsu.Face.getAPIBase() + f;
      faceList.push(faceUrl);
      lastFace = faceUrl;
    });
    initObjects(lastFace);
  }
    

  function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    GLC.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    GLC.loadIdentity();
    face.moveAndDraw();
  }

  var firstTime = new Date().getTime();

  function webGLStart(canvasId, faces) {
    console.dir(faces);
    faceList = faces;
    gl = GLC.initGL(canvasId);
    initShaders();
    initObjects();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    hametsu.Face.on(handleNewFace);

    setInterval(drawScene, 50);
  }

})(window.hametsu);


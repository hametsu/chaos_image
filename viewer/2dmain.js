(function(namespace) {

  // INTERFACE
  namespace.F2DController = {
    start : canvasStart
  }

  // Kinect Receiver
  var kinect = new WSMessage({
    url:"ws://localhost:8000/event",
    autoRecovery : true,
    listeners : {
      open : function(){console.info('onopen!!')},
      close : function(){console.info('onclose!!')},
      move : onMove,
      handclick : onHandClick,
      unregister : onUnKinectRegister,
      register : onKinectRegister,
//      swipeup : onSwipeUp,
//      swipedown : onSwipeDown,
//      swipeleft : onSwipeLeft,
//      swipeRight : onSwipeRight
    }
  });

  /////////////////////////////////////////////////////////
  //  For canvas drawing
  /////////////////////////////////////////////////////////
  const MAX_FACE_NUM = 200;
  const INTERVAL = 40;
  var ctx;
  var WIDTH;
  var HEIGHT;
  var faces = [];
  var pointer;

  function onMove(data) {
    pointer.locX = Math.floor((100-data.x)/100*WIDTH);
    pointer.locY = Math.floor(data.y/100*HEIGHT);
    pointer.size = 150-data.z;
  }

  function onHandClick() {
    pointer.capture = true;
    pointer.captureTime = 5;
  }

  function onUnKinectRegister() {
    pointer.visible = false;
  }

  function onKinectRegister() {
    pointer.visible = true;
  }

  function createFace(config) {
    return {
      img : config.img,
      speedX : config.speedX || Math.random() * 6.0 - 3.0,
      speedY : config.speedY || Math.random() * 6.0 - 3.0,
      locX : config.locX || WIDTH / 2,
      locY : config.locY || HEIGHT / 2,
      size : config.size || Math.random() * 40.0 + 20.0
    }
  }


  function canvasStart(canvasName, initialFaceData) {
    var canvas = document.getElementById(canvasName);
    WIDTH = $(canvas).width();
    HEIGHT = $(canvas).height();
    $('#imgHolder').height(HEIGHT);

    if ((ctx = canvas.getContext && canvas.getContext('2d'))) {

      initialFaceData.forEach(function(f, i) {
        if (i > MAX_FACE_NUM) return;
        var img = new Image();
        img.src = hametsu.Face.getAPIBase() + f;
        faces.push(createFace({
          img : img
        }));
      });

      pointer = {
        visible : true,
        locX : 0,
        locY : 0,
        size : 10
      }

      console.info('Initial Face count:', faces.length);

      hametsu.Face.on(handleNewFace);
      setInterval(draw, INTERVAL);
      return;
    }
    alert('Error!! cannot get 2d context');
  }

  function handleNewFace(data) {
    console.info('new iamges comes-------------------------');
    data.faces.forEach(function(f) {
      console.info('add image:', f);
      var img = new Image();
      img.src = hametsu.Face.getAPIBase() + f;
      faces.push(createFace({
        img : img
      }));

      if (faces.length > MAX_FACE_NUM) {
        console.info('reduce images!!!!!!!!');
        faces.shift();
      }
    });
  }

  function draw() {

    ctx.globalCompositeOperation = "source-over";
    //ctx.fillStyle = "rgba(8,8,12,0.1)";
    //ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.globalCompositeOperation = "lighter";

    var tmpSize;
    var tmpX;
    var tmpY;
    var face;
    var capturedImage = [];

    for (var i=0, len=faces.length; i<len; i++) {
      face = faces[i];
      face.locX += face.speedX;
      face.locY += face.speedY;

      if(face.locX < 0 || face.locX > WIDTH - face.size){
        face.speedX *= -1.0;
      }

      if(face.locY < 0 || face.locY > HEIGHT - face.size){
        face.speedY *= -1.0;
      }

      tmpSize = face.size;
      tmpX = face.locX;
      tmpY = face.locY;

      if (pointer.visible) {
        var dist = Math.sqrt(
                   Math.pow(tmpX - pointer.locX + face.size/2, 2) +
                   Math.pow(tmpY - pointer.locY + face.size/2, 2));

        if (dist < pointer.size) {
           tmpSize += pointer.size - dist;

           if (pointer.capture) {
             console.info(face.img.src);
             capturedImage.push(face.img.src);
           }
        }

      }

      if (i > len-11) {
        tmpSize = tmpSize + 50 + Math.random()*10;
        var tt = len-i;
        tmpX = tt*100%WIDTH + Math.random()*5;
        tmpY = tt*100%HEIGHT + Math.random()*5;
      }
      ctx.drawImage(face.img, tmpX, tmpY, tmpSize, tmpSize)
    }

    if (pointer.visible) {
      ctx.beginPath();
      if (pointer.captureTime > 0) {
        ctx.fillStyle = 'rgba(640,20,64, 0.8)';
        pointer.captureTime -= 1;
      } else {
        ctx.fillStyle = 'rgba(20,20,64, 0.8)';
      }
      ctx.arc(pointer.locX, pointer.locY, pointer.size, 0, Math.PI*2.0, true);
      ctx.fill();
    }

    drawGrabedFaces(capturedImage);
    pointer.capture = false;
  }

  ////////////////////////////////////////////////////////////////
  // for Dom controll
  ////////////////////////////////////////////////////////////////

  var imgEls = [];
  function drawGrabedFaces(imgs) {
    var holder = $('#imgHolder');
    imgs.forEach(function(src) {
      var el = $('<img>').attr('src', src);
      el.prependTo(holder);
      el.addClass('slideIn');
      imgEls.push(el);

      if (imgEls.length > 20) {
        imgEls.shift().remove();
      }
    });
  }
})(window.hametsu);

(function(namespace) {

  // INTERFACE
  namespace.F2DController = {
    start : canvasStart
  }

  const MAX_FACE_NUM = 200;
  const INTERVAL = 40;
  var ctx;
  var WIDTH;
  var HEIGHT;
  var faces = [];

  function createFace(config) {
    return {
      img : config.img,
      speedX : config.speedX || Math.random() * 8.0 - 4.0,
      speedY : config.speedY || Math.random() * 8.0 - 4.0,
      locX : config.locX || WIDTH / 2,
      locY : config.locY || HEIGHT / 2,
      size : config.size || Math.random() * 40.0 + 20.0
    }
  }

  var newFaces = [];

  function canvasStart(canvasName, initialFaceData) {
    var canvas = document.getElementById(canvasName);
    WIDTH = $(canvas).width();
    HEIGHT = $(canvas).height();

    if ((ctx = canvas.getContext && canvas.getContext('2d'))) {

      initialFaceData.forEach(function(f, i) {
        if (i > MAX_FACE_NUM) return;
        var img = new Image();
        img.src = hametsu.Face.getAPIBase() + f;
        faces.push(createFace({
          img : img
        }));
      });

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

      if (i > len-11) {
        tmpSize = tmpSize + 50 + Math.random()*10;
        var tt = len-i;
        tmpX = tt*100%WIDTH + Math.random()*5;
        tmpY = tt*100%HEIGHT + Math.random()*5;
      }
      //console.info('drawImage', face.img.src, tmpX, tmpY, tmpSize, tmpSize);
      ctx.drawImage(face.img, tmpX, tmpY, tmpSize, tmpSize)
    }
  }
})(window.hametsu);

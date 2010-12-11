(function(namespace) {

  // INTERFACE
  namespace.F2DController = {
    start : canvasStart
  }

  const MAX_FACE_NUM = 3;
  const INTERVAL = 33;
  var ctx;
  var WIDTH;
  var HEIGHT;
  var speedX = [];
  var speedY = [];
  var locX = [];
  var locY = [];
  var size = [];
  var imgs = [];

  function canvasStart(canvasName, faces) {
    var canvas = document.getElementById(canvasName);
    WIDTH = $(canvas).width();
    HEIGHT = $(canvas).height();

    if ((ctx = canvas.getContext && canvas.getContext('2d'))) {

      faces.forEach(function(f, i) {
        var img = new Image();
        img.src = hametsu.Face.getAPIBase() + f;
        imgs[i] = img;
        speedX[i] = Math.random() * 8.0 - 4.0;
        speedY[i] = Math.random() * 8.0 - 4.0;
        locX[i] = WIDTH / 2;
        locY[i] = HEIGHT / 2;
        size[i] = Math.random() * 40.0 + 20.0;
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
      imgs.push(img);
      speedX.push(Math.random() * 8.0 - 4.0);
      speedY.push(Math.random() * 8.0 - 4.0);
      locX.push(WIDTH / 2);
      locY.push(HEIGHT / 2);
      size.push(Math.random() * 40.0 + 20.0);

      if (imgs.length > MAX_FACE_NUM) {
        console.info('reduce images!!!!!!!!');
        imgs.shift();
        speedX.shift();
        speedY.shift();
        locX.shift();
        locY.shift();
        size.shift();
      }
    });
  }

  function draw() {

    ctx.globalCompositeOperation = "source-over";
    //ctx.fillStyle = "rgba(8,8,12,0.1)";
    //ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.globalCompositeOperation = "lighter";

    for (var i=0, len=imgs.length; i<len; i++) {
      locX[i] += speedX[i];
      locY[i] += speedY[i];

      if(locX[i] < 0 || locX[i] > WIDTH){
        speedX[i] *= -1.0;
      }

      if(locY[i] < 0 || locY[i] > HEIGHT){
        speedY[i] *= -1.0;
      }
      ctx.drawImage(imgs[i], locX[i], locY[i], size[i], size[i])
    }
  }
})(window.hametsu);

(function() {
var NUM = 200;
var WIDTH;
var HEIGHT;
var speedX = new Array(NUM);
var speedY = new Array(NUM);
var locX = new Array(NUM);
var locY = new Array(NUM);
var size = new Array(NUM);
var ctx;
var imgs = [];

function canvasStart(faces) {
  var canvas = document.getElementById('2d');
  WIDTH = $(canvas).width();
  HEIGHT = $(canvas).height();


  faces.forEach(function(f) {
    var img = new Image();
    img.src = hametsu.Face.getAPIBase() + f;
    imgs.push(img);
  });

  if ((ctx = canvas.getContext && canvas.getContext('2d'))) {

    for (var i=0; i<NUM; i++) {
      speedX[i] = Math.random() * 8.0 - 4.0;
      speedY[i] = Math.random() * 8.0 - 4.0;
      locX[i] = WIDTH / 2;
      locY[i] = HEIGHT / 2;
      size[i] = Math.random() * 40.0 + 20.0;
    }
    setInterval(draw, 33);

  }
}

function handleNewFace(data) {
  data.faces.forEach(function(f) {
    imgs.pop();
    var img = new Image();
    img.src = hametsu.Face.getAPIBase() + f;
    imgs.push(img);
  });
}

function draw() {


  ctx.globalCompositeOperation = "source-over";
  //ctx.fillStyle = "rgba(8,8,12,0.1)";
  //ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.globalCompositeOperation = "lighter";

  for (var i=0; i<NUM; i++) {
    locX[i] += speedX[i];
    locY[i] += speedY[i];


    if(locX[i] < 0 || locX[i] > WIDTH){
      speedX[i] *= -1.0;
    }

    if(locY[i] < 0 || locY[i] > HEIGHT){
      speedY[i] *= -1.0;
    }


    ctx.drawImage(imgs[i], locX[i], locY[i], size[i], size[i])
    hametsu.Face.on(handleNewFace);
  }
}
window.start2D = canvasStart;
})();

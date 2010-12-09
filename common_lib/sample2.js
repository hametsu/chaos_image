function webGLStart() {

  //API base is setted http://localhost:4567 by default
  //hametsu.Face.setAPIBase('http://192.168.1.16:4567/');

  hametsu.Face.on(handleNewFace);
  hametsu.Face.startTimer();
}

function handleNewFace(data) {
  data.faces.forEach(function(f) {
    var imageUrl = hametsu.Face.getAPIBase() + f;
    var image = document.createElement('image');
    var firstImg;
    image.src = imageUrl;
    if ((firstImg = document.querySelector('body img'))) {
      document.body.insertBefore(image, firstImg);
    } else {
      document.body.appendChild(image);
    }
  });
}


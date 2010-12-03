function webGLStart() {

  //API base is setted http://localhost:4567 by default
  //hametsu.Face.setAPIBase('http://192.168.10.174:4567/');

  hametsu.Face.on(handleNewFace);
  hametsu.Face.startTimer();
}

function handleNewFace(data) {
  data.faces.forEach(function(f) {
    var imageUrl = hametsu.Face.getAPIBase() + f;
    var image = document.createElement('image');
    image.src = imageUrl;
    document.body.appendChild(image);
  });
}


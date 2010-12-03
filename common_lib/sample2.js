function webGLStart() {
  hametsu.face.on(handleNewFace);
  hametsu.face.startTimer();
}

function handleNewFace(data) {
  data.faces.forEach(function(f) {
    var imageUrl = hametsu.face.API_BASE + f;
    var image = document.createElement('image');
    image.src = imageUrl;
    document.body.appendChild(image);
  });
}


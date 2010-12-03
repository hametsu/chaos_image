function webGLStart() {
  hametsu.Face.on(handleNewFace);
  hametsu.Face.startTimer();
}

function handleNewFace(data) {
  data.faces.forEach(function(f) {
    var imageUrl = hametsu.Face.API_BASE + f;
    var image = document.createElement('image');
    image.src = imageUrl;
    document.body.appendChild(image);
  });
}


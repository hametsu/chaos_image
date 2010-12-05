$(function() {

  function setupFaceLoader() {

    /*
    hametsu.Face.on(function(data) {
      console.dir(data);
      faces = faces.concat(data.faces);
      var queue = new AsyncQueue({name : 'buffer'});
      faces.forEach(function(f) {
        queue.push({
          fn : initObjects,
          args : [hametsu.Face.getAPIBase() + f],
          delay : 3000
        });
      });
      console.info('create queue');
    });
    hametsu.Face.setAPIBase("http://192.168.32.202:4567/");
    hametsu.Face.startTimer();
    */
  }

  hametsu.Face.getFaces(function(rs) {
    console.dir(rs);
    start2D(rs.faces);
    start3D(rs.faces);
  });
  
});

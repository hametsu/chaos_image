/**
 * Bootstrap for Chaos visiter's face viewer
 *
 */
$(function() {

  var wHeight = $(window).height();
  var wWidth = $(window).width();

  // For canvas2D
  var canvas2d = document.createElement('canvas');
  $(canvas2d).attr({
    width : wWidth,
    height : wHeight,
    id : '2d'
  }).css({
    zIndex : 1
  }).appendTo(document.body);

  // For webGL
  var canvas3d = document.createElement('canvas');
  $(canvas3d).attr({
    width : wWidth,
    height : wHeight,
    id : '3d'
  }).css({
    zIndex : 0
  }).appendTo(document.body);

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

  //hametsu.Face.setAPIBase("http://192.168.1.16:4567/");
  hametsu.Face.setAPIBase("http://localhost:4567/");
  hametsu.Face.getFaces(function(rs) {
    console.dir(rs);
    rs.faces.reverse();
    hametsu.F2DController.start('2d', rs.faces);
    hametsu.F3DController.start('3d', rs.faces);
    hametsu.Face.startTimer();
  });
  
});

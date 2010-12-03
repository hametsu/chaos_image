(function(namespace) {

  const INTERVAL = 4000;
  const API_BASE = 'http://localhost:4567/';
  const API = API_BASE + 'after/';

  //////////////////////////////////////////////////
  // Interface
  //////////////////////////////////////////////////
  namespace.face = {
    getFaces : getFaces,
    on : on,
    un : un,
    purgeListenres : purgeListeners,
    startTimer : startTimer,
    stopTimer : stopTimer,
    API_BASE : API_BASE
  }

  //////////////////////////////////////////////////
  // Implementation
  //////////////////////////////////////////////////
  var unixTime = '1171815102'; // An enough old time for first time

  function getFaces(callback) {
    var url = API + unixTime;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function(){
      if ( xhr.readyState == 4 ) {
        if ( xhr.status == 200 ) {
          var data = JSON.parse(xhr.responseText);
          unixTime = data.time;
          callback(data);
        } else {
          callback({faces:[]});
        }
      }
    };
    xhr.send(null);
  }


  var timerId;
  var fns = [];

  function startTimer() {
    timerId = setTimeout(function() {
      getFaces(function(ret) {
        if (ret.faces.length > 0) {
          fns.forEach(function(f) {
            f(ret);
          });
        }
        startTimer();
      });
    }, INTERVAL);
  }

  function stopTimer() {
    clearTimeout(timerId);
  }

  function on(fn) {
    fns.push(fn);
  }

  function un(fn) {
    var filterdFns = fns.filter(function(f) {
      return f !== fn
    });
    fns = filterdFns;
  }

  function purgeListeners() {
    fns = [];
  }

})((function(){
  if (!window.hametsu) {
    window.hametsu = {};
  }
  return window.hametsu;
})());

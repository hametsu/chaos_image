(function(namespace) {

  //////////////////////////////////////////////////
  // Interface
  //////////////////////////////////////////////////
  namespace.Face = {
    getFaces : getFaces,
    on : on,
    un : un,
    purgeListenres : purgeListeners,
    startTimer : startTimer,
    stopTimer : stopTimer,
    getAPIBase : getAPIBase,
    setAPIBase : setAPIBase
  }

  //////////////////////////////////////////////////
  // Implementation
  //////////////////////////////////////////////////

  var INTERVAL = 3000;
  var apiBase = 'http://localhost:4567/';

  function getAPIBase() {
    return apiBase;
  }

  function setAPIBase(base) {
    apiBase = base;
  }

  var unixTime = '1171815102'; // An enough old time for first time
  function getFaces(callback) {
    var url = apiBase + 'after/' + unixTime;

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

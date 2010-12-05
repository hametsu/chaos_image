/**
 * Queueing asyncronous functions. And calls them syncronous.
 *
 * @version: 0.1(2010-06-06)
 * @author hagino3000 <http://twitter.com/hagino3000> (Takashi Nishibayashi)
 *
 * Usage:
 * var queue = new AsyncQueue({ name : 'notification' });
 *
 * queue.push({
 *   // latest argument is callback function
 *   fn : function(a, b, callback) {
 *     doAsync(function(result) {
 *       callback(result);
 *     }
 *   },
 *   callback : function(result) {
 *     print(result)
 *   }
 * }
 *
 * queue.push({
 *   ...
 * });
 *
 * See more info test/test.js.
 *
 *
 */
AsyncQueue = function(config) {
  AsyncQueue.prototype.initialize.call(this, config);
}

AsyncQueue.prototype = {
  initialize : function(config) {
    this.name = config.name;
    this.running = false;
    this.queue = [];
  },

  /**
   * @param (Object, Function) fnConf
   *
   * Object properties
   * @param fn Function (requre)
   * @param scope Object Scope for fn (default : null)
   * @param delay Number Delay to Start fn (default : 0)
   * @param args Array Arguments for fn (default : [])
   * @param callback Function Callback function (default : null)
   *
   */
  push : function(fnConf) {
    if (typeof(fnConf) == 'function' || fnConf instanceof Function) {
      fnConf = { fn : fnConf }
    }

    this.queue.push({
      fn : fnConf.fn,
      scope : fnConf.scope || null,
      delay : fnConf.delay || 0,
      args : fnConf.args || [],
      callback : fnConf.callback
    });
    if (!this.running) {
      this._exec();
    }
  },

  _exec : function() {
    var self = this;

    this.running = true;
    var q = this.queue.shift();
    if (q.callback) {
      q.args.push(createCallback());
    }
    setTimeout(function(){
      q.fn.apply(q.scope, q.args);
      if (!q.callback) {
        self._next();
      }
    }, q.delay);

    function createCallback() {
      return function(){
        self._next();
        var args = Array.prototype.slice.call(arguments);
        q.callback.apply(q.scope, args);
      }
    }
  },

  _next : function() {
    if (this.queue.length > 0) {
      this._exec();
    } else {
      this.running = false;
    }
  }
}


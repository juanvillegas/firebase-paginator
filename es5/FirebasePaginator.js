'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable */

var _FirebasePaginatorFiniteStrategy = require('./FirebasePaginatorFiniteStrategy');

var _FirebasePaginatorFiniteStrategy2 = _interopRequireDefault(_FirebasePaginatorFiniteStrategy);

var _FirebasePaginatorInfiniteStrategy = require('./FirebasePaginatorInfiniteStrategy');

var _FirebasePaginatorInfiniteStrategy2 = _interopRequireDefault(_FirebasePaginatorInfiniteStrategy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FirebasePaginator = function () {
  function FirebasePaginator(ref, defaults) {
    var _this = this;

    _classCallCheck(this, FirebasePaginator);

    this.defaults = defaults || {};
    this.pages = {};
    this.pageSize = defaults.pageSize ? parseInt(defaults.pageSize, 10) : 10;
    this.isFinite = defaults.finite ? defaults.finite : false;
    this.retainLastPage = defaults.retainLastPage || false;
    this.auth = defaults.auth;
    this.ref = ref;
    this.isBrowser = defaults.isBrowser;
    this.events = {};
    this.pageCount;

    // Events
    this.listen = function (callback) {
      _this.allEventHandler = callback;
    };

    this.fire = this.fire.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.once = this.once.bind(this);

    // Pagination can be finite or infinite. Infinite pagination is the default.
    var paginator = this;
    if (this.isFinite) {
      //this.setupFinite();
      this.strategy = new _FirebasePaginatorFiniteStrategy2.default(paginator);
    } else {
      this.strategy = new _FirebasePaginatorInfiniteStrategy2.default(paginator);
    }

    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goToPage = this.goToPage.bind(this);

    console.log('FirebasePaginator constructor this: ', this);
  }

  _createClass(FirebasePaginator, [{
    key: 'fire',
    value: function fire(eventName, payload) {
      if (typeof this.allEventHandler === 'function') {
        this.allEventHandler.call(this, eventName, payload);
      }

      if (this.events[eventName] && this.events[eventName].queue) {
        var queue = events[eventName].queue.reverse();
        var i = queue.length;
        while (i--) {
          if (typeof queue[i] === 'function') {
            queue[i].call(this, payload);
          }
        }
      }
    }
  }, {
    key: 'on',
    value: function on(eventName, callback) {
      if (!this.events[eventName]) {
        this.events[eventName] = {
          queue: []
        };
      }
      this.events[eventName].queue.push(callback);
    }
  }, {
    key: 'off',
    value: function off(eventName, callback) {
      if (this.events[eventName] && this.events[eventName].queue) {
        var queue = this.events[eventName].queue;
        var i = queue.length;
        while (i--) {
          if (queue[i] === callback) {
            queue.splice(i, 1);
          }
        }
      }
    }
  }, {
    key: 'once',
    value: function once(eventName, callback) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var handler = function handler(payload) {
          _this2.off(eventName, handler);
          if (typeof callback === 'function') {
            try {
              resolve(callback.call(_this2, payload));
            } catch (e) {
              reject(e);
            }
          } else {
            resolve(payload);
          }
        };
        _this2.on(eventName, handler);
      });
    }

    // strategies based on finite or infinite

  }, {
    key: 'next',
    value: function next() {
      return this.strategy.next();
    }
  }, {
    key: 'previous',
    value: function previous() {
      return this.strategy.previous();
    }
  }, {
    key: 'reset',
    value: function reset() {
      return this.strategy.reset();
    }
  }, {
    key: 'goToPage',
    value: function goToPage(pageNumber) {
      console.log('access this.strategy', this.strategy);

      if (isFinite) return this.strategy.goToPage(pageNumber);else return new Promise(function (resolve, reject) {
        reject({ message: 'infinite does not support paging' });
      });
    }
  }]);

  return FirebasePaginator;
}();

exports.default = FirebasePaginator;
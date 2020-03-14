'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /* eslint-disable */


var FinitePagingStrategy = function FinitePagingStrategy(paginator) {
  var _this = this;

  _classCallCheck(this, FinitePagingStrategy);

  this.paginator = paginator;

  // finite pagination
  var queryPath = this.paginator.ref.toString() + '.json?shallow=true';
  if (this.paginator.auth) {
    queryPath += '&auth=' + this.paginator.auth;
  }
  var getKeys = function getKeys() {
    if (_this.paginator.isBrowser) {
      return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
          if (request.readyState === 4) {
            var response = JSON.parse(request.responseText);
            if (request.status === 200) {
              resolve(Object.keys(response || {}));
            } else {
              reject(response);
            }
          }
        };
        request.open('GET', queryPath, true);
        request.send();
      });
    } else {
      return _axios2.default.get(queryPath).then(function (res) {
        return Object.keys(res.data || {});
      });
    }
  };

  this.goToPage = function (pageNumber) {
    var self = _this.paginator;

    pageNumber = Math.min(self.pageCount, Math.max(1, parseInt(pageNumber)));

    var query = void 0;

    if (Object.keys(self.pages || {}).length) {
      // Null check for empty collections
      self.page = self.pages[pageNumber];
      self.pageNumber = pageNumber;
      self.isLastPage = pageNumber === Object.keys(self.pages).length;
      query = self.ref.orderByKey().limitToLast(self.pageSize).endAt(self.page.endKey);
    } else {
      query = self.ref.orderByKey().limitToLast(self.pageSize);
    }

    return query.once('value').then(function (snap) {
      var collection = snap.val();
      var keys = [];

      snap.forEach(function (childSnap) {
        keys.push(childSnap.key);
      });

      self.snap = snap;
      self.keys = keys;
      self.collection = collection || {};

      self.fire('value', snap);
      if (paginator.isLastPage) {
        self.fire('isLastPage');
      }
      return paginator;
    });
  };

  this.reset = function () {
    return getKeys().then(function (keys) {
      var orderedKeys = keys.sort();
      var keysLength = orderedKeys.length;
      var cursors = [];

      for (var i = keysLength; i > 0; i -= self.pageSize) {
        cursors.push({
          fromStart: {
            startRecord: i - self.pageSize + 1,
            endRecord: i
          },
          fromEnd: {
            startRecord: keysLength - i + 1,
            endRecord: keysLength - i + self.pageSize
          },
          endKey: keys[i - 1]
        });
      }

      var cursorsLength = cursors.length;
      var k = cursorsLength;
      var pages = {};
      while (k--) {
        cursors[k].pageNumber = k + 1;
        pages[k + 1] = cursors[k];
      }
      paginator.pageCount = cursorsLength;
      paginator.pages = pages;

      return pages;
    }).catch(function (err) {
      console.log('finite reset pagination error', err);
    });
  };

  var self = paginator;

  this.reset() // Refresh keys and go to first page.
  .then(function () {
    return self.goToPage(1);
  }).then(function () {
    self.fire('ready', self);
  });

  this.previous = function () {
    var self = paginator;
    return self.goToPage(Math.min(self.pageCount, self.pageNumber + 1)).then(function () {
      return self.fire('previous');
    });
  };

  this.next = function () {
    return _this.goToPage(Math.max(1, _this.pageNumber - 1)).then(function () {
      return fire('next');
    });
  };
};

exports.default = FinitePagingStrategy;
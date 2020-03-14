'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /* eslint-disable */


var InfinitePagingStrategy = function InfinitePagingStrategy(paginator) {
  var _this = this;

  _classCallCheck(this, InfinitePagingStrategy);

  // infinite pagination
  this.paginator = paginator;

  var setPage = function setPage(cursor, isForward, isLastPage) {
    var self = _this.paginator;

    var query = void 0;

    query = self.ref.orderByKey();

    // If there it's forward pagination, use limitToFirst(pageSize + 1) and startAt(theLastKey)

    if (self.isForward) {
      // forward pagination
      self.ref = self.ref.limitToFirst(self.pageSize + 1);
      if (cursor) {
        // check for forward cursor
        query = self.ref.startAt(cursor);
      }
    } else {
      // previous pagination
      query = self.ref.limitToLast(self.pageSize + 1);
      if (cursor) {
        // check for previous cursor
        query = self.ref.endAt(cursor);
      }
    }

    return query.once('value').then(function (snap) {
      var keys = [];
      var collection = {};

      cursor = undefined;

      snap.forEach(function (childSnap) {
        keys.push(childSnap.key);
        if (!cursor) {
          cursor = childSnap.key;
        }
        collection[childSnap.key] = childSnap.val();
      });

      if (keys.length === self.pageSize + 1) {
        if (isLastPage) {
          delete collection[keys[keys.length - 1]];
        } else {
          delete collection[keys[0]];
        }
      } else if (isLastPage && keys.length < self.pageSize + 1) {
        // console.log('tiny page', keys.length, pageSize);
      } else if (isForward) {
        return setPage(); // force a reset if forward pagination overruns the last result
      } else if (!self.retainLastPage) {
        return setPage(undefined, true, true); // Handle overruns
      } else {
        isLastPage = true;
      }

      self.snap = snap;
      self.keys = keys;
      self.isLastPage = isLastPage || false;
      self.collection = collection;
      self.cursor = cursor;

      self.fire('value', snap);
      if (self.isLastPage) {
        self.fire('isLastPage');
      }
      return _this;
    });
  };

  var self = paginator;

  setPage().then(function () {
    self.fire('ready', paginator);
  }); // bootstrap the list

  this.reset = function () {
    return setPage().then(function () {
      return self.fire('reset');
    });
  };

  this.previous = function () {
    return setPage(self.cursor).then(function () {
      return self.fire('previous');
    });
  };

  this.next = function () {
    var cursor;
    if (self.keys && self.keys.length) {
      cursor = self.keys[self.keys.length - 1];
    }
    return setPage(cursor, true).then(function () {
      return self.fire('next');
    });
  };
};

exports.default = InfinitePagingStrategy;
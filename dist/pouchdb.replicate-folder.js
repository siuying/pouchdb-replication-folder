'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replicateFolder = replicateFolder;

var _pouchUtils = require('./pouch-utils');

var _pouchUtils2 = _interopRequireDefault(_pouchUtils);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _pouchdbReplicationStream = require('pouchdb-replication-stream');

var _pouchdbReplicationStream2 = _interopRequireDefault(_pouchdbReplicationStream);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// simply export current db to path
function exportFolder(db, dbPath) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var outstream = _fs2["default"].createWriteStream(dbPath, { encoding: 'utf8' });
  return db.dump(outstream, options);
}

function mkdirp2(dir) {
  var promise = new Promise(function (resolve, reject) {
    (0, _mkdirp2["default"])(dir, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
  return promise;
}

function replicateFolder(replicatePath, dbId, currentUserId) {
  var pouch = this;
  var userDbPath = _path2["default"].join(dbPath, 'users', currentUserId);
  return mkdirp2(userDbPath).then(function () {
    return exportFolder(pouch, userDbPath, callback);
  });
}


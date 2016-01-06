import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import replicationStream from 'pouchdb-replication-stream'
import through2 from 'through2'
import lastLine from 'last-line'

function mkdirp2(dir) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve(dir)
      }
    })
  })
}

function databasePath(replicatePath, dbId, userId) {
  return path.join(replicatePath, dbId, 'users', userId)
}

function dumpFilePath(replicatePath, dbId, userId, sinceId) {
  return path.join(replicatePath, dbId, 'users', userId, `${sinceId}.log`)
}

// simply export current db to path
function exportFolder(replicatePath, dbId, currentUserId, options={since: 0}) {
  console.log("exportFolder", replicatePath, dbId, currentUserId, options)
  var db = this
  var PouchDB = this.constructor
  PouchDB.plugin(replicationStream.plugin)
  PouchDB.adapter('writableStream', replicationStream.adapters.writableStream)

  var {since} = options
  var userDbPath = databasePath(replicatePath, dbId, currentUserId)
  return mkdirp2(userDbPath).then(() => {
    var path = dumpFilePath(replicatePath, dbId, currentUserId, since)
    var outstream = fs.createWriteStream(path, { encoding: 'utf8' })
    return db.dump(outstream, options)
  })
}

function watchDbAndExportFolder(replicatePath, dbId, userId, options={since: 0}) {
  var db = this
  var {since} = options

  return new Promise((resolve, reject) => {
    var options = {
      since: since,
      include_docs: true
    }
    var changeObject = db.changes(options).on('change', (changes) => {
      const sequence = changes.seq
      exportFolder.bind(db)(replicatePath, dbId, userId, {since: sequence})
    }).on('error', (err) => {
      reject(err)
    })
    resolve({changes: changeObject})
  })
}

// replicate a folder
// return an object that have a cancel() method, to cancel replication
function replicateFolder(replicatePath, dbId, currentUserId, options={since: 0}) {
  var db = this
  var PouchDB = this.constructor
  var {since} = options
  PouchDB.plugin(replicationStream.plugin)
  PouchDB.adapter('writableStream', replicationStream.adapters.writableStream)

  var userDbPath = databasePath(replicatePath, dbId, currentUserId)
  return mkdirp2(userDbPath).then(() => {
    var path = dumpFilePath(replicatePath, dbId, currentUserId, since)
    return exportFolder.bind(db)(replicatePath, dbId, currentUserId, {since: since}).then((result) => {
      return watchDbAndExportFolder.bind(db)(replicatePath, dbId, currentUserId, {since: 2})
    })
  })
}

export default {
  plugin: {
    exportFolder,
    replicateFolder,
  }
}

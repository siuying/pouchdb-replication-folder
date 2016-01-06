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
        resolve()
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

// replicate a folder
// return a promise that has a object that have a cancel() method, to cancel replication
function replicateFolder(replicatePath, dbId, currentUserId, options={since: 0}) {
  var db = this
  var PouchDB = this.constructor
  var {since} = options
  PouchDB.plugin(replicationStream.plugin)
  PouchDB.adapter('writableStream', replicationStream.adapters.writableStream)

  var userDbPath = databasePath(replicatePath, dbId, currentUserId)
  return mkdirp2(userDbPath).then(() => {
    // 1. export folder
    // 2. watch the db and export folder when its change

    var path = dumpFilePath(replicatePath, dbId, currentUserId, since)
    var exportPromise = exportFolder.bind(this)(replicatePath, dbId, currentUserId, {since: since}).then((result) => {
      return new Promise((resolve, reject) => {
        lastLine(path, (err, res) => {
          if (err) {
            reject(err)
            return
          }

          var {seq} = JSON.parse(res)
          var changeObject = db.changes({
            since: seq,
            include_docs: true
          }).on('change', (changes) => {
            const sequence = changes[0].seq
            exportFolder.bind(this)(db, userDbPath, {sequence})

          }).on('complete', (info) => {
            // changes() was canceled

          }).on('error', (err) => {
            reject(err)
          })

          resolve(changeObject)
        })
      })
    })
    return exportPromise
  })
}

export default {
  plugin: {
    exportFolder,
    replicateFolder,
  }
}

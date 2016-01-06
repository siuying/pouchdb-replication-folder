import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import replicationStream from 'pouchdb-replication-stream'
import through2 from 'through2'

function mkdirp2(dir) {
  const promise = new Promise((resolve, reject) => {
    mkdirp(dir, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
  return promise
}

// simply export current db to path
function exportFolder(replicatePath, dbId, currentUserId, options={since: 0}) {
  const db = this
  const PouchDB = this.constructor
  PouchDB.plugin(replicationStream.plugin)
  PouchDB.adapter('writableStream', replicationStream.adapters.writableStream)

  const {since} = options
  const userDbPath = path.join(replicatePath, dbId, 'users', currentUserId)
  return mkdirp2(userDbPath).then(() => {
    const dumpFilePath = path.join(userDbPath, `${since}.log`)
    const outstream = fs.createWriteStream(dumpFilePath, { encoding: 'utf8' })
    return db.dump(outstream, options)
  })
}

function replicateFolder(replicatePath, dbId, currentUserId) {
  const db = this
  const PouchDB = this.constructor
  PouchDB.plugin(replicationStream.plugin)
  PouchDB.adapter('writableStream', replicationStream.adapters.writableStream)

  const userDbPath = path.join(dbPath, 'users', currentUserId)
  return mkdirp2(userDbPath).then(() => {
    const exportPromise = exportFolder(db, userDbPath).then(() => {
      const changePromise = db.changes({
        since: 0,
        include_docs: true
      }).then((changes) => {
        const sequence = changes[0].seq
        return exportFolder(db, userDbPath, {sequence})
      })
      return changePromise
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

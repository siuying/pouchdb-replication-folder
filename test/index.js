import mocha from 'mocha'
import { expect } from 'chai'

import path from 'path'
import fs from 'fs'
import tmp from 'tmp'
import memdown from 'memdown'
import lastLine from 'last-line'

import replicationStream from 'pouchdb-replication-stream'
import replicateFolder from '../src'
import PouchDB from 'pouchdb'
import PouchStream from 'pouch-stream'
import {deleteFolderRecursive} from './utils'

PouchDB.plugin(replicateFolder.plugin)
PouchDB.debug.enable('*')

describe('pouchdb-replicate-folder', () => {
  var db = null

  beforeEach(() => {
  })

  afterEach(() => {
  })

  describe('#exportFolder', () => {
    it('should export db to folder, with seq', (done) => {
      var tempDir = tmp.dirSync()
      var db = new PouchDB('test', {db: memdown})
      db.put({
        _id: 'dave@gmail.com',
        name: 'David',
        age: 68
      })
      db.put({
        _id: 'joe@gmail.com',
        name: 'Joe',
        age: 28
      })

      db.exportFolder(tempDir.name, 'database', 'user1').then(() => {
        const fullPath = path.join(tempDir.name, 'database', 'users', 'user1', '0.log')
        lastLine(fullPath, (err, res) => {
          const data = JSON.parse(res)
          expect(data).to.deep.equal({seq: 2})
          deleteFolderRecursive(tempDir.name)
          done()
        })

      }).catch((error) => {
        deleteFolderRecursive(tempDir.name)
        fail(error)

      })
    })
  })
})

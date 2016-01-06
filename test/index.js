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
//PouchDB.debug.enable('*')

describe('pouchdb-replicate-folder', () => {
  var db = null

  beforeEach(() => {
    db = new PouchDB('test', {db: memdown})
  })

  afterEach(() => {
    db = null
  })

  describe('#exportFolder', () => {
    it('should export db to folder', (done) => {
      var tempDir = tmp.dirSync()

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
          var data = JSON.parse(res)
          expect(data).to.deep.equal({seq: 2})

          db.put({
            _id: 'john@gmail.com',
            name: 'john',
            age: 18
          })

          deleteFolderRecursive(tempDir.name)
          done()
        })
      }).catch((error) => {
        deleteFolderRecursive(tempDir.name)
        fail(error)
      })
    })

    it('should export db to folder with since sequence number', (done) => {
      var tempDir = tmp.dirSync()

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
      db.put({
        _id: 'john@gmail.com',
        name: 'john',
        age: 18
      })

      db.exportFolder(tempDir.name, 'database', 'user1', {since: 2}).then(() => {
        const fullPath = path.join(tempDir.name, 'database', 'users', 'user1', '2.log')
        const lines = fs.readFileSync(fullPath).toString().split('\n')
        expect(JSON.parse(lines[1])).to.deep.equal({seq: 2})
        expect(JSON.parse(lines[2]).docs[0]._id).to.deep.equal("john@gmail.com")
        expect(JSON.parse(lines[3])).to.deep.equal({seq: 3})
        deleteFolderRecursive(tempDir.name)
        done()
      }).catch((error) => {
        deleteFolderRecursive(tempDir.name)
        fail(error)
      })
    })
  })

  describe('#replicateFolder', () => {
    it('should export db to folder', (done) => {
      var tempDir = tmp.dirSync()
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

      db.replicateFolder(tempDir.name, 'replicate-test', 'user1').then((result) => {
        console.log("result", result)
        db.put({
          _id: 'kelvin@gmail.com',
          name: 'Kelvin',
          age: 33
        })
        result.cancel()
        deleteFolderRecursive(tempDir.name)
        done()

      }).catch((error) => {
        deleteFolderRecursive(tempDir.name)
        fail(error)
      })
    })
  })
})

import mocha from 'mocha'
import expect from 'expect.js'
import * as replicate from '../src'
import PouchDB from 'pouchdb'
import tmp from 'tmp'

console.log("replicate", replicate)
PouchDB.plugin(replicate)

describe('pouchdb-replicate-folder', () => {
  var db = null

  beforeEach(() => {
  })

  afterEach(() => {
  })

  describe('#exportFolder', () => {
    it('should export db to folder', (done) => {
      var tempDir = tmp.dirSync()
      console.log("folder:", tempDir.name)

      var db = new PouchDB('test', {adapter: 'memory'})
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
        tempDir.removeCallback()
        done()

      }).catch((error) => {
        tempDir.removeCallback()
        fail(error)

      })
    })
  })
})

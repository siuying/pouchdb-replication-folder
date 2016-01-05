# PouchDB Replication with Folder

Safely replicate PouchDB/CouchDB with multiple clients, using a shared folder.

## Usage

Assume you have a database want to sync to ~/Dropbox/Apps/MyApp/Database

```javascript
var dbId = 'myDb'
var userId = UUID.v4()
var db1 = new PouchDB(dbId)
db1.replicateFolder(dropboxAppPath, dbId, userId).then((res) => {
     // on update
}).catch((error) => {
     // error occurred
})
```

on another computer, run the same code using a same dbID and different userID, and two databases should sync.


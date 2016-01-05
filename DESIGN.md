## Design

### replicateFolder(path, dbId, currentUserId)

1. Check if folder ":path/:dbId" exists, if not, create it
2. Check if folder ":path/:dbId/users" exists, if not, create it
3. For each of the folders under ":path/:dbId/users/:userId"
  1. If currentUserId == userId, skip this folder
  2. Otherwise, importFolder(path, dbId, userId)
  3. If import succeed, set the returned value as current folder lastSequenceId
  4. Watch any changes in the folder, on change, import folder with importFolder(path, dbId, userId, lastSequenceId)
4. Check if folder "path/dbId/users/:currentUserId" exists, if not, create it
  1. exportFolder(path, dbId, currentUserId)
  2. For any change in database, exportFolder(path, dbId, currentUserId)

### importFolder(path, dbId, userId, lastSequenceId=0)

1. Check if there files "path/:dbId/users/:userId/*.json"
2. If there exists files, sort the files by name numerically
3. For each files
  1. Check the sequence number of the file, if the lastSequenceId > sequence number, the skip the file
  2. Otherwise, load the file and update lastSequenceId
5. return lastSequenceId

### exportFolder(path, dbId, userId)

1. Check if there files path/:dbId/users/:userId/*.json"
2. If there exists files, sort the files by name numerically, and find the largest number, set it as sequenceId
3. Export database with sequenceId, and write file as latestSequenceId.json
4. return latestSequenceId
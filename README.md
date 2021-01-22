# MongoDB User Stores for NodeJS

MongoDB Store Implementation of Users and UserTokens for NodeJS 

## Usage

```javascript
import { UserStore, UserTokenStore } from "@frappy/js-mongo-user-store"
import mongodb from "mongodb"

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017"
// create mongoDB connection
mongodb.MongoClient.connect(MONGO_URL, {
    useNewUrlParser: true,
}).then(client => {
    // initialise store
    const userStore = new UserStore(client, "myDatabaseName", "users")
    const userTokenStore = new UserTokenStore(client, "myDatabaseName", "userTokens")
    
    userStore.login("myusername", "mypassword").then(loggedInUser => { 
        if (loggedInUser == null) {
            console.log("Login Failed")
        }
    })
    userTokenStore.removeExpired(new Date().getTime() - 24 * 60 * 60 * 1000)
})
```

## Methods

**User Store**

- `login(username, password)` - local login attempt, will md5 encode the provided password and try to match against the
 database. This will either return `null`, if the login failed or the user if it succeeded.
- `getByUsername(username)` - returns a single user or `null` that matches the requested `username` (local user).
- `getByUid(uid)` - returns a single user or `null` that matches the requested `uid` attribute.
- `updatePermissions(userId, permissions)` - updates the permissions array of a given user (overwrite)
- `updateProfile(userId, updateProfile)` - updates the `profile` key of a user. This is not an officially supported key,
 but offers to store additional information with the user relevant to your application.
- `changePassword(userId, newPassword)` - this method will update a given user's password. The password will be md5 
 encrypted before being stored.
- `initialLocalUserCheck(initialUsername, initialPassword, initialPermissions = ["admin"])` - this method is supposed to 
 be used for applications using local users on startup. The method will check whether there are any users in the system
 at all. If there are no users available, it will create a user with the provided credentials and permissions.
- `createLocalUser(username, password, permissions = [])` - creates a new local user. The password will be md5 encrypted
 before being stored. Also, the username has to be unique.
- `createApiKey(userId)` - creates a new API key (16 alphanumeric) for the user provided by the user id and throws an 
 error if the user cannot be found. Will return the newly updated API key as string when the promise resolves.
- `revokeApiKey(userId)` - removes the API key for a user
- `getUsersWithApiKey`

**User Token Store**

- `removeExpired(maxCreationDate)` - removes any token that has been created before the max creation date. 
 `maxCreationDate` has to be a Unix timestamp in milliseconds.
- `storeToken(newToken, user)` - will store a new token associated to the given user. The `user` parameter has to be a
 user object with an `_id` attribute.
- `removeToken(token)` - simply removes a specific token from the database.
- `getUsersWithApiKey(paging)` - returns by default up to 100 users with an existing API key. This method should only be 
 used for administrative functions. The paging parameter behaves the same as for `find(..)`, where the paging is a JSON 
 object with `page` and `pageSize` key/values. Pages start with 0.

import MongoDbStore from "@frappy/js-mongo-store"

class UserTokenStore extends MongoDbStore {
    removeExpired(maxCreationDate) {
        return this.collection.deleteMany({
            creationTimestamp: { $lte: maxCreationDate },
        })
    }

    storeToken(newToken, user) {
        return this.insert({
            userId: user._id,
            token: newToken,
            creationTimestamp: new Date().getTime(),
        })
    }

    removeToken(token) {
        return this.collection.deleteOne({ token })
    }
}

export default UserTokenStore

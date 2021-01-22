import MongoDbStore from "@frappy/js-mongo-store"
import crypto from "crypto"
import randomstring from "randomstring"

/**
 * MD5 encodes a string. This is used to encode passwords in the database.
 * @param {string} string - a plain password
 * @returns {string} - an encoded password
 */
export const md5 = string =>
    crypto
        .createHash("md5")
        .update(string)
        .digest("hex")

class UserStore extends MongoDbStore {
    // for local users
    login(username, password) {
        return this.findOne({
            username,
            password: md5(password),
        })
    }

    // for local users
    getByUsername(username) {
        return this.findOne({ username })
    }

    // for users having a uid attribute
    getByUid(uid) {
        return this.findOne({ uid })
    }

    updatePermissions(userId, permissions) {
        return this.update(
            { _id: userId },
            {
                $set: {
                    permissions,
                },
            }
        )
    }

    updateProfile(userId, updateProfile) {
        return this.update(
            { _id: userId },
            {
                $set: {
                    profile: updateProfile,
                },
            }
        ).then(() => this.get(userId))
    }

    changePassword(userId, newPassword) {
        return this.update(
            { _id: userId },
            {
                $set: {
                    password: md5(newPassword),
                },
            }
        )
    }

    initialLocalUserCheck(initialUsername, initialPassword, initialPermissions = ["admin"]) {
        return this.count()
            .then(numberOfUsers => {
                if (numberOfUsers > 0) {
                    return null
                }
                return this.create({
                    username: initialUsername,
                    password: md5(initialPassword),
                    permissions: initialPermissions,
                })
            })
            .then(newUser => {
                if (newUser == null) {
                    return null
                }
                console.log(`Created initial user '${initialUsername}'`)
                return this.get(newUser)
            })
    }

    createLocalUser(username, password, permissions = []) {
        const newUser = {
            username,
            password: md5(password),
            permissions,
        }
        return this.getByUsername(username).then(existing => {
            if (existing != null) {
                throw Error("User already exists")
            }
            return this.create(newUser).then(userId => this.get(userId))
        })
    }

    createApiKey(userId) {
        return this.get(userId).then(existing => {
            if (existing == null) {
                throw Error(`Could not find user '${userId}'`)
            }
            const newKey = randomstring.generate(16)
            // perform update
            return this.update(
                { _id: existing._id },
                {
                    $set: {
                        apiKey: newKey,
                    },
                }
            ).then(() => newKey) // return new key
        })
    }

    revokeApiKey(userId) {
        return this.get(userId).then(existing => {
            if (existing == null) {
                throw Error(`Could not find user '${userId}'`)
            }
            // perform update
            return this.update(
                { _id: existing._id },
                {
                    $unset: {
                        apiKey: 1,
                    },
                }
            )
        })
    }

    getUsersWithApiKey(paging = { pageSize: 100, page: 0 }) {
        return this.find({ apiKey: { $exists: true } }, { password: 0 }, null, paging)
    }
}

export default UserStore

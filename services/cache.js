const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const key = require('../config/keys')
const client = redis.createClient(key.redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options= {}) {
    this._cache = true;
    this._hashKey =JSON.stringify( options.key || '');
    return this;
}

mongoose.Query.prototype.exec = async function () {
    console.log('Im about to run a query');

   if( !this._cache){
       return exec.apply(this, arguments);
   }

    const key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );

    console.log(key);

    const cacheValue = await client.hget(this._hashKey, key);
    if (cacheValue) {
        console.log('--------------');
        console.log(typeof cacheValue)
        // console.log(cacheValue);
        console.log('I am cacheValue');
        console.log('--------------');

        const doc =JSON.parse(cacheValue);
        return Array.isArray(doc) ? doc.map(d=> new this.model(d) ): new this.model(doc);
    }

    const result = await exec.apply(this, arguments);

    // console.log(result);
    console.log('I am not cacheValue');

    client.hset(this._hashKey, key, JSON.stringify(result));
    client.expire(this._hashKey, 10);
    return result;
}

module.exports = {
    clearHash(hashKey){
        client.del(JSON.stringify(hashKey));
    }
}

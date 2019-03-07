const AWS = require('aws-sdk');
const key = require('../config/keys');
const uuid =  require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin');

const s3 = new AWS.S3({
    accessKeyId:key.accessKeyId,
    secretAccessKey:key.secretAccessKey,
    signatureVersion: 'v4',
    region: 'eu-west-2'

});

module.exports = app =>{
    app.get('/api/upload',requireLogin,(req,res)=>{
        const key = `${req.user.id}/${uuid()}.mp4`;

        s3.getSignedUrl(
            'putObject',
                {
                    Bucket:'ziggy-upload-test',
                    ContentType:'video/mp4',
                    Key:key
                },
                (err,url)=> res.send({key,url})
        )
    })
}

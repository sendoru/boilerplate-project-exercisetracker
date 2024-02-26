const express = require('express')
const db = require('./src/db')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const {UserModel, ExerciseModel} = require('./src/schema')
const fs = require('fs')
const https = require('https')
const { getDefaultAutoSelectFamily } = require('net')
require('./src/schema')

require('dotenv').config()

const options = {
  key: fs.readFileSync('./rootca.key'),
  cert: fs.readFileSync('./rootca.crt')
};

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.json());	// json 등록
app.use(bodyParser.urlencoded({ extended : false }));	// URL-encoded 등록

app.post('/api/users', async (req, res) => {
    username = req.body['username'];
    var sent = false;

    if (username != undefined) {
        let msg = new UserModel({
            username: username
        })

        // 이미 같은 이름의 유저가 존재하면 그 유저를 반환
        await UserModel.find({"username": username}).
            then((doc) => {
                if (doc.length != 0) {
                    sent = true;
                    console.log(doc)
                    return res.json({
                        'username': doc[0].username,
                        '_id': doc[0]._id
                    });
                }
            })
            .catch((err) => {
                sent = true;
                console.error(err);
                return res.json({
                    'Error': "Unknown error"
                })
            })

        if (sent) {
            return;
        }

        msg
            .save()
            .then((doc) => {
                console.log(doc);
                sent = true;
                return res.json({
                    'username': doc.username,
                    '_id': doc._id
                })
            })
            .catch((err) => {
                console.error(err);
                sent = true;
                return res.json({
                    'Error': "Unknown error"
                })
            });
        if (sent) {
            return;
        }
    }

    else {
        return res.json({
            'Error': "username is not provided"
        })
    }
})

app.get('/api/users', (req, res) => {
    UserModel.find()
        .then((doc) => {
            res.json(doc);
        })
})

app.post('/api/users/:_id/exercises', async (req, res) => {
    let _id = req.params['_id'];
    let description = req.body['description'];
    let duration = req.body['duration'];

    // new Date()).toDateString() is some kind of round down.
    // By this, we can make all date value have 00:00:00 in HH:MM:SS field, and prevent some error in '/api/users/:_id/logs?' query
    let date = new Date((new Date()).toDateString());

    // 필수 필드 확인
    if (_id == undefined || description == undefined || duration == undefined) {
        return res.json({
            'Error': "Some required fields are empty"
        })
    }

    if (req.body['date'] != '' && req.body['date'] != undefined) {
        date = new Date(req.body['date']);
    }

    let doc = await UserModel.find({"_id": _id});
    if (doc.length != 0) {
        let msg = new ExerciseModel({
            userid: _id,
            description: description,
            duration: duration,
            date: date
        });
        let username = doc[0].username

        msg.save()
            .then((doc) => {
                console.log(doc)
                res.json({
                    _id: _id,
                    username: username,
                    date: date.toDateString(),
                    duration: Number(duration),
                    description: description,
                })
            })
            .catch((err) => {
                console.log(err);
            })
    }

    else {
        return res.json({
            'Error': "No user with maching id were found"
        })
    }
})


app.get('/api/users/:_id/logs?', async (req, res) => {
    res_json = {}
    var usermodel_query = {"_id": req.params["_id"]}

    var doc = await UserModel.find(usermodel_query)

    if (doc.length == 0) {
        return res.json({ 'Error': "No user with maching id were found"})
    }

    res_json["username"] = doc[0].username
    res_json["_id"] = req.params["_id"]

    var exercisemodel_query = {"userid": req.params["_id"]}
    console.log(req.params)

    if (req.query.from != undefined || req.query.to != undefined) {
        exercisemodel_query["date"] = {}
    }
    if (req.query.from != undefined) {
        exercisemodel_query["date"]["$gte"] = new Date(req.query.from)
    }
    if (req.query.to != undefined) {
        exercisemodel_query["date"]["$lte"] = new Date(req.query.to)
    }

    let exercise_doc = await ExerciseModel.find(exercisemodel_query)

    var limit = exercise_doc.length
    if (req.query['limit'] != undefined && req.query['limit'] < limit) {
        limit = req.query['limit']
    }

    res_json["count"] = limit

    res_json["log"] = []
    for (var i = 0; i < limit; i++) {
        res_json["log"].push({
            "description": exercise_doc[i].description,
            "duration": exercise_doc[i].duration,
            "date": exercise_doc[i].date.toDateString()
        })
    }

    return res.json(res_json)
})

// 65dc5d115c847600147297d8

https.createServer(options, app).listen(3000);

// const listener = app.listen(process.env.PORT || 3000, () => {
//     console.log('Your app is listening on port ' + listener.address().port)
// })

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
const body_parser = require('body-parser')

const server = '127.0.0.1:27017'; // REPLACE WITH YOUR DB SERVER
const database = 'exercise-tracker'; // REPLACE WITH YOUR DB NAME

class Database {
    constructor() {
        this._connect();
    }

    _connect() {
        mongoose
            .connect(`mongodb://${server}/${database}`)
            .then(() => {
                console.log('Database connection successful');
            })
            .catch((err) => {
                console.error('Database connection error');
            });
    }
}


module.exports = new Database();

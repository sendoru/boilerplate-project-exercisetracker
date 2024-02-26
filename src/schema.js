const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
const body_parser = require('body-parser')

const server = '127.0.0.1:27017'; // REPLACE WITH YOUR DB SERVER
const database = 'exercise-tracker'; // REPLACE WITH YOUR DB NAME

let userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
})

let exerciseSchema = new mongoose.Schema({
    userid: {type: String, required: true},
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: {type: Date, required: true}
})

const UserModel = mongoose.model('User', userSchema);
const ExerciseModel = mongoose.model('Exercise', exerciseSchema);

module.exports = {UserModel, ExerciseModel};
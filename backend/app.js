var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const connectDB = require('./config/db');
connectDB();

const cors = require('cors');




var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(cors({
  origin: 'https://movie-flix-dashboard-the-ultimate-m-five.vercel.app',
  credentials: true
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;

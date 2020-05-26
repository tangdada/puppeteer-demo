//引入express的模块
const express = require('express');
//引入puppeteer的模块
const puppeteer = require('puppeteer');

//创建实例
var app = express();

//Router 方法
var Router = express.Router();

Router.get('/test', function (req, res) {
    res.end('Router test success!\n');
});



app.use(Router);
app.listen(7878, function afterListen() {
    console.log('express running on http://localhost:7878');
});
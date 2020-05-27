//引入express的模块
const express = require('express');
//引入puppeteer的模块
const puppeteer = require('puppeteer');
//引入fs文件操作模块
const fs = require('fs');

//创建实例
var app = express();

//Router 方法
var Router = express.Router();

Router.get('/test', function (req, res) {
    res.end('Router test success!\n');
});

// demo1: 获取掘金前端推荐的前10文章列表
Router.get('/demo1', function (req, res) {
    (async () => {
        // 初始化环境 并 打开页面
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto('https://juejin.im/', { waitUntil: 'networkidle2' })

        // 定位到前端tab页
        const handles = await page.$$('li.nav-item div a')
        const btnHtmls = await page.$$eval('li.nav-item div a', options => options.map(option => option.innerHTML))
        await handles[btnHtmls.indexOf('前端')].click()

        // 等页面加载完毕
        await page.waitForSelector('.content-box .info-box .title-row a')

        //获取文章title和链接
        const articleInfos = await page.$$eval('.content-box .info-box .title-row a', options => options.map(option => {
            return {
                innerHTML: option.innerHTML,
                href: option.href
            }
        }))
        
        // 把抓取内容写入到top10.txt文件中
        let content = articleInfos.slice(0, 10).map((info => {
            return `${info.innerHTML}\r\n${info.href}`
        }))
        await fs.writeFile('./top10.txt', content.join('\r\n\r\n'), {}, function (err) {
            if (err) {
                throw err;
            }
        });

        // 关闭浏览器
        await browser.close();

        res.end('Router demo1 success!!\n');
    })();

});



app.use(Router);
app.listen(7878, function afterListen() {
    console.log('express running on http://localhost:7878');
});
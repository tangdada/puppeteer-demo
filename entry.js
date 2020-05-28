//引入express的模块
const express = require('express');
//引入puppeteer的模块
const puppeteer = require('puppeteer');
//引入fs文件操作模块
const fs = require('fs');

var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai

//创建实例
var app = express();

//Router 方法
var Router = express.Router();

Router.get('/test', function (req, res) {
    res.end('Router test success!\n');
});

// demo1: 获取掘金前端推荐的前10文章列表
Router.get('/demo1', function (req, res) {
    ; (async () => {
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

// demo2: 百度搜索“puppeteer”然后跳转到puppeteer GitHub主页
Router.get('/demo2', function (req, res) {
    ; (async () => {
        try {
            // 初始化环境 并 打开页面
            const browser = await puppeteer.launch({ headless: false })
            const page = await browser.newPage()
            await page.goto('https://www.baidu.com', { waitUntil: 'networkidle2' })

            await page.waitFor(1000)

            const elementHandle = await page.$('#kw');
            await elementHandle.type('puppeteer');
            await elementHandle.press('Enter');

            await page.waitFor(1000)

            // 等页面加载完毕
            await page.waitForSelector('.result h3.t a')

            // 找到包含GitHub的条目
            const handles = await page.$$('.result h3.t a')
            const items = await page.$$eval('.result h3.t a', options => options.map(option => option.innerHTML))
            let targetItemIdx = 0;
            for (let i = 0; i < items.length; i++) {
                if (items[i].indexOf('GitHub') > -1) {
                    targetItemIdx = i
                    break
                }
            }

            // 点击条目
            await handles[targetItemIdx].click()

            res.end('Router demo2 success!!\n');
        } catch (error) {
            res.end('Router demo2 fail!!\n');
        }
    })();

});

// demo3: 自动化UI测试, 输入不同的手机号测试返回结果
Router.get('/demo3', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })

        ; (async () => {
            try {
                // 初始化环境 并 打开页面
                const browser = await puppeteer.launch({ headless: false })
                const page = await browser.newPage()
                await page.goto('https://www.mytijian.com/m/mt', { waitUntil: 'networkidle2' })

                await page.waitForSelector('.login-link')
                await page.click('.login-link')

                await page.waitForSelector('input[placeholder="请填写手机号码"]')

                const elementHandle = await page.$('input[placeholder="请填写手机号码"]')
                let { mobile } = req.query
                await elementHandle.type(mobile)

                await page.waitFor(500)
                const btnHandle = await page.$('.weui-cell__ft button.weui-vcode-btn')
                await btnHandle.click()

                await page.waitFor(500)

                expect(await tweetHandle.$eval('.weui-toast__content-warning', node => node.innerText.trim())).to.equal('请输入合格的手机号码')

                res.end('Router demo3 success!!\n');
            } catch (error) {
                console.log(error)
                res.end(error.toString());
            }
        })();

});




app.use(Router);
app.listen(7878, function afterListen() {
    console.log('express running on http://localhost:7878');
});
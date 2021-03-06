//引入express的模块
const express = require('express');
//引入puppeteer的模块
const puppeteer = require('puppeteer');
//引入fs文件操作模块
const fs = require('fs');
//引入测试模块
var chai = require('chai');
var expect = chai.expect;

//创建实例
var app = express();

//Router 方法
var Router = express.Router();

Router.get('/test', function (req, res) {
    res.end('Router test success!\n');
});

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

        res.end('Router demo1 success!!\n')
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

            const elementHandle = await page.$('#kw')
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

            res.end('Router demo2 success!!\n')
        } catch (error) {
            res.end('Router demo2 fail!!\n')
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

                // 跳转到登录页
                await page.waitForSelector('.login-link')
                await page.click('.login-link')

                // 输入手机号
                await page.waitForSelector('input[placeholder="请填写手机号码"]')
                const elementHandle = await page.$('input[placeholder="请填写手机号码"]')
                let { mobile } = req.query
                await elementHandle.type(mobile || '12333333333')

                // 点击发送验证码
                await page.waitFor(500)
                const btnHandle = await page.$('.weui-cell__ft button.weui-vcode-btn')
                await btnHandle.click()

                // 检测返回结果是否正确
                await page.waitFor(500)
                expect(await page.$eval('.weui-toast__content-warning', node => node.innerText.trim())).to.equal('验证码不能为空')

                await browser.close()

                res.end('Router demo3 success!!\n')
            } catch (error) {
                console.log(error)
                res.end(error.toString())
            }
        })();

});

// demo4: 生成页面的截图和PDF文件
Router.get('/demo4', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })

        ; (async () => {
            try {
                // 初始化环境 并 打开页面
                const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
                const page = await browser.newPage()
                await page.goto('http://www.dili360.com')

                // 等待页面加载完毕
                await page.waitForSelector('.tags .right')
                // 隐藏项部导航
                await page.addStyleTag({content: '.part-two { display: none; }'})
                // 指定截屏板块
                const elementHandle = await page.$('.tags .right')
                await elementHandle.screenshot({path: 'screenshot.png'})

                // -------------------------------
                // 打开央视网，生成PDF
                await page.goto('http://news.cctv.com')
                await page.pdf({
                    path: 'news.pdf',
                    format: 'A4',
                    printBackground: true,
                    margin: {
                      top: '15mm',
                      bottom: '15mm'
                    },
                    displayHeaderFooter: true,
                    footerTemplate: '<div style="font-size: 14px;"><span class="pageNumber"></span>/<span class="totalPages"></span></div>',
                    headerTemplate: '<div style="font-size: 14px;">I"m header!</div>',
                  });

                await browser.close()

                res.end('Router demo4 success!!\n')
            } catch (error) {
                res.end(error.toString())
            }
        })();

});

app.use(Router);
app.listen(7878, function afterListen() {
    console.log('express running on http://localhost:7878');
});
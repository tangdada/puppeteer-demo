# 一、知识点
`puppeteer`、`nodejs`、`VsCode`
# 二、安装环境
**安装nodejs(`v10.16.0`版本)**

[nodejs for Window下载包](https://nodejs.org/download/release/v10.16.0/node-v10.16.0-x64.msi)、[nodejs for Mac下载包](https://nodejs.org/download/release/v10.16.0/node-v10.16.0.pkg)

**安装VsCode代码编辑器**

[VsCode for Window下载包](https://vscode.cdn.azure.cn/stable/5763d909d5f12fe19f215cbfdd29a91c0fa9208a/VSCodeSetup-x64-1.45.1.exe)、[VsCode for Mac下载包](https://vscode.cdn.azure.cn/stable/5763d909d5f12fe19f215cbfdd29a91c0fa9208a/VSCode-darwin-stable.zip)

# 三、新建项目目录

### 1. 新建项目文件夹

nodejs和VsCode安装完成后，任意位置新建文件夹```puppeteer-demo```，然后VsCode打开该文件夹

![](https://user-gold-cdn.xitu.io/2020/5/28/172595a74a8893ce?w=1824&h=305&f=png&s=24279)

### 2. VsCode打开命令行终端

![](https://user-gold-cdn.xitu.io/2020/5/28/172595f48193ff81?w=1605&h=320&f=png&s=69194)

### 3. npm init 回车到底生成package.json文件

![](https://user-gold-cdn.xitu.io/2020/5/28/17259689cc685f2a?w=1211&h=847&f=png&s=79365)

### 4. 命令行终端安装项目依赖包

```
// 先安装国内源环境，下载工具包更快
npm install cnpm -g
// 下载需要用到的工具包
cnpm install express puppeteer chai --save
```

![](https://user-gold-cdn.xitu.io/2020/5/28/17259c6dfbfa78b9?w=1579&h=136&f=png&s=13934)

![](https://user-gold-cdn.xitu.io/2020/5/28/17259c747aa8a332?w=1575&h=149&f=png&s=14639)

### 5. 项目文件夹下新建启动文件```entry.js```
```
//引入express的模块
var express = require('express');

//创建实例
var app = express();

//Router 方法
var Router = express.Router();

Router.get('/test', function (req, res) {
    res.end('Router test success!\n');
});

app.use(Router);
app.listen(7878, function afterListen() {
    console.log('express running on http://localhost:7878');
});

```

![](https://user-gold-cdn.xitu.io/2020/5/28/17259a8345cd4602?w=1149&h=409&f=png&s=47203)

### 6. 在package.json中加上运行脚本

```"start": "node entry.js"```

![](https://user-gold-cdn.xitu.io/2020/5/28/17259b553fcc37a2?w=1043&h=410&f=png&s=45906)

输入命令```npm run start```启动服务

![](https://user-gold-cdn.xitu.io/2020/5/28/17259bf061b9cb60?w=768&h=311&f=png&s=17188)

### 7. 浏览器输入```http://localhost:7878/test```测试服务是否成功



![](https://user-gold-cdn.xitu.io/2020/5/28/17259c30150dbf75?w=659&h=83&f=png&s=4235)

# 四、几个栗子
### 1. 获取网页内容

```
// 获取掘金前端模块推荐的前10文章列表
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
```
重启服务，浏览器访问`http://localhost:7878/demo1`
运行成功后，项目目录下会生成top10.txt的文件


![](https://user-gold-cdn.xitu.io/2020/5/28/17259e071b4783e8?w=888&h=656&f=png&s=75486)

### 2. 模拟表单输入

```
// demo2: 百度搜索“puppeteer”然后跳转到puppeteer GitHub主页
Router.get('/demo2', function (req, res) {
    ; (async () => {
        try {
            // 初始化环境 并 打开页面
            // headless: false，这个设置在运行时，可以看到浏览器窗口
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
```
重启服务，浏览器访问`http://localhost:7878/demo2`

![](https://user-gold-cdn.xitu.io/2020/5/28/17259e5a664144e0?w=941&h=607&f=png&s=88441)

### 3. 自动化UI测试
```
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
```
重启服务，浏览器访问`http://localhost:7878/demo3?mobile=12333333333`,可以看到测试结果

![](https://user-gold-cdn.xitu.io/2020/5/28/17259ecdb747a50f?w=727&h=136&f=png&s=15183)

### 4. 生成页面的屏幕截图和pdf文件
重启服务，浏览器访问`http://localhost:7878/demo4`,执行结束后，可以看到新生成的`screenshot.png`和`news.pdf`

![](https://user-gold-cdn.xitu.io/2020/5/28/17259ee789d1c89f?w=899&h=308&f=png&s=46495)

**完整代码**
[github](https://github.com/tangdada/puppeteer-demo)
```
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
```

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");
const request=require("request")  
const mysql=require('mysql') 

var connection = mysql.createConnection({  //配置参数，然后添加你的数据库里面的表
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'puppeteer'
})
connection.connect((err)=>{
  if(err){
    console.log('与MySQL数据库建立连接失败',err.message);
    return false;
  }else{
    console.log('与MySQL数据库建立连接成功');
    console.log("---爬虫启动中...---")
  }
});

//执行入口
(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        // 这里注意路径指向可执行的浏览器
        executablePath: path.resolve(
            "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
        ),
    });
    let pagesMax = 2; //最大页数
    let dataList = []; //爬取后数据存放的地方

    const page = await browser.newPage(); //创建一个页面.
    await page.goto('http://www.dianping.com/shenzhen/ch45/g147p1'); //网页跟踪到百度网址.
    console.log("---爬虫正在运行，请稍后...---")
    //安全验证
    await page.waitFor(2000) //等待2秒
    // await page.waitForSelector('#yodaBox');
    const yodaBox = await page.$("#yodaBox");
    if(yodaBox){ //有时候不要验证....有时候验证失败 需要多试几遍
        console.log("---需要安全验证---")
        let box = await yodaBox.boundingBox()
        console.log("box",box)
        // await yodaBox.mouse.down();
        // await yodaBox.mouse.move(box.x+box.width/2, box.y+box.height/2,{steps:230});
        console.log("---由于安全验证无法通过，请重新运行此爬虫！---")
        return false;
        // await yodaBox.mouse.up();
        // await page.waitFor(2000)//等待2秒
    }
    
    //数据爬取
    console.log("---开始数据爬取---")
    for(let i=1;i<=pagesMax;i++){
        console.log("---开始数据爬取第"+i+"页---")
        if(i!=1){//除了第一次，其他时候重新跳转分页
            await page.goto('http://www.dianping.com/shenzhen/ch45/g147p'+i);
            console.log("---等待页面加载---")
            await page.waitFor(2000); //等待页面加载
        }
        await page.waitForSelector('#shop-all-list');
        let result = await page.evaluate(() => {
          const fontList = [ //数字对应的密匙 会变的，用的时候自己取
            {shopNum:"1",num:1},
            {shopNum:"ed0f",num:2},
            {shopNum:"e8ec",num:3},
            {shopNum:"f56f",num:4},
            {shopNum:"eb7e",num:5},
            {shopNum:"f601",num:6},
            {shopNum:"eda2",num:7},
            {shopNum:"ebf7",num:8},
            {shopNum:"e50b",num:9},
            {shopNum:"e2c7",num:0},
          ]
          const items = [...document.querySelectorAll("#shop-all-list li")];
          return items.map(item => {
            // 标题名
            let titleLink = item.querySelector("h4");
            //评分
            let score = item.querySelector(".star_score_sml").innerText
            //点评数量
            let comment = ""
            let commentList = []
            if(item.querySelector(".review-num").querySelector("b")){
              commentList = [...item.querySelector(".review-num").querySelector("b").querySelectorAll("svgmtsi")]
            }
            commentList = commentList.map(item => {
              let num = item.innerText.charCodeAt(0).toString(16)
              let number = ""
              fontList.forEach(element => {
                if(element.shopNum==num){
                  number = element.num
                }
              });
              return number
            });
            comment = commentList.join("")
            //人均价格
            let price = ""
            let priceList = []
            if(item.querySelector(".mean-price").querySelector("b")){
              priceList = [...item.querySelector(".mean-price").querySelector("b").querySelectorAll("svgmtsi")]
            }
            priceList = priceList.map(item => {
              let num = item.innerText.charCodeAt(0).toString(16)
              let number = ""
              fontList.forEach(element => {
                if(element.shopNum==num){
                  number = element.num
                }
              });
              return number
            });
            price = priceList.join("")
            //是否为广告
            let advertisement = false
            if(item.querySelector(".search-ad")){
                advertisement = true
            }
            //是否为外卖
            let iout = false
            if(item.querySelector(".iout")){
              iout = true
            }
            //是否为分店
            let shopBranch = false
            if(item.querySelector(".shop-branch")){
              shopBranch = true
            }
            //是否为团购
            let groupBuyState = false
            if(item.querySelector(".igroup")){
              groupBuyState = true
            }
            //团购列表
            let groupBuy = []
            if(item.querySelector(".svr-info")){
              groupBuy = [...item.querySelector(".svr-info").querySelectorAll("a[target='_blank']")];
            }
            let groupBuyList = groupBuy.map(item => {
              return item.innerText
            });
            //地址
            let address = ""
            if(item.querySelector(".operate")&&item.querySelector(".operate").querySelector(".J_o-map")){
              address = item.querySelector(".operate").querySelector(".J_o-map").getAttribute("data-address")
            }
            // 返回所有查询结果
            return { 
              name: titleLink.innerText, //店铺名
              score:score, //评分
              comment: comment, //点评数
              price: price, //人均价格
              address: address, //地址
              shopBranch: shopBranch, //是否分店
              iout: iout, //是否外卖
              advertisement:advertisement, //是否广告
              groupBuyState:groupBuyState, //是否团促
              groupBuyList:groupBuyList,  //团促列表
            };
          });
        });
        console.log("---爬取到"+result.length+"条数据---")
        dataList = dataList.concat(result) //合并数组
        console.log("---暂停2秒后爬取---")
        await page.waitFor(2500) //等待2.5秒
    }
    console.log("---数据爬取结束---")
    console.log("---数据页数："+pagesMax+"页---")
    console.log("list==",dataList)
    //导出为json文件
    fs.writeFile(`./demo.json`, JSON.stringify(dataList), "utf8", (error)=>{
      if (error) {
        console.log("--数据写入JSON失败"+error);
        // return false;
      }
      console.log( "--数据写入JSON成功！在根目录下的demo.json文件--");
    });
    //准备写入数据库
    console.log("---准备写入数据库---")
    let addParmas = []
    dataList.forEach((item,key)=>{
      addParmas.push([key+1,item.name, item.score,item.comment,item.price,item.address,item.shopBranch?2:1,item.iout?2:1,item.advertisement?2:1,item.groupBuyState?2:1,JSON.stringify(item.groupBuyList)])
    })
    let addSql = "insert into demo(sort,name,score,comment,price,address,shop_branch,iout,advertisement,group_buy_state,group_buyList) values ?"; //(?,?,?,?,?,?,?,?,?,?)
    connection.query(addSql,[addParmas],(err)=>{
      if(err){
        console.log("数据库写入失败",err.message);
      }else{
        console.log("数据库写入成功");
      }
    })
    console.log("等待5秒后关闭浏览器");
    await page.waitFor(5000) //等待5秒后关闭浏览器
    //关闭浏览器
    browser.close();
})();
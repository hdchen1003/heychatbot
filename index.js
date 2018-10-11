

//import something
{
 
  var express = require('express');
  var app = express();
  var http = require('http');
  var mysql = require('mysql');
  var bodyParser = require('body-parser');
  var request = require('xhr-request')
  var dateFormat = require('dateformat');
  var now = new Date().toLocaleString();
  var axios = require('axios');
  var jsSHA = require('jssha');
  var cookieParser = require('cookie-parser');
  
}
//一些路徑設置
{
 // app.use(cookieParser(credentials.cookieSecret));
 app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.set('view engine', 'ejs')
  app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
  app.use('/js', express.static(__dirname + '/node_modules/techer/dist/js'));
  app.use('/js', express.static(__dirname + '/node_modules/jquery/dist/js'));
  app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
  app.use(express.static(__dirname + '/views/pages'));
}
//宣告一些會用到的變數
{
  var ip = "127.0.0.1:3000"
  var when_login_select_num = 8 //當登入時讀取幾則訊息
  var ID = ""
  var Train = []; //紀錄起站到迄站
  var delTRA = "";
  var bot = [];
  bot[bot.length] = "BOT：安安你好!!<br/>";
  var session = [];
  var mylove = [];

  var getAuthorizationHeader = function () {
    var AppID = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';
    var AppKey = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';

    var GMTString = new Date().toGMTString();
    var ShaObj = new jsSHA('SHA-1', 'TEXT');
    ShaObj.setHMACKey(AppKey, 'TEXT');
    ShaObj.update('x-date: ' + GMTString);
    var HMAC = ShaObj.getHMAC('B64');
    var Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';

    return { 'Authorization': Authorization, 'X-Date': GMTString };
  }//noobTW寫的 隨便 無法理解QQ
  var con = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    password: "0000"
    // old gss25867890
  });//連接DB
}
//接上DB
{
  con.connect(function (err) {
    if (err) throw err;
  });
}


//初始畫面
app.get('/', function (req, res) {
  // if (req.cookies.aaab) {
  //   console.log(req.cookies.aaab)
  //   res.send("二次訪問");
  // } else {
  //   res.cookie('aaab', "10");
  //   res.send("初次訪問");
  // }
 
 

  res.render('pages/index', {
    message: "歡迎使用本產品",
    send: get_str(),
    ID: ID,
    ip: ip,
  });
});

app.post('/login', function (req, res) {
  con.query('SELECT * FROM heychatbot.user WHERE id=\'' + req.body.ID + '\' and pwd=\'' + req.body.pwd + '\'', function (err, result, fields) {
    if (result != "") {
      if (result[0].id == req.body.ID && result[0].pwd == req.body.pwd) {
        var username = result[0].name
        
        res.cookie('accountStatus', result[0].id ) //當作session使用 
        
        con.query('SELECT * FROM heychatbot.message WHERE u_id=\'' + req.body.ID + '\' order by m_id desc limit ' + when_login_select_num + ' ', function (err, result, fields) {
          for (var i = (result.length) - 1; i >= 0; i--) {
            bot[bot.length] = {
              message: result[i].message,
              class: result[i].class,
              canadd: result[i].canadd
            }
          }
          
          // result.forEach(input => {
          //   bot[bot.length] = input.message;
          // });
          
          res.render('pages/loginSuccess', {
            message: "早安" + username,
            send: get_str(),
            ID : req.cookies.accountStatus,
            ip: ip,
          });
          
        })
      }
    }
    else {
      res.render('pages/index', {
        message: "帳密錯誤",
        send: get_str(),
        ID : req.cookies.accountStatus,
        ip: ip,
      });
    }
  });
});



app.get('/trytrylook', function (req, res) {

  res.render('pages/main', {
    message: "早安",
    send: get_str(),
    ID : req.cookies.accountStatus,
    ip: ip,
  });

});



app.get('/logout', function (req, res) {
  if (ID != "") {
    bot.forEach(input => {
      con.query('INSERT INTO heychatbot.message (`u_id`, `message`, `time`,`class`,`canadd`) VALUES (\'' + ID + '\',\'' + input.message + '\', \'' + now + '\',\'' + input.class + '\',\'' + input.canadd + '\')', function (err, result, fields) {
      });
    });
  }
  res.cookie('accountStatus', "")
  bot.length = 0;
  setTimeout(function(){  res.render('pages/logoutSuccess', {
    message: "登出成功",
    send: get_str(),
    ID : req.cookies.accountStatus,
    ip: ip,
  });},500);


});

app.get('/signup', function (req, res) {

  res.render('pages/signup', {
    message: "歡迎加入我們",
    ID : req.cookies.accountStatus,
    ip: ip,
  });

});

app.post('/doSignup', function (req, res) {

  if (req.body.ID != "" && req.body.pwd != "" && req.body.pwd2 != "" && req.body.name != "" && req.body.birth != "" && req.body.email != "" && req.body.gender != "") {
    console.log("不為空")
    //console.log(req.body.ID,req.body.pwd,req.body.pwd2,req.body.email,req.body.gender,req.body.birth,req.body.name)
    con.query('SELECT id FROM heychatbot.user WHERE id=\'' + req.body.ID + '\'', function (err, result, fields) {
      console.log(result)
      if (result == "") {
        if (req.body.pwd != req.body.pwd2) {
          console.log("密碼不一致")
          res.render('pages/index', {
            message: "密碼不一致",
            ID : req.cookies.accountStatus,
            ip: ip,
          });
        }
        else {
          console.log("註冊成功")
          con.query('INSERT INTO `heychatbot`.`user` (`id`, `pwd`, `name`, `email`, `birth`, `gender`) VALUES (\'' + req.body.ID + '\', \'' + req.body.pwd + '\', \'' + req.body.name + '\', \'' + req.body.email + '\', \'' + req.body.birth + '\', \'' + req.body.gender + '\')', function (err, result, fields) {
            res.render('pages/index', {
              message: "註冊成功",
              ID : req.cookies.accountStatus,
              ip: ip,
            });
          })

        }
      }
      else {
        console.log("帳號已經被註冊")
        res.render('pages/index', {
          message: "帳號已經被註冊了",
          ID : req.cookies.accountStatus,
          ip: ip,
        });

      }
    });

  }
  else {
    console.log("有欄位漏填")
    res.render('pages/index', {
      message: "有欄位漏填",
      ID : req.cookies.accountStatus,
      ip: ip,
    });
  }


});

app.get('/info', function (req, res) {

  res.render('pages/info', {
    message: "歡迎加入我們",
    ID : req.cookies.accountStatus,
    ip: ip,
  });

});

app.get('/addstr', function (req, res) {

  res.render('pages/main', {
    send: get_str(),
    message: "歡迎加入我們",
    ID : req.cookies.accountStatus,
    ip: ip,
  });

});

app.get('/favorite', function (req, res) {

  res.render('pages/favorite', {
    message: "歡迎加入我們",
    ip: ip,
    ID : req.cookies.accountStatus,
    send: get_str_mylove()
  });

});

app.get('/guide', function (req, res) {

  res.render('pages/guide', {
    message: "歡迎加入我們",
    ip: ip,
    ID : req.cookies.accountStatus,
    send: get_str_mylove()
  });

});

app.get('/setting', function (req, res) {

  res.render('pages/setting', {
    message: "歡迎加入我們",
    ip: ip,
    ID : req.cookies.accountStatus,
    send: get_str_mylove()
  });

});

app.get('/private', function (req, res) {

  res.render('pages/private', {
    message: "歡迎加入我們",
    ID : req.cookies.accountStatus,
    ip: ip,
    send: get_str_mylove()
  });

});

app.get('/friend', function (req, res){

});
//回應後
app.post('/addstr', function (req, res) {

  if (req.body.addstr == "初始化") {
    console.log(ID + "初始化")

    for (var i = 0; i < session.length; i++) {
      session[i] = ""
    }

    bot.length = 0;

    bot[bot.length] = {
      message: "YOU：" + req.body.addstr + "<br/>",
      class: "input",
      canadd: 0
    }
    bot[bot.length] = {
      message: "BOT：初始化完畢<br/>",
      class: "notif",
      canadd: 0
    }

    res.render('pages/main.ejs', {
      message: "早安",
      ID : req.cookies.accountStatus,
      send: get_str(),
      ip: ip,
    });
  }
  else if (req.body.addstr == "我的最愛") {
    bot[bot.length] = {
      message: "YOU：" + req.body.addstr + "<br/>",
      class: "input",
      canadd: 0
    }
    opMylove();
    res.render('pages/main.ejs', {
      message: "早安",
      send: get_str(),
      ID : req.cookies.accountStatus,
      ip: ip,
    });
  }
  else {
    
    switch (session[0]) {
      case "place":
        request('https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=' + req.body.addstr + '&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry&key=AIzaSyCt3g5gLr475dheyZYlJFXBlSgKa6YMqXk', {
          json: true
        }, function (err, data) {
          if (err) throw err
          bot[bot.length] = {
            message: "YOU：" + req.body.addstr + "<br/>",
            class: "input",
            canadd: 0
          }
          bot[bot.length] = {
            message: "BOT：地區 - " + data.candidates[0].formatted_address + "<br/>",
            class: "notif",
            canadd: 0
          }

          res.render('pages/main.ejs', {
            message: "早安",
            ID : req.cookies.accountStatus,
            send: get_str(),
            ip: ip,
          });
        });
        session[0] = ""
        break;
      case "weather":

        var placecode = placeTocode(req.body.addstr);
        request('http://opendata.cwb.gov.tw/opendataapi?dataid=' + placecode + '&authorizationkey=CWB-357C384E-33A3-4DFA-BBE8-AFF232297CF5&format=json', {
          json: true
        }, function (err, data) {
          if (err) throw err
          bot[bot.length] = {
            message: "YOU：" + req.body.addstr + "<br/>",
            class: "input",
            
            canadd: 0
          }
          bot[bot.length] = {
            message: "BOT：<br/><table class='sss' border=1><tr><td>溫度</td><td>體感溫度</td><td>天氣現象</td><td>降雨機率</td><td>舒適度</td></tr>",
            class: "notif",
            canadd: 0
          }
          for (var i = 0; i < 3; i++) {
            bot[bot.length] = {
              message: "<tr><td>" + data.cwbopendata.dataset.locations.location[1].weatherElement[0].time[i].elementValue.value + "°C</td><td>" + data.cwbopendata.dataset.locations.location[1].weatherElement[8].time[i].elementValue.value + "°C</td><td>" + data.cwbopendata.dataset.locations.location[1].weatherElement[9].time[i].elementValue[0].value + "</td><td>" + data.cwbopendata.dataset.locations.location[1].weatherElement[3].time[i].elementValue.value + "%</td><td>" + data.cwbopendata.dataset.locations.location[1].weatherElement[7].time[i].elementValue[1].value + "</td></tr>",
              class: "weather",
              canadd: 1
            }
          }
          bot[bot.length] = {
            message: "</table><br/>",
            class: "notif",
            canadd: 0
          }

          res.render('pages/main.ejs', {
            message: "早安",
            send: get_str(),
            ID : req.cookies.accountStatus,
            ip: ip,
          });
        });
        session[0] = ""
        break;
      case "traffic":
        search(req.body.addstr)
        res.render('pages/main.ejs', {
          message: "早安",
          ID : req.cookies.accountStatus,
          send: get_str(),
          ip: ip,
        });

        break;
      case "traffic_BUSnum":
        session[1] = findPlace(req.body.addstr)
        search(req.body.addstr)
        res.render('pages/main.ejs', {
          message: "早安",
          send: get_str(),
          ip: ip,
          ID : req.cookies.accountStatus,
        });
        break;
      case "traffic_BUS":
        session[2] = showIntFromString(req.body.addstr);
        axios.get('http://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/' + session[1] + '?$format=json', { // 參考(抄襲XD)noobTW
          headers: getAuthorizationHeader(),
        })
          .then(function (response) {
            for (var i = 0; i < response.data.length; i++) {
              if (response.data[i].RouteName.Zh_tw.match(session[2])) {
                bot[bot.length] = {
                  message: "<table border=1> <tr><td>編號</td> <td>去程</td> <td>回程</td></tr>",
                  class: "notif",
                  canadd: 0
                }
                for (var j = 0; j < response.data[i].Stops.length; j++) {

                  bot[bot.length] = {
                    message: "<tr><td>" + (j + 1) + "</td><td>" + response.data[i].Stops[j].StopName.Zh_tw + "</td><td>" + response.data[i].Stops[response.data[i].Stops.length - j - 1].StopName.Zh_tw + "</td></tr>",
                    class: "bus",
                    canadd: 1
                  }

                }
                bot[bot.length] = {
                  message: "</table><br/>",
                  class: "notif",
                  canadd: 0
                }
              }
              break;
            }
            session[0] = "", session[1] = "", session[2] = "";
            res.render('pages/main.ejs', {
              message: "早安",
              send: get_str(),
              ID : req.cookies.accountStatus,
              ip: ip,
            });

          });



        break;
      case "traffic_TRA":
        bot[bot.length] = {
          message: "YOU：" + req.body.addstr + "<br/>",
          class: "input",
          canadd: 0
        }
        var originName, destinationName, originID, destinationID
        axios.get('https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/Station?$select=StationName%2CStationID&$format=JSON', { // 參考(抄襲XD)noobTW
          headers: getAuthorizationHeader(),
        })
          .then(function (response) {
            var find2
            for (var i = 0; i < response.data.length; i++) {
              if (req.body.addstr.match(response.data[i].StationName.Zh_tw)) {
                originName = response.data[i].StationName.Zh_tw
                originID = response.data[i].StationID
                find2 = i + 1
                break;
              }
            }
            for (var j = find2; j < response.data.length; j++) {
              if (req.body.addstr.match(response.data[j].StationName.Zh_tw)) {
                destinationName = response.data[j].StationName.Zh_tw
                destinationID = response.data[j].StationID
                break;
              }
            }
            if (req.body.addstr.indexOf(originName) > req.body.addstr.indexOf(destinationName)) {
              var a
              a = destinationName
              destinationName = originName
              originName = a

              a = destinationID
              destinationID = originID
              originID = a
            }//比對字串，如果先列出終點就把他們交換
            bot[bot.length] = {
              message: "BOT：起站 - " + originName + " ，迄站 -  " + destinationName + "<br/>",
              class: "notif",
              canadd: 0
            }
            bot[bot.length] = {
              message: "BOT：要搭幾月幾號的車？<br/>",
              class: "notif",
              canadd: 0
            }
            Train = [originName, originID, destinationName, destinationID]
            delTRA = bot.length
            bot[bot.length] = {
              message: "<input type=\"date\" class=\"input\" name=\"time\">",
              class: "notif",
              canadd: 0
            }
            res.render('pages/main.ejs', {
              message: "早安",
              send: get_str(),
              ID : req.cookies.accountStatus,
              ip: ip,
            });
            session[0] = "need_TRA_time";
          });


        break;
      case "need_TRA_time":
        //bot.splice(delTRA, 1, "")
        bot[bot.length] = {
          message: "YOU：" + req.body.time + "<br/>",
          class: "input",
          canadd: 0
        }
        axios.get('http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/OD/' + Train[1] + '/to/' + Train[3] + '/' + req.body.time + '?&$format=json', { // 參考(抄襲XD)noobTW
          headers: getAuthorizationHeader(),
        })
          .then(function (response) {
            bot[bot.length] = {
              message: "BOT：<br/><table border=1><tr><td>車種</td><td>車次代碼</td><td>到站時間</td><td>備註</td></tr>",
              class: "notif",
              cabadd: 0
            }
            for (var i = 0; i < response.data.length; i++) {
              bot[bot.length] = {
                message: "<tr><td>" + response.data[i].DailyTrainInfo.TrainTypeName.Zh_tw + "</td><td>" + response.data[i].DailyTrainInfo.TrainNo + "</td><td>" + response.data[i].OriginStopTime.ArrivalTime + "</td><td>" + response.data[i].DailyTrainInfo.Note.Zh_tw + "</td></tr>",
                class: "notif",
                canadd: 1
              }
            }
            bot[bot.length] = {
              message: "</table><br/>",
              class: "notif",
              canadd: 0
            }
            res.render('pages/main.ejs', {
              message: "早安",
              send: get_str(),
              ID : req.cookies.accountStatus,
              ip: ip,
            });
          })

        session[0] = ""
        break;
      default:
        search(req.body.addstr)
        res.render('pages/main.ejs', {
          message: "早安",
          send: get_str(),
          ID : req.cookies.accountStatus,
          ip: ip,
        });
    }
  }

});

//判斷使用者要找什麼
function search(input) {
  if (input.match("add") || input.match("加入")) {
    
    // Session[5]="add";
    if(bot[(bot.length - 2)].canadd == 1){
      console.log(bot[(bot.length - 2)].message+"-") 
      console.log(bot[(bot.length - 2)].canadd+"-")  
      mylove[mylove.length] = bot[(bot.length - 1)]
      con.query('INSERT INTO heychatbot.favorite (`u_id`, `message`, `class`) VALUES (\'' + ID + '\',\'' + mylove[mylove.length-1].message + '\',\'' +mylove[mylove.length-1].class + '\')', function (err, result, fields) {
        if (err){
        }
        else{
          console.log("成功")
        }
        bot[bot.length] = {
          message: "BOT：我的最愛加入成功<br/>",
          class: "notif",
          canadd: 0
        }
      });
    }
    else{
      console.log(bot[(bot.length-2)].message+"+") 
      console.log(bot[(bot.length-2)].canadd+"+") 
      bot[bot.length] = {
        message: "BOT：此項目不能加入最愛<br/>",
        class: "notif",
        canadd: 0
      }
    }
   
  
  }
  else if (input.match("-h") || input.match("help") || input.match("HELP") || input.match("幫助") || input.match("如何使用")) {
    // Session[5]="add";

    bot[bot.length] = {
      message: "BOT：本系統目前提供幾種服務1.交通 2.地點 3.天氣 4.貓咪 5.初始化 6.add 7.有其他建議請聯絡我",
      class: "help",
      canadd: 0
    }
  }
  else {
    if (input == "地點") {
      bot[bot.length] = {
        message: "YOU：" + input + "<br/>",
        class: "input",
        canadd: 0
      }
      bot[bot.length] = {
        message: "BOT：要查詢哪個地方？<br/>",
        class: "notif",
        canadd: 0
      }
      session[0] = "place";
    }
    else if (input == "天氣") {
      bot[bot.length] = {
        message: "YOU：" + input + "<br/>",
        class: "input",
        canadd: 0
      }
      bot[bot.length] = {
        message: "BOT：要查詢哪裡的天氣？<br/>",
        class: "notif",
        canadd: 0
      }
      session[0] = "weather";
    }
    else if (input.match("貓")) {
      bot[bot.length] = {
        message: "YOU：" + input + "<br/>",
        class: "input",
        canadd: 0
      }
      bot[bot.length] = {
        message: "BOT：好，我就給你貓咪<br/>",
        class: "notif",
        canadd: 0
      }
      bot[bot.length] = {
        message: "BOT：" + ' <img src="http://p1.pstatp.com/large/pgc-image/15243937805643c35ac4877" alt="cat" height="150" width="150"> ' + "<br/>",
        class: "img",
        canadd: 1
      }
    }
    else if (input == "交通") {
      bot[bot.length] = {
        message: "YOU：" + input + "<br/>",
        class: "input",
        canadd: 0
      }
      bot[bot.length] = {
        message: "BOT：要搭乘什麼？<br/>",
        class: "notif",
        canadd: 0
      }
      session[0] = "traffic";
    }
    else if (input.match("台鐵") || input.match("臺鐵") || input.match("火車")) {
      bot[bot.length] = {
        message: "YOU：" + input + "<br/>",
        class: "input",
        canadd: 0
      }
      bot[bot.length] = {
        message: "BOT：起點站和終點站？<br/>",
        class: "notif",
        canadd: 0
      }
      session[0] = "traffic_TRA";
    }
    else if (input.match("公車") || input.match("巴士") || input.match("客運")) {
      bot[bot.length] = {
        message: "YOU：" + input + "<br/>",
        class: "input",
        canadd: 0
      }
      bot[bot.length] = {
        message: "BOT：哪個縣市？<br/>",
        class: "notif",
        canadd: 0
      }
      session[0] = "traffic_BUSnum";
    }
    else if (input.match("咕嚕靈波")) {
      bot[bot.length] = {
        message: "YOU：" + input + "<br/>",
        class: "input",
        canadd: 0
      }
      bot[bot.length] = {
        message: "BOT：歡迎來到真步真步王國 咕嚕靈波 （●′∀‵）ノ♡ <br/>",
        class: "notif",
        canadd: 0
      }
      bot[bot.length] = {
        message: '<video width="320" height="240" controls><source src="linpo.mp4" type="video/mp4"></video>',
        class: "video",
        canadd: 1
      }
      session[0] = "traffic_BUSnum";
    }
    else if (session[0] == "traffic_BUSnum") {
      bot[bot.length] = {
        message: "YOU：" + input + "<br/>",
        class: "input",
        canadd: 0
      }
      bot[bot.length] = {
        message: "BOT：幾號<br/>",
        class: "notif",
        canadd: 0
      }
      session[0] = "traffic_BUS";

    }
    else if (input == "") {
      bot[bot.length] = {
        message: "YOU：" + input + "<br/>",
        class: "input",
        canadd: 0
      }
      bot[bot.length] = {
        message: "BOT：不會打字哦，廢物？<br/>",
        class: "notif",
        canadd: 0
      }
    }
    else {
      bot[bot.length] = {
        message: "YOU：" + input + "<br/>",
        class: "input",
        canadd: 0
      }
      bot[bot.length] = {
        message: "BOT：抱歉，我聽不懂<br/>",
        class: "notif",
        canadd: 0
      }
    }
  }
};


//把bot[]轉成字串
function get_str() {
  var str = ""
  bot.forEach(input => {
    str += input.message
  });
  return str
}
//把mylove[]轉成字串
function get_str_mylove() {
  var str = ""
  
  mylove.forEach(input => {
    
    str += "<tr><td>" + input.message + "</td></tr>"
  });
 
  console.log(str);
  var re = /BOT：/g;
  var result = str.replace(re, "");
  console.log(str)
  return result
}
//把我的最愛放入bot[]
function opMylove() {
  mylove.forEach(input => {
    bot[bot.length].message = input
  });
}
//天氣 - 地區轉代碼
function placeTocode(place) {
  if ((place.match("臺北")) || (place.match("台北"))) {
    place = "F-D0047-061"
  }
  else if (place.match("台中") || place.match("臺中")) {
    place = "F-D0047-073"
  }
  else if (place.match("宜蘭")) {
    place = "F-D0047-003"
  }
  else if (place.match("桃園")) {
    place = "F-D0047-005"
  }
  else if (place.match("新竹縣")) {
    place = "F-D0047-009"
  }
  else if (place.match("苗栗")) {
    place = "F-D0047-013"
  }
  else if (place.match("彰化")) {
    place = "F-D0047-017"
  }
  else if (place.match("南投")) {
    place = "F-D0047-021"
  }
  else if (place.match("雲林")) {
    place = "F-D0047-025"
  }
  else if (place.match("嘉義縣")) {
    place = "F-D0047-029"
  }
  else if (place.match("屏東")) {
    place = "F-D0047-033"
  }
  else if (place.match("台東") || place.match("臺東")) {
    place = "F-D0047-037"
  }
  else if (place.match("花蓮")) {
    place = "F-D0047-041"
  }
  else if (place.match("澎湖")) {
    place = "F-D0047-045"
  }
  else if (place.match("基隆")) {
    place = "F-D0047-049"
  }
  else if (place.match("新竹市")) {
    place = "F-D0047-053"
  }
  else if (place.match("嘉義市")) {
    place = "F-D0047-057"
  }
  else if (place.match("新北市")) {
    place = "F-D0047-069"
  }
  else if (place.match("台南市") || (place.match("臺南"))) {
    place = "F-D0047-077"
  }
  else if (place.match("連江")) {
    place = "F-D0047-081"
  }
  else if (place.match("金門")) {
    place = "F-D0047-085"
  }
  else if (place.match("台灣") || (place.match("臺灣"))) {
    place = "F-D0047-089"
  }
  else if (place.match("高雄")) {
    place = "F-D0047-065"
  }
  else {
    bot[bot.length] = "BOT：目前尚未加入，敬請期待<br/>"
    return 0;
  }
  return place;

}
//判斷要找哪個縣市的function
function findPlace(place) {

  if ((place.match("臺北")) || (place.match("台北"))) {
    return "Taipei"
  }
  else if (place.match("台中") || place.match("臺中")) {
    return "Taichung"
  }
  else if (place.match("宜蘭")) {
    return "YilanCounty"
  }
  else if (place.match("桃園")) {
    return "Taoyuan"
  }
  else if (place.match("新竹縣")) {
    return "HsinchuCounty"
  }
  else if (place.match("苗栗")) {
    return "MiaoliCounty"
  }
  else if (place.match("彰化")) {
    return "ChanghuaCounty"
  }
  else if (place.match("南投")) {
    return "NantouCounty"
  }
  else if (place.match("雲林")) {
    return "YunlinCounty"
  }
  else if (place.match("嘉義縣")) {
    return "ChiayiCounty"
  }
  else if (place.match("屏東")) {
    return "PingtungCounty"
  }
  else if (place.match("台東") || place.match("臺東")) {
    return "TaitungCounty"
  }
  else if (place.match("花蓮")) {
    return "HualienCounty"
  }
  else if (place.match("澎湖")) {
    return "PenghuCounty"
  }
  else if (place.match("基隆")) {
    return "Keelung"
  }
  else if (place.match("新竹市")) {
    return "Hsinchu"
  }
  else if (place.match("嘉義市")) {
    return "Chiayi"
  }
  else if (place.match("新北市")) {
    return "NewTaipei"
  }
  else if (place.match("台南市") || (place.match("臺南"))) {
    return "Tainan"
  }
  else if (place.match("連江")) {
    return "LienchiangCounty"
  }
  else if (place.match("金門")) {
    return "KinmenCounty"
  }
  else if (place.match("台灣") || (place.match("臺灣"))) {
    return "Taiwan"
  }
  else if (place.match("高雄")) {
    return "Kaohsiung"
  }
  else {
    bot[bot.length] = "BOT：目前尚未加入，敬請期待<br/>"
    return 0;
  }

}
//取數字
function showIntFromString(text) {
  var num_g = text.match(/\d+/);
  if (num_g != null) {
    return num_g[0]
  } else {
    return "找不到數字";
  }
}
//port
app.listen(3000, function () {
  console.log('Listening on port 3000!');
});





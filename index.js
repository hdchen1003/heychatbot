

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
  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


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
  var Gplace_str = ''
  var myLocation = ''
  var dfURL = 'https://api.dialogflow.com/v1/query?v=20150910&lang=en&sessionId=0&query='
  var dfKey = 'Bearer 95ff53816d7b4b419c23b31907038aaa'
  var ip = "127.0.0.1:3000"
  var port = '3000'
  var when_login_select_num = 8 //當登入時讀取幾則訊息
  var ID = ""
  var Train = []; //紀錄起站到迄站
  var delTRA = "";
  var bot = [];
  var friendList = [];
  bot[bot.length] = "BOT：安安你好!!<br/>";
  var session = [];
  var mylove = [];
  var invite = [];
  var google_map = [];
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


  res.render('pages/index', {
    message: "歡迎使用本產品",
    send: get_str(),
    ID: ID,
    ip: ip,
  });
});
app.get('/loginin', function (req, res) {

  if (req.cookies.accountStatus) {
    res.render('pages/main', {
      message: "歡迎使用本產品",
      send: get_str(),
      ID: ID,
      ip: ip,
    });
  }
  else {
    res.render('pages/login', {
      message: "歡迎使用本產品",
      send: get_str(),
      ID: ID,
      ip: ip,
    });
  }
});
app.post('/login', function (req, res) {

  con.query('SELECT * FROM heychatbot.user WHERE id=\'' + req.body.ID + '\' and pwd=\'' + req.body.pwd + '\'', function (err, result, fields) {
    if (result != "") {
      if (result[0].id == req.body.ID && result[0].pwd == req.body.pwd) {
        var username = result[0].name

        res.cookie('accountStatus', result[0].id) //當作session使用 
        res.cookie('schedule_now', result[0].schedule_now) //當作session使用 
        con.query('SELECT * FROM heychatbot.message WHERE u_id=\'' + req.body.ID + '\' order by m_id desc limit ' + when_login_select_num + ' ', function (err, result, fields) {
          // for (var i = (result.length) - 1; i >= 0; i--) {
          //   bot[bot.length] = {
          //     message: result[i].message,
          //     class: result[i].class,
          //     canadd: result[i].canadd
          //   }
          // }

          // result.forEach(input => {
          //   bot[bot.length] = input.message;
          // });

          res.render('pages/loginSuccess', {
            message: "早安" + username,
            send: get_str(),
            ID: req.cookies.accountStatus,
            ip: ip,
          });

        })
      }
    }
    else {
      res.render('pages/index', {
        message: "帳密錯誤",
        send: get_str(),
        ID: req.cookies.accountStatus,
        ip: ip,
      });
    }
  });
});
app.get('/trytrylook', function (req, res) {
  con.query('SELECT * FROM heychatbot.user WHERE id=\'' + req.cookies.accountStatus + '\' ', function (err, result, fields) {
    if(result[0].schedule_num == 0){
      res.render('pages/main', {
        message: "早安",
        send: '<meta http-equiv="refresh" content="0;url=http://' + ip + '/schedule" />',
        ID: req.cookies.accountStatus,
        ip: ip,
      });
    }
    else{
      res.render('pages/main', {
        message: "早安",
        send: get_str(),
        ID: req.cookies.accountStatus,
        ip: ip,
      });
    }
  })
 

});
app.get('/try',function(req,res){
  res.render('pages/try_main', {
    message: "歡迎使用本產品",
    send: get_str(),
    ID: ID,
    ip: ip,
  });
})
app.get('/logout', function (req, res) {
  if (req.cookies.accountStatus != "") {
    bot.forEach(input => {
      con.query('INSERT INTO heychatbot.message (`u_id`, `message`, `time`,`class`,`canadd`) VALUES (\'' + req.cookies.accountStatus + '\',\'' + input.message + '\', \'' + now + '\',\'' + input.class + '\',\'' + input.canadd + '\')', function (err, result, fields) {
      });
    });
  }
  res.cookie('accountStatus', "")
  res.cookie('schedule_now', "")
  res.cookie('latitude', "")
  res.cookie('longitude', "")
  bot.length = 0;
  setTimeout(function () {
    res.render('pages/logoutSuccess', {
      message: "登出成功",
      send: get_str(),
      ID: req.cookies.accountStatus,
      ip: ip,
    });
  }, 500);


});
app.get('/signup', function (req, res) {

  res.render('pages/signup', {
    message: "歡迎加入我們",
    ID: req.cookies.accountStatus,
    ip: ip,
  });

});
app.post('/doSignup', function (req, res) {
  if (req.body.ID != "" && req.body.pwd != "" && req.body.pwd2 != "" && req.body.name != "" && req.body.birth != "" && req.body.email != "" && req.body.gender != "") {
    con.query('SELECT id FROM heychatbot.user WHERE id=\'' + req.body.ID + '\'', function (err, result, fields) {
      if (result == "") {
        if (req.body.pwd != req.body.pwd2) {
          res.render('pages/index', {
            message: "密碼不一致",
            ID: req.cookies.accountStatus,
            ip: ip,
          });
        }
        else {
          con.query('INSERT INTO `heychatbot`.`user` (`id`, `pwd`, `name`, `email`, `birth`, `gender`) VALUES (\'' + req.body.ID + '\', \'' + req.body.pwd + '\', \'' + req.body.name + '\', \'' + req.body.email + '\', \'' + req.body.birth + '\', \'' + req.body.gender + '\')', function (err, result, fields) {
            res.render('pages/index', {
              message: "註冊成功",
              ID: req.cookies.accountStatus,
              ip: ip,
            });
          })

        }
      }
      else {
        res.render('pages/index', {
          message: "帳號已經被註冊了",
          ID: req.cookies.accountStatus,
          ip: ip,
        });
      }
    });
  }
  else {
    res.render('pages/index', {
      message: "有欄位漏填",
      ID: req.cookies.accountStatus,
      ip: ip,
    });
  }
});
app.get('/info', function (req, res) {

  res.render('pages/info', {
    message: "歡迎加入我們",
    ID: req.cookies.accountStatus,
    ip: ip,
  });

});
app.get('/addstr', function (req, res) {

  res.render('pages/main', {
    send: get_str(),
    message: "歡迎加入我們",
    ID: req.cookies.accountStatus,
    ip: ip,
  });

});
app.get('/favorite', function (req, res) {

  res.render('pages/favorite', {
    message: "歡迎加入我們",
    ip: ip,
    ID: req.cookies.accountStatus,
    send: get_str_mylove()
  });

});
app.get('/guide', function (req, res) {

  res.render('pages/guide', {
    message: "歡迎加入我們",
    ip: ip,
    ID: req.cookies.accountStatus,
    send: get_str_mylove()
  });

});
app.get('/setting', function (req, res) {

  res.render('pages/setting', {
    message: "歡迎加入我們",
    ip: ip,
    ID: req.cookies.accountStatus,
    send: get_str_mylove()
  });

});
app.get('/private', function (req, res) {

  res.render('pages/private', {
    message: "歡迎加入我們",
    ID: req.cookies.accountStatus,
    ip: ip,
    send: get_str_mylove()
  });

});
app.get('/friend', function (req, res) {
  friendList.length = 0
  con.query('SELECT * FROM heychatbot.myfriend WHERE u_id1= \'' + req.cookies.accountStatus + '\' OR  u_id2= \'' + req.cookies.accountStatus + '\' ', function (err, result, fields) {
    if (err) {
    }
    else {
      if (result) {
        for (var i = 0; i < result.length; i++) {
          if (result[i].u_id1 == req.cookies.accountStatus) {
            friendList[friendList.length] = {
              item: result[i].u_id2,
              user: req.cookies.accountStatus,
              f_id: result[i].f_id
            }
          }
          else {
            friendList[friendList.length] = {
              item: result[i].u_id1,
              user: req.cookies.accountStatus,
              f_id: result[i].f_id
            }
          }
        }
      }
      res.render('pages/seeMyfriend', {
        message: "歡迎加入我們",
        ID: req.cookies.accountStatus,
        ip: ip,
        send: get_str_mylove(),
        myfriends: get_fstr(req.cookies.accountStatus)
      });
    }
  })
  // OR   u_id2=\'' + req.cookies.accountStatus + '\'  ,,,,\'' + req.cookies.accountStatus + '\' .....for (var i = 0; i < result.length; i++) {
});
app.get('/invite', function (req, res) {
  con.query('SELECT * FROM heychatbot.inviting WHERE invitee=\'' + req.cookies.accountStatus + '\'', function (err, result, fields) {
    if (err) {
    }
    else {
      if (result) {
        for (var i = 0; i < invite.length; i++) {
          if (invite[i].user == req.cookies.accountStatus) {
            invite.splice(i, 1, "")
          }
        }
        for (var i = 0; i < result.length; i++) {
          invite[invite.length] = {
            user: req.cookies.accountStatus,
            item: result[i].inviter,
            i_id: result[i].i_id
          }
        }
      }
      res.render('pages/addfriend', {
        message: "歡迎加入我們",
        ID: req.cookies.accountStatus,
        ip: ip,
        invite: get_istr(req.cookies.accountStatus)
      });
    }
  })
});
app.post('/do_invite', function (req, res) {
  con.query('SELECT * FROM heychatbot.user WHERE  id=\'' + req.body.f_id + '\'', function (err, result, fields) { //檢查受邀者是否存在
    if (err) {
      throw err
    }
    else {
      if (result == '') {
        res.render('pages/addfriend', {
          message: "查無此ID",
          ID: req.cookies.accountStatus,
          ip: ip,
          invite: get_istr(req.cookies.accountStatus)
        });
      }
      else {
        if (req.body.f_id == req.cookies.accountStatus) {
          res.render('pages/addfriend', {
            message: "不能邀請自己哦~",
            ID: req.cookies.accountStatus,
            ip: ip,
            invite: get_istr(req.cookies.accountStatus)
          });
        }
        else {
          con.query('SELECT * FROM heychatbot.inviting WHERE (inviter=\'' + req.cookies.accountStatus + '\' and invitee=\'' + req.body.f_id + '\') OR (invitee=\'' + req.cookies.accountStatus + '\' and inviter=\'' + req.body.f_id + '\')', function (err, result, fields) {
            if (err) {//檢查是否正在邀請中
              throw err
            }
            else {
              if (result == '') {
                con.query('SELECT * FROM heychatbot.myfriend WHERE (u_id1=\'' + req.cookies.accountStatus + '\' and u_id2=\'' + req.body.f_id + '\') OR (u_id2=\'' + req.cookies.accountStatus + '\' and u_id1=\'' + req.body.f_id + '\')', function (err, result, fields) {
                  if (err) {//檢查是否已經是好友
                    throw err
                  }
                  else {
                    if (result == '') {
                      con.query('INSERT INTO `heychatbot`.`inviting` (`inviter`, `invitee`) VALUES (\'' + req.cookies.accountStatus + '\', \'' + req.body.f_id + '\')', function (err, result, fields) {
                        if (err) {
                        }
                        else {
                          res.render('pages/addfriend', {
                            message: "邀請成功",
                            ID: req.cookies.accountStatus,
                            ip: ip,
                            invite: get_istr(req.cookies.accountStatus)
                          });
                        }
                      });
                    }
                    else {
                      res.render('pages/addfriend', {
                        message: "我們已經是好友了",
                        ID: req.cookies.accountStatus,
                        ip: ip,
                        invite: get_istr(req.cookies.accountStatus)
                      });
                    }
                  }
                })
              }
              else {
                res.render('pages/addfriend', {
                  message: "正在邀請中",
                  ID: req.cookies.accountStatus,
                  ip: ip,
                  invite: get_istr(req.cookies.accountStatus)
                });
              }
            }
          })
        }
      }
    }
  })

});
app.post('/accept_refuse', function (req, res) {
  if (req.body.yn == 'accept') {
    con.query('INSERT INTO `heychatbot`.`myfriend` (`u_id1`, `u_id2`) VALUES (\'' + req.cookies.accountStatus + '\', \'' + req.body.id + '\')', function (err, result, fields) {
      if (err) {
      }
      else {
        con.query('DELETE FROM `heychatbot`.`inviting` WHERE i_id = \'' + req.body.i_id + '\'', function (err, result, fields) {
          if (err) {
          }
          else {
            con.query('SELECT * FROM heychatbot.inviting WHERE invitee=\'' + req.cookies.accountStatus + '\' ', function (err, result, fields) {
              if (err) {
              }
              else {
                for (var i = 0; i < invite.length; i++) {
                  if (invite[i].user == req.cookies.accountStatus) {
                    invite.splice(i, 1, "")
                  }
                }
                for (var i = 0; i < result.length; i++) {
                  invite[invite.length] = {
                    user: req.cookies.accountStatus,
                    item: result[i].inviter,
                    i_id: result[i].i_id
                  }
                }
                res.render('pages/addfriend', {
                  message: "歡迎加入我們",
                  ID: req.cookies.accountStatus,
                  ip: ip,
                  invite: get_istr(req.cookies.accountStatus)
                });
              }
            })
          }
        });
      }
    });
  }
  else {
    con.query('DELETE FROM `heychatbot`.`inviting` WHERE i_id = \'' + req.body.i_id + '\'', function (err, result, fields) {
      if (err) {
      }
      else {
        con.query('SELECT * FROM heychatbot.inviting WHERE invitee=\'' + req.cookies.accountStatus + '\' ', function (err, result, fields) {
          if (err) {
          }
          else {
            for (var i = 0; i < invite.length; i++) {
              if (invite[i].user == req.cookies.accountStatus) {
                invite.splice(i, 1, "")
              }
            }
            for (var i = 0; i < result.length; i++) {
              invite[invite.length] = {
                user: req.cookies.accountStatus,
                item: result[i].inviter,
                i_id: result[i].i_id
              }
            }
            res.render('pages/addfriend', {
              message: "歡迎加入我們",
              ID: req.cookies.accountStatus,
              ip: ip,
              invite: get_istr(req.cookies.accountStatus)
            });
          }
        })
      }
    });
  }
});
app.get('/myaccount', function (req, res) {

  con.query('SELECT * FROM heychatbot.user WHERE id=\'' + req.cookies.accountStatus + '\' ', function (err, result, fields) {
    var accountinfo = ''
    if (err) {
    }
    else {
      accountinfo += '<table class="myacc_form" border=2><tr><td class="myacc_sectitle">帳號</td><td class="myacc_sectitle">' + result[0].id + '</td></tr><tr><td class="myacc_sectitle">姓名</td><td class="myacc_sectitle">' + result[0].name + '</td></tr><tr><td class="myacc_sectitle">生日</td><td class="myacc_sectitle">' + result[0].birth + '</td></tr><tr><td class="myacc_sectitle">性別</td><td class="myacc_sectitle">' + result[0].gender + '</td></tr><tr><td class="myacc_sectitle">聯絡信箱</td><td class="myacc_sectitle">' + result[0].email + '</td></tr></table>'
      res.render('pages/myaccount', {
        message: "歡迎加入我們",
        ip: ip,
        ID: req.cookies.accountStatus,
        send: accountinfo
      });
    }
  })


});
app.get('/modifyaccount', function (req, res) {

  con.query('SELECT * FROM heychatbot.user WHERE id=\'' + req.cookies.accountStatus + '\' ', function (err, result, fields) {
    var accountinfo = ''
    if (err) {
    }
    else {
      accountinfo += '<form  class="modacc_form" action="http://' + ip + '/do_modifyaccount"  method="post"><table border=1><tr><td class="modacc_title">帳號</td><td class="modacc_context">' + result[0].id + '</td></tr><tr><td class="modacc_title">姓名</td><td ><input class="modacc_input" type="text" name="name" value=' + result[0].name + ' ></td></tr><tr><td class="modacc_title">生日</td><td class="modacc_context">' + result[0].birth + '</td></tr><tr><td class="modacc_title">性別</td><td class="modacc_context">' + result[0].gender + '</td></tr><tr><td class="modacc_title">聯絡信箱</td><td><input class="modacc_input" type="text" name="email" value=' + result[0].email + ' ></td></tr></table><input  class="modacc_submit" type="submit" ></form>'
      res.render('pages/modifyaccount', {
        message: "歡迎加入我們",
        ip: ip,
        ID: req.cookies.accountStatus,
        send: accountinfo
      });
    }
  })

});
app.post('/do_modifyaccount', function (req, res) {
  con.query('UPDATE  heychatbot.user SET email=\'' + req.body.email + '\' , name=\'' + req.body.name + '\' WHERE id=\'' + req.cookies.accountStatus + '\' ', function (err, result, fields) {
    if (err) {

    }
    else {
      con.query('SELECT * FROM heychatbot.user WHERE id=\'' + req.cookies.accountStatus + '\' ', function (err, result, fields) {
        var accountinfo = ''
        if (err) {
        }
        else {
          accountinfo += '<table border=1><tr><td>帳號</td><td>' + result[0].id + '</td></tr><tr><td>姓名</td><td>' + result[0].name + '</td></tr><tr><td>生日</td><td>' + result[0].birth + '</td></tr><tr><td>性別</td><td>' + result[0].gender + '</td></tr><tr><td>聯絡信箱</td><td>' + result[0].email + '</td></tr></table>'
          res.render('pages/myaccount', {
            message: "修改成功",
            ip: ip,
            ID: req.cookies.accountStatus,
            send: accountinfo
          });
        }
      })
    }
  })


});
app.get('/findpwd', function (req, res) {

  res.render('pages/findpwd', {
    message: "歡迎加入我們",
    ip: ip,
    ID: req.cookies.accountStatus,
    send: get_str_mylove()
  });

});
app.post('/do_findpwd', function (req, res) {

  con.query('SELECT * FROM heychatbot.user WHERE id=\'' + req.body.id + '\' and email=\'' + req.body.email + '\' ', function (err, result, fields) {
    if (err) {
    }
    else {
      if (result != '') {

        res.render('pages/seepwd', {
          message: "歡迎加入我們",
          ip: ip,
          ID: req.cookies.accountStatus,
          send: '您的密碼是：' + result[0].pwd
        });
      }
      else {
        res.render('pages/seepwd', {
          message: "歡迎加入我們",
          ip: ip,
          ID: req.cookies.accountStatus,
          send: '找不到此用戶'
        });
      }
    }
  })


});
app.get('/gps', function (req, res) {

  res.render('pages/gps', {
    message: "歡迎加入我們",
    //  ID: req.cookies.accountStatus,
    ip: ip,
    //  send: get_str_mylove()
  });

});
app.post('/nearby', function (req, res) {
  res.cookie('latitude', req.body.latitude)
  res.cookie('longitude', req.body.longitude)
  res.render('pages/nearby', {
    message: "歡迎加入我們",
    ID: req.cookies.accountStatus,
    ip: ip,
    context: '<meta http-equiv="refresh" content="0;url=http://' + ip + '/nearby" />',
    search: '<form action="http://' + ip + '/nearby_search" method="POST">手動輸入地點<input type="text" name="location_search" ><button type="submit"> 搜尋 </button></form> ' + '<br>'
  });
});
app.get('/nearby', function (req, res) {
  if (req.cookies.latitude == '') {
    res.render('pages/nearby', {
      message: "歡迎加入我們",
      ID: req.cookies.accountStatus,
      ip: ip,
      context: '<meta http-equiv="refresh" content="0;url=http://' + ip + '/gps" />',
      search: '<form action="http://' + ip + '/nearby_search" method="POST">手動輸入地點<input type="text" name="location_search" ><button type="submit"> 搜尋 </button></form> ' + '<br>'
    });
  }
  else {
    request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + req.cookies.latitude + ',' + req.cookies.longitude + '&radius=1500&type=food,school&key=AIzaSyBESYepKT52UftY_Bad3sX7h1lbMB99CcE', {
      json: true
    }, function (err, data) {
      if (err) {
        throw err
      }
      else {
        Gplace_str = ''

        for (var i = 0; i < data.results.length; i++) {
          var place_id = data.results[i].place_id

          request('https://maps.googleapis.com/maps/api/place/details/json?placeid=' + place_id + '&fields=name,rating,formatted_phone_number,vicinity,type,opening_hours,review&key=AIzaSyBESYepKT52UftY_Bad3sX7h1lbMB99CcE&language=zh-TW', {
            json: true
          }, function (err, data2) {
            var rating = data2.result.rating
            var phone = data2.result.formatted_phone_number
            var type = typeTochinese(data2.result.types[0])
            var address = data2.result.vicinity
            var rating_count = 0
            var review = '尚無評論'



            if (data2.result.reviews != undefined) {
              for (var j = 0; j < data2.result.reviews.length; j++) {

                if (data2.result.reviews[j].rating > rating_count) {
                  rating_count = data2.result.reviews[j].rating;
                  review = data2.result.reviews[j].text
                }
              }
            }


            if (rating != undefined) {
              Gplace_str += '<tr><td>' + data2.result.name + '<br>'
              Gplace_str += '評分：' + rating + '<br/>電話：' + phone + '<br/>類型：' + type + '<br/>地址：' + address + '<br/>評論：' + review + '<br/>'
              Gplace_str += '<form action="http://' + ip + '/addTOfavorite_nearby" method="POST"><input type="hidden" name="value" value="' + review + '"><input type="hidden" name="address" value="' + address + '"><input type="hidden" name="type" value="' + type + '"><input type="hidden" name="phone" value="' + phone + '"><input type="hidden" name="arrnum" value="' + data2.result.name + '"><button type="submit"> <img src="img/7pF0p0K.jpg" height="10" width="10" alt=""> </button></form> '
              Gplace_str += '</tr></td>'
            }
          })
        }

        res.render('pages/nearby', {
          message: "歡迎加入我們",
          ID: req.cookies.accountStatus,
          ip: ip,
          context: '搜尋中<meta http-equiv="refresh" content="2;url=http://' + ip + '/nearby_buffer" />',
          search: '<form action="http://' + ip + '/nearby_search" method="POST">手動輸入地點<input type="text" name="location_search" ><button type="submit"> 搜尋 </button></form> ' + '<br>'
        });
      }
    });
  }
});
app.get('/nearby_buffer', function (req, res) {

  res.render('pages/nearby', {
    message: "歡迎加入我們",
    ID: req.cookies.accountStatus,
    ip: ip,
    context: Gplace_str,
    search: '<form action="http://' + ip + '/nearby_search" method="POST">手動輸入地點<input type="text" name="location_search" ><button type="submit"> 搜尋 </button></form> ' + '<br>'
  });
})
app.post('/addTOfavorite_nearby', function (req, res) {
  con.query('INSERT INTO heychatbot.schedule_content (`sch_id`, `c_name`, `c_class`, `c_content`) VALUES (\'' + req.cookies.schedule_now + '\', \'' + req.body.value + '\', \'' + req.body.value + '\', \'' + req.body.value + '\')', function (err, result, fields) { })
  request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + req.cookies.latitude + ',' + req.cookies.longitude + '&radius=1500&type=food,school&key=AIzaSyBESYepKT52UftY_Bad3sX7h1lbMB99CcE', {
    json: true
  }, function (err, data) {
    if (err) {
      throw err
    }
    else {
      var str = ''
      data.results.forEach(element => {
        str += element.name + '<form action="http://' + ip + '/addTOfavorite_nearby" method="POST"><input type="hidden" name="value" value="' + element.name + '"><input type="hidden" name="arrnum" value="' + element.name + '"><button type="submit"> <img src="img/7pF0p0K.jpg" height="10" width="10" alt=""> </button></form> ' + '<br>'
      });
      res.render('pages/nearby', {
        message: "歡迎加入我們",
        ID: req.cookies.accountStatus,
        ip: ip,
        context: str,
        search: '<form action="http://' + ip + '/nearby_search" method="POST">手動輸入地點<input type="text" name="location_search" ><button type="submit"> 搜尋 </button></form> ' + '<br>'
      });
    }
  });


});
app.post('/addTOfavorite', function (req, res) {
  con.query('INSERT INTO heychatbot.schedule_content (`sch_id`, `c_name`, `c_class`, `c_content`) VALUES (\'' + req.cookies.schedule_now + '\', \'' + req.body.value + '\', \'' + req.body.value + '\', \'' + req.body.value + '\')', function (err, result, fields) { })
  res.render('pages/main', {
    message: "歡迎加入我們",
    ID: req.cookies.accountStatus,
    ip: ip,
    send: get_str()
  });

});
app.post('/nearby_search', function (req, res) {
  request('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(req.body.location_search) + '&key=AIzaSyBESYepKT52UftY_Bad3sX7h1lbMB99CcE', {
    json: true
  }, function (err, data) {
    res.cookie('latitude', data.results[0].geometry.location.lat)
    res.cookie('longitude', data.results[0].geometry.location.lng)
    res.render('pages/nearby', {
      message: "歡迎加入我們",
      ID: req.cookies.accountStatus,
      ip: ip,
      context: '<meta http-equiv="refresh" content="0;url=http://' + ip + '/nearby" />',
      search: '<form action="http://' + ip + '/nearby_search" method="POST">手動輸入地點 <input type="text" name="location_search" ><button type="submit"> 搜尋 </button></form> ' + '<br>'

    });
  })
})
app.get('/schedule', function (req, res) {
  con.query('SELECT * FROM heychatbot.schedule WHERE id=\'' + req.cookies.accountStatus + '\'  ', function (err, result, fields) {
    if (err) {
    }
    else {
      if (result != '') {
        var str = '<div class="schedule">'
        for (var i = 0; i < result.length; i++) {
         
          str += ' <div class="sch_title"> <h2><form method="post" action="http://' + ip + '/schedule_content"> <input type="hidden" name="sch_id" value=' + result[i].sch_id + '> <button type="submit">' + result[i].sName + '</button></form></h2>'
          str += '<div class="sch_name"><p>' + result[i].sDate + '</p></div></div>'
       //   str += '<form method="post" action="http://' + ip + '/delete_schedule"> <input type="hidden" name="sch_id" value=' + result[i].sch_id + '> <button type="submit">刪除此行程</button></form>'
        }
        str += '</div>'
        res.render('pages/schedule', {
          message: "歡迎加入我們",
          ID: req.cookies.accountStatus,
          ip: ip,
          send: str
        });
      }
      else {
        res.render('pages/schedule', {
          message: "歡迎加入我們",
          ID: req.cookies.accountStatus,
          ip: ip,
          send: '您尚未登入或未建立行程'
        });
      }
    }
  })


});
app.post('/schedule_content', function (req, res) {
  con.query('UPDATE  heychatbot.user SET schedule_now = \'' + req.body.sch_id + '\' WHERE id = \'' + req.cookies.accountStatus + '\'', function (err, result, fields) {
    res.cookie('schedule_now', req.body.sch_id)
  })
  con.query('SELECT * FROM heychatbot.schedule_content WHERE sch_id=\'' + req.body.sch_id + '\'  ', function (err, result, fields) {
    if (err) {
    }
    else {
      if (result != '') {
        var str = ''
        for (var i = 0; i < result.length; i++) {
          str += '<p>' + result[i].c_name + '</p>'
          str += '<p>' + result[i].c_content + '</p><br/>'
          str += '<form method="post" action="http://' + ip + '/delete_schedule_content"> <input type="hidden" value=' + result[i].content_id + ' name="content_id"><input type="hidden" value=' + result[i].sch_id + ' name="sch_id"> <button type="submit">刪除此活動</button></form>'

        }
        res.render('pages/schedule_content', {
          message: "歡迎加入我們",
          ID: req.cookies.accountStatus,
          ip: ip,
          send: str
        });
      }
      else {
        res.render('pages/schedule_content', {
          message: "歡迎加入我們",
          ID: req.cookies.accountStatus,
          ip: ip,
          send: '您尚未登入或未建立行程'
        });
      }
    }
  })


});
app.get('/add_schedule', function (req, res) {

  var str = '<form action="http://' + ip + '/do_add_schedule" method="post"> 行程名稱 <input type="text" name="sName" ><br/> 起始日期 <input type="date" name="sDate" ><br/>結束日期 <input type="date" name="sDate2" > <input type="hidden" name="id" value=' + req.cookies.accountStatus + ' ><input type="submit" value="創立行程"></form>'

  res.render('pages/schedule', {
    message: "歡迎加入我們",
    ID: req.cookies.accountStatus,
    ip: ip,
    send: str
  });
});
app.post('/do_add_schedule', function (req, res) {
  req.body.sDate += '至' + req.body.sDate2
  con.query('INSERT INTO heychatbot.schedule (`id`, `sName`, `sDate`) VALUES (\'' + req.body.id + '\', \'' + req.body.sName + '\', \'' + req.body.sDate + '\')', function (err, result, fields) {
    if (err) {
    }
    else {
      con.query('SELECT * FROM heychatbot.user WHERE id=\'' + req.cookies.accountStatus + '\'  ', function (err, result, fields) {
        var schedule_num = result[0].schedule_num +1
        con.query('UPDATE  heychatbot.user SET  schedule_num=\'' + schedule_num + '\' WHERE id=\'' + req.cookies.accountStatus + '\' ', function (err, result, fields) {})
      })
      
      con.query('SELECT * FROM heychatbot.schedule WHERE id=\'' + req.cookies.accountStatus + '\'  ', function (err, result, fields) {
        if (err) {
        }
        else {
          if (result != '') {
            var str = ''
            for (var i = 0; i < result.length; i++) {
              str += '<p>' + result[i].sName + result[i].sDate + '</p>'
              str += '<form method="post" action="http://' + ip + '/schedule_content"> <input type="hidden" name="sch_id" value=' + result[i].sch_id + '> <button type="submit">' + result[i].sName + '</button></form>'
              str += '<form method="post" action="http://' + ip + '/delete_schedule"> <input type="hidden" name="sch_id" value=' + result[i].sch_id + '> <button type="submit">刪除此行程</button></form>'
            }
            res.render('pages/schedule', {
              message: "歡迎加入我們",
              ID: req.cookies.accountStatus,
              ip: ip,
              send: str
            });
          }
          else {
            res.render('pages/schedule', {
              message: "歡迎加入我們",
              ID: req.cookies.accountStatus,
              ip: ip,
              send: '您尚未登入或未建立行程'
            });
          }
        }
      })
    }
  })








});
app.post('/delete_schedule', function (req, res) {

  con.query('DELETE  FROM heychatbot.schedule WHERE sch_id=\'' + req.body.sch_id + '\'  ', function (err, result, fields) {
    con.query('SELECT * FROM heychatbot.schedule WHERE id=\'' + req.cookies.accountStatus + '\'  ', function (err, result, fields) {
      if (err) {
      }
      else {
        con.query('SELECT * FROM heychatbot.user WHERE id=\'' + req.cookies.accountStatus + '\'  ', function (err, result, fields) {
          var schedule_num = result[0].schedule_num -1
          con.query('UPDATE  heychatbot.user SET  schedule_num=\'' + schedule_num + '\' WHERE id=\'' + req.cookies.accountStatus + '\' ', function (err, result, fields) {})
        })
        if (result != '') {
          var str = ''
          for (var i = 0; i < result.length; i++) {
            str += '<p>' + result[i].sName + result[i].sDate + '</p>'
            str += '<form method="post" action="http://' + ip + '/schedule_content"> <input type="hidden" name="sch_id" value=' + result[i].sch_id + '> <button type="submit">' + result[i].sName + '</button></form>'
            str += '<form method="post" action="http://' + ip + '/delete_schedule"> <input type="hidden" name="sch_id" value=' + result[i].sch_id + '> <button type="submit">刪除此行程</button></form>'
          }
          res.render('pages/schedule', {
            message: "歡迎加入我們",
            ID: req.cookies.accountStatus,
            ip: ip,
            send: str
          });
        }
        else {
          res.render('pages/schedule', {
            message: "歡迎加入我們",
            ID: req.cookies.accountStatus,
            ip: ip,
            send: '您尚未登入或未建立行程'
          });
        }
      }
    })
  })

});
app.post('/delete_schedule_content', function (req, res) {

  con.query('DELETE  FROM heychatbot.schedule_content WHERE content_id=\'' + req.body.content_id + '\'  ', function (err, result, fields) {
    con.query('SELECT * FROM heychatbot.schedule_content WHERE sch_id=\'' + req.body.sch_id + '\'  ', function (err, result, fields) {
      if (err) {
      }
      else {
        if (result != '') {
          var str = ''
          for (var i = 0; i < result.length; i++) {
            str += '<p>' + result[i].c_name + '</p>'
            str += '<p>' + result[i].c_content + '</p><br/>'
            str += '<form method="post" action="http://' + ip + '/delete_shcedule_content"> <input type="hidden" value=' + result[i].content_id + '> <button type="submit">刪除此活動</button></form>'

          }
          res.render('pages/schedule_content', {
            message: "歡迎加入我們",
            ID: req.cookies.accountStatus,
            ip: ip,
            send: str
          });
        }
        else {
          res.render('pages/schedule_content', {
            message: "歡迎加入我們",
            ID: req.cookies.accountStatus,
            ip: ip,
            send: '您尚未登入或未建立行程'
          });
        }
      }
    })

  })

});
//回應後
app.post('/addstr', function (req, res) {
  //丟dailogflow
  var df_xhr = new XMLHttpRequest();
  df_xhr.open('get', "" + dfURL + encodeURI(req.body.addstr) + "");
  df_xhr.setRequestHeader("Authorization", dfKey);
  df_xhr.send('');
  df_xhr.onload = function () {

    var df_data = JSON.parse(df_xhr.responseText);

    if (df_data.status.code == '200') {
      var df_intent = df_data.result.metadata.intentName

    }//確認是有傳回dailogflow資料
    google_map[0] = { value: '', user: '' }
    if (df_data.result.parameters.type) {
      google_map[0] = { value: df_data.result.parameters.type, user: req.cookies.accountStatus }
    }

    //start <3 ~~
    if (req.body.addstr == "初始化" || req.body.addstr == "clear") {
      for (var i = 0; i < session.length; i++) {
        session[i] = ""
      }

      bot.length = 0;

      bot[bot.length] = {
        message: "YOU：" + req.body.addstr,
        class: "input",
        canadd: 0,
        type: 'str'
      }
      bot[bot.length] = {
        message: "BOT：初始化完畢",
        class: "notif",
        canadd: 0,
        type: 'str'
      }

      res.render('pages/main.ejs', {
        message: "早安",
        ID: req.cookies.accountStatus,
        send: get_str(),
        ip: ip,
      });
    }
    else if (req.body.addstr == "我的最愛") {
      bot[bot.length] = {
        message: "YOU：" + req.body.addstr,
        class: "input",
        canadd: 0,
        type: 'str'
      }
      opMylove();
      res.render('pages/main.ejs', {
        message: "早安",
        send: get_str(),
        ID: req.cookies.accountStatus,
        ip: ip,
      });
    }
    else if (df_data.result.parameters.type && df_data.result.parameters.geocity) {
      request('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(df_data.result.parameters.geocity) + '&key=AIzaSyBESYepKT52UftY_Bad3sX7h1lbMB99CcE', {
        json: true
      }, function (err, data) {
        if (err) {
          throw err
        }
        else {

          if (google_map[0].user != req.cookies.accountStatus) {
            google_map[0] = ""
          }//如果google map api非現在使用者就不給使用
          request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + data.results[0].geometry.location.lat + ',' + data.results[0].geometry.location.lng + '&radius=1500&type=' + df_data.result.parameters.type + '&keyword=' + encodeURI(req.body.addstr) + '&key=AIzaSyBESYepKT52UftY_Bad3sX7h1lbMB99CcE', {
            json: true
          }, function (err, data2) {
            if (err) {
              throw err
            }
            else {
              bot[bot.length] = {
                message: "YOU：" + req.body.addstr,
                class: "input",
                canadd: 0,
                type: 'str'
              }
              if (data2.status != 'ZERO_RESULTS') {
                for (var i = 0; i < data2.results.length; i++) {

                  bot[bot.length] = {
                    message: "BOT：附近的景點有 - " + data2.results[i].name,
                    class: "notif",
                    canadd: 1,
                    value: data2.results[i].name,
                    arraynum: bot.length,
                    type: 'str'
                  }

                }
              }
              google_map[0] = ""
              res.render('pages/main.ejs', {
                message: "早安",
                ID: req.cookies.accountStatus,
                send: get_str(),
                ip: ip,
              });
            }
          });
        }
      });
      session[0] = ""
    }
    else {


      if (session[0] == 'place') {
        request('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(req.body.addstr) + '&key=AIzaSyBESYepKT52UftY_Bad3sX7h1lbMB99CcE', {
          json: true
        }, function (err, data) {
          if (err) {
            throw err
          }
          else {

            if (google_map[0].user != req.cookies.accountStatus) {
              google_map[0] = ""
            }//如果google map api非現在使用者就不給使用
            request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + data.results[0].geometry.location.lat + ',' + data.results[0].geometry.location.lng + '&radius=1500&type=' + google_map[0].value + '&keyword=' + encodeURI(req.body.addstr) + '&key=AIzaSyBESYepKT52UftY_Bad3sX7h1lbMB99CcE', {
              json: true
            }, function (err, data2) {
              if (err) {
                throw err
              }
              else {
                bot[bot.length] = {
                  message: "YOU：" + req.body.addstr,
                  class: "input",
                  canadd: 0,
                  type: 'str'
                }
                if (data2.status != 'ZERO_RESULTS') {
                  for (var i = 0; i < data2.results.length; i++) {

                    bot[bot.length] = {
                      message: "BOT：附近的景點有 - " + data2.results[i].name,
                      class: "notif",
                      canadd: 1,
                      value: data2.results[i].name,
                      arraynum: bot.length,
                      type: 'str'
                    }

                  }
                }
                google_map[0] = ""
                res.render('pages/main.ejs', {
                  message: "早安",
                  ID: req.cookies.accountStatus,
                  send: get_str(),
                  ip: ip,
                });
              }
            });
          }
        });
        session[0] = ""
      }

      else if (session[0] == 'weather') {
        var placecode = placeTocode(req.body.addstr);
        request('http://opendata.cwb.gov.tw/opendataapi?dataid=' + placecode + '&authorizationkey=CWB-357C384E-33A3-4DFA-BBE8-AFF232297CF5&format=json', {
          json: true
        }, function (err, data) {
          if (err) throw err
          bot[bot.length] = {
            message: "YOU：" + req.body.addstr,
            class: "input",
            type: 'str',
            canadd: 0
          }
          bot[bot.length] = {
            message: "BOT：<br/><table class='sss' border=1><tr><td>溫度</td><td>體感溫度</td><td>天氣現象</td><td>降雨機率</td><td>舒適度</td> <td>我的最愛</td></tr>",
            class: "notif",
            canadd: 0,
            type: 'table_title'
          }
          for (var i = 0; i < 3; i++) {
            bot[bot.length] = {
              message: "<tr><td>" + data.cwbopendata.dataset.locations.location[1].weatherElement[0].time[i].elementValue.value + "°C</td><td>" + data.cwbopendata.dataset.locations.location[1].weatherElement[8].time[i].elementValue.value + "°C</td><td>" + data.cwbopendata.dataset.locations.location[1].weatherElement[9].time[i].elementValue[0].value + "</td><td>" + data.cwbopendata.dataset.locations.location[1].weatherElement[3].time[i].elementValue.value + "%</td><td>" + data.cwbopendata.dataset.locations.location[1].weatherElement[7].time[i].elementValue[1].value + "</td>",
              class: "weather",
              canadd: 1,
              value: req.body.addstr + '的氣溫是' + data.cwbopendata.dataset.locations.location[1].weatherElement[0].time[i].elementValue.value + '°C 降雨機率為' + data.cwbopendata.dataset.locations.location[1].weatherElement[3].time[i].elementValue.value + '%',
              arraynum: bot.length,
              type: 'table'
            }
          }
          bot[bot.length] = {
            message: "</table>",
            class: "notif",
            canadd: 0,
            type: 'str'
          }

          res.render('pages/main.ejs', {
            message: "早安",
            send: get_str(),
            ID: req.cookies.accountStatus,
            ip: ip,
          });
        });
        session[0] = ""
      }

      else if (session[0] == 'traffic') {
        search(req.body.addstr, req.cookies.accountStatus, df_intent, df_data)
        res.render('pages/main.ejs', {
          message: "早安",
          ID: req.cookies.accountStatus,
          send: get_str(),
          ip: ip,
        });

      }


      else if (session[0] == 'traffic_BUSnum') {
        session[1] = findPlace(req.body.addstr)
        search(req.body.addstr, req.cookies.accountStatus, df_intent, df_data)
        res.render('pages/main.ejs', {
          message: "早安",
          send: get_str(),
          ip: ip,
          ID: req.cookies.accountStatus,
        });
      }


      else if (session[0] == 'traffic_BUS') {
        session[2] = showIntFromString(req.body.addstr);
        axios.get('http://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/' + session[1] + '?$format=json', { // 參考(抄襲XD)noobTW
          headers: getAuthorizationHeader(),
        })
          .then(function (response) {
            for (var i = 0; i < response.data.length; i++) {
              if (response.data[i].RouteName.Zh_tw.match(session[2])) {
                bot[bot.length] = {
                  message: "<table border=1> <tr><td>編號</td> <td>去程</td> <td>回程</td> <td>我的最愛</td></tr>",
                  class: "notif",
                  canadd: 0,
                  type: 'table_title'
                }
                for (var j = 0; j < response.data[i].Stops.length; j++) {
                  bot[bot.length] = {
                    message: "<tr><td>" + (j + 1) + "</td><td>" + response.data[i].Stops[j].StopName.Zh_tw + "</td><td>" + response.data[i].Stops[response.data[i].Stops.length - j - 1].StopName.Zh_tw + "</td>",
                    class: "bus",
                    canadd: 1,
                    value: '搭乘的公車為' + response.data[i].Stops[j].StopName.Zh_tw + '號',
                    arraynum: bot.length,
                    type: 'table'
                  }
                }
                bot[bot.length] = {
                  message: "</table>",
                  class: "notif",
                  canadd: 0,
                  type: 'str'
                }
              }
              break;
            }
            session[0] = "", session[1] = "", session[2] = "";
            res.render('pages/main.ejs', {
              message: "早安",
              send: get_str(),
              ID: req.cookies.accountStatus,
              ip: ip,
            });

          });
      }


      else if (session[0] == 'traffic_TRA') {
        bot[bot.length] = {
          message: "YOU：" + req.body.addstr,
          class: "input",
          canadd: 0
          , type: 'str'
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
              message: "BOT：起站 - " + originName + " ，迄站 -  " + destinationName,
              class: "notif",
              canadd: 0,
              type: 'str'
            }
            bot[bot.length] = {
              message: "BOT：要搭幾月幾號的車？",
              class: "notif",
              canadd: 0,
              type: 'str'
            }
            Train = [originName, originID, destinationName, destinationID]
            delTRA = bot.length
            bot[bot.length] = {
              message: "<input type=\"date\" class=\"input\" name=\"time\">",
              class: "notif",
              canadd: 0,
              type: 'talbe'
            }
            res.render('pages/main.ejs', {
              message: "早安",
              send: get_str(),
              ID: req.cookies.accountStatus,
              ip: ip,
            });
            session[0] = "need_TRA_time";
          });
      }


      else if (session[0] == 'need_TRA_time') {
        //bot.splice(delTRA, 1, "")
        bot[bot.length] = {
          message: "YOU：" + req.body.time,
          class: "input",
          canadd: 0,
          type: 'str'
        }
        axios.get('http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/OD/' + Train[1] + '/to/' + Train[3] + '/' + req.body.time + '?&$format=json', { // 參考(抄襲XD)noobTW
          headers: getAuthorizationHeader(),
        })
          .then(function (response) {
            bot[bot.length] = {
              message: "BOT：<br/><table border=1><tr><td>車種</td><td>車次代碼</td><td>到站時間</td><td>備註</td><td>加入最愛</td></tr>",
              class: "notif",
              cabadd: 0,
              type: 'table_title'
            }
            for (var i = 0; i < response.data.length; i++) {
              bot[bot.length] = {
                message: "<tr><td>" + response.data[i].DailyTrainInfo.TrainTypeName.Zh_tw + "</td><td>" + response.data[i].DailyTrainInfo.TrainNo + "</td><td>" + response.data[i].OriginStopTime.ArrivalTime + "</td><td>" + response.data[i].DailyTrainInfo.Note.Zh_tw + "</td>",
                class: "notif",
                canadd: 1,
                value: '搭乘車種為' + response.data[i].DailyTrainInfo.TrainTypeName.Zh_tw + '號 第' + response.data[i].DailyTrainInfo.TrainNo + '車次 於' + response.data[i].OriginStopTime.ArrivalTime + '抵達',
                arraynum: bot.length,
                type: 'table'
              }
            }
            bot[bot.length] = {
              message: "</table>",
              class: "notif",
              canadd: 0,
              type: 'str'
            }
            res.render('pages/main.ejs', {
              message: "早安",
              send: get_str(),
              ID: req.cookies.accountStatus,
              ip: ip,
            });
          })

        session[0] = ""
      }
      /////////////////////////////////////////////////////////////////////////////////////////////// 
      //////////////////////////////////////////////////******************************************** */  /////
      else {//////////////////////////////////////////////////////////////////////////////////////////////////   
        search(req.body.addstr, req.cookies.accountStatus, df_intent, df_data)
        res.render('pages/main.ejs', {
          message: "早安",
          send: get_str(),
          ID: req.cookies.accountStatus,
          ip: ip,
        });
        var ifmeta = bot[bot.length - 1].message
        if (ifmeta.match('meta')) {
          bot[bot.length - 1] = ''
        }
      }
      //////////////////////////////////////////////////********************************************/////////// */
    }
  }
});

//搜尋語意
function search(input, user, df_input, data) {
  if (input.match("add") || input.match("加入")) {
    // Session[5]="add";
    if (bot[(bot.length - 2)].canadd == 1) {
      mylove[mylove.length] = bot[(bot.length - 1)]
      con.query('INSERT INTO heychatbot.favorite (`u_id`, `message`, `class`) VALUES (\'' + ID + '\',\'' + mylove[mylove.length - 1].message + '\',\'' + mylove[mylove.length - 1].class + '\')', function (err, result, fields) {
        if (err) {
        }
        else {
        }
        bot[bot.length] = {
          message: "BOT：我的最愛加入成功",
          class: "notif",
          canadd: 0,
          type: 'str'
        }
      });
    }
    else {
      bot[bot.length] = {
        message: "BOT：此項目不能加入最愛",
        class: "notif",
        canadd: 0,
        type: 'str'
      }
    }
  }
  else if (input.match("-h") || input.match("help") || input.match("HELP") || input.match("幫助") || input.match("如何使用")) {
    // Session[5]="add";

    bot[bot.length] = {
      message: "BOT：本系統目前提供幾種服務1.交通 2.地點 3.天氣 4.貓咪 5.初始化 6.add 7.有其他建議請聯絡我",
      class: "help",
      canadd: 0,
      type: 'str'
    }
  }
  else if (input.match("台鐵") || input.match("臺鐵") || input.match("火車") || df_input == 'TRA') {
    bot[bot.length] = {
      message: "YOU：" + input,
      class: "input",
      canadd: 0,
      type: 'str'
    }
    bot[bot.length] = {
      message: "BOT：起點站和終點站？",
      class: "notif",
      canadd: 0,
      type: 'str'
    }
    session[0] = "traffic_TRA";
  }
  else if (input.match("公車") || input.match("巴士") || input.match("客運") || df_input == 'BUS') {
    bot[bot.length] = {
      message: "YOU：" + input,
      class: "input",
      canadd: 0,
      type: 'str'
    }
    bot[bot.length] = {
      message: "BOT：哪個縣市？",
      class: "notif",
      canadd: 0,
      type: 'str'
    }
    session[0] = "traffic_BUSnum";
  }
  else if (session[0] == "traffic_BUSnum") {
    bot[bot.length] = {
      message: "YOU：" + input,
      class: "input",
      canadd: 0,
      type: 'str'
    }
    bot[bot.length] = {
      message: "BOT：幾號？",
      class: "notif",
      canadd: 0,
      type: 'str'
    }
    session[0] = "traffic_BUS";

  }
  else {

    if (df_input == 'location') {
      bot[bot.length] = {
        message: "YOU：" + input,
        class: "input",
        canadd: 0,
        type: 'str'
      }
      bot[bot.length] = {
        message: "BOT：要查詢哪個地方？",
        class: "notif",
        canadd: 0,
        type: 'str'
      }
      session[0] = "place";
    }
    else if (df_input == 'weather') {
      bot[bot.length] = {
        message: "YOU：" + input,
        class: "input",
        canadd: 0,
        type: 'str'
      }
      bot[bot.length] = {
        message: "BOT：要查詢哪裡的天氣？",
        class: "notif",
        canadd: 0,
        type: 'str'
      }
      session[0] = "weather";
    }
    else if (df_input == 'logout') {

      bot[bot.length] = {
        message: '<meta http-equiv="refresh" content="0;url=http://' + ip + '/logout" />',
        class: "notif",
        canadd: 0,
        type: 'str'
      }

    }
    else if (df_input == 'schedule') {

      bot[bot.length] = {
        message: '<meta http-equiv="refresh" content="0;url=http://' + ip + '/schedule" />',
        class: "notif",
        canadd: 0,
        type: 'str'
      }

    }
    else if (df_input == 'search') {

      bot[bot.length] = {
        message: '<meta http-equiv="refresh" content="0;url=http://' + ip + '/nearby" />',
        class: "notif",
        canadd: 0,
        type: 'str'
      }

    }

    else if (input.match("咕嚕靈波")) {
      bot[bot.length] = {
        message: "YOU：" + input,
        class: "input",
        canadd: 0,
        type: 'str'
      }
      bot[bot.length] = {
        message: "BOT：歡迎來到真步真步王國 咕嚕靈波 （●′∀‵）ノ♡",
        class: "notif",
        canadd: 0,
        type: 'str'
      }
      bot[bot.length] = {
        message: '<video width="320" height="240" controls><source src="linpo.mp4" type="video/mp4"></video>',
        class: "video",
        canadd: 1,
        type: 'str'
      }
      session[0] = "";
    }

    else if (input == "") {
      bot[bot.length] = {
        message: "YOU：" + input,
        class: "input",
        canadd: 0,
        type: 'str'
      }
      bot[bot.length] = {
        message: "BOT：不會打字哦，廢物？",
        class: "notif",
        canadd: 0,
        type: 'str'
      }
    }
    else if (input.match("貓")) {
      bot[bot.length] = {
        message: "YOU：" + input,
        class: "input",
        canadd: 0,
        type: 'str'
      }
      bot[bot.length] = {
        message: "BOT：好，我就給你貓咪",
        class: "notif",
        canadd: 0,
        type: 'str'
      }
      bot[bot.length] = {
        message: "BOT：" + ' <img src="http://p1.pstatp.com/large/pgc-image/15243937805643c35ac4877" alt="cat" height="150" width="150"> ',
        class: "img",
        canadd: 1,
        type: 'str'
      }
    }
    else if (df_input == 'traffic') {
      bot[bot.length] = {
        message: "YOU：" + input,
        class: "input",
        canadd: 0,
        type: 'str'
      }
      bot[bot.length] = {
        message: "BOT：要搭乘什麼？",
        class: "notif",
        canadd: 0,
        type: 'str'
      }
      session[0] = "traffic";
    }

    else {
      bot[bot.length] = {
        message: "YOU：" + input,
        class: "input",
        canadd: 0,
        type: 'str'
      }
      if (data.status.code != 400 && data.result.fulfillment.speech != '') {
        bot[bot.length] = {
          message: "BOT：" + data.result.fulfillment.speech,
          class: "notif",
          canadd: 0,
          type: 'str'
        }
      }
      else {
        bot[bot.length] = {
          message: "BOT：抱歉，我聽不懂",
          class: "notif",
          canadd: 0,
          type: 'str'
        }
      }

      session[0] = "";
      con.query('INSERT INTO searchword.word (`content`,`user`) VALUES (\'' + input + '\',\'' + user + '\')', function (err, result, fields) {
        if (err) {
        }
        else {

        }

      })
    }
  }
}

//把invite[]轉成字串
function get_istr(user) {
  var str = "<table border='1'>"
  invite.forEach(input => {
    if (input.user == user) {
      str += "<tr><td class='add_idnum'>" + input.item + "</td><td class='add_box'><form action='http://" + ip + "/accept_refuse' method='post'><input type='hidden' name='yn' value='accept'><input type='hidden' name='id' value=" + input.item + "><input type='hidden' name='i_id' value=" + input.i_id + "><input class='add_accept' type='submit' value='接受'></form></td><td  class='add_box'><form action='http://" + ip + "/accept_refuse' method='post'><input type='hidden' name='yn' value='refuse'><input type='hidden' name='id' value=" + input.item + "><input type='hidden' name='i_id' value=" + input.i_id + "><input class='add_refuse' type='submit' value='拒絕'></form></td></tr>"
    }
  });
  str += "</table>"
  return str
}
//把friendList[]轉成字串
function get_fstr(user) {
  var str = "<table class='seeMf_table' border=1>"
  friendList.forEach(input => {
    if (input.user == user) {
      str += "<tr><td class='seeMf_content'>" + input.item + "</td><td class='seeMf_content'>備註</td></tr>"
    }
  });
  str += "</table>"
  return str
}
//把bot[]轉成字串
function get_str() {
  var str = ''
  if (bot == '') {

  }
  else {
    bot.forEach(input => {
      if (input.canadd == 1) {
        if (input.type == 'str') {
          str += input.message + '<form action="http://' + ip + '/addTOfavorite" method="POST"><input type="hidden" name="value" value="' + input.value + '"><input type="hidden" name="arrnum" value="' + input.arraynum + '"><button type="submit"> <img src="img/7pF0p0K.jpg" height="10" width="10" alt=""> </button></form> ' + '<br/>'
        }
        else if (input.type == 'table') {
          //   console.log('canadd 1 type table')
          str += input.message + '<td><form action="http://' + ip + '/addTOfavorite" method="POST"><input type="hidden" name="value" value="' + input.value + '"><input type="hidden" name="arrnum" value="' + input.arraynum + '"><button type="submit"> <img src="img/7pF0p0K.jpg" height="10" width="10" alt=""> </button></form> </td></tr>'
        }
        else {
          //  console.log('canadd 1 type other')
          str += input.message + '<form action="http://' + ip + '/addTOfavorite" method="POST"><input type="hidden" name="value" value="' + input.value + '"><input type="hidden" name="arrnum" value="' + input.arraynum + '"><button type="submit"> <img src="img/7pF0p0K.jpg" height="10" width="10" alt=""> </button></form> '
        }
      }
      else {
        if (input.type == 'str') {
          //    console.log('canadd 0 type str')
          str += input.message + '<br/>'
        }
        else {
          //   console.log('canadd 0 type other')
          str += input.message
        }
      }
    })
  }


  return str
}
//把mylove[]轉成字串
function get_str_mylove() {
  var str = ""

  mylove.forEach(input => {

    str += "<tr><td>" + input.message + "</td></tr>"
  });


  var re = /BOT：/g;
  var result = str.replace(re, "");

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
//讀取景點列表
function schedule() {

}

//google maps 類型轉中文
function typeTochinese(input) {
  switch (input) {
    case 'university':
      return '大學';
    case 'lodging':
      return '住宿';
    case 'restaurant':
      return '餐聽';
    case 'place_of_worship':
      return '寺廟';
    case 'electronics_store':
      return '電器商店';
    case 'store':
      return '商店';
    case 'supermarket':
      return '超市';
    case 'real_estate_agency':
      return '房仲';
    default:
      return input;
  }

}
//port
app.listen(port, function () {
  console.log('Listening on port 3000!');
});





//import something
{
    var express = require('express');
    var app = express();
    var http = require('http');
    var mysql = require('mysql');
    var bodyParser = require('body-parser');
    var request = require('xhr-request')
    var dateFormat = require('dateformat');
    var now = new Date();
    var axios = require('axios');
    var jsSHA = require('jssha');
}
//一些路徑設置
{
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
    var ID = ""
    var Train = []; //紀錄起站到迄站
    var delTRA = "";
    var bot = [];
    bot[bot.length] = "BOT：安安你好!!<br/>";
    var session = [];
    var mylove = [];
    const baseURL = "http://localhost:3000/";
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
        password: "gss25867890"
    });//連接DB
}





app.get('/trytrylook', function (req, res) {

    res.render('pages/main', {
        message: "早安",
        send: get_str(),
    });

});

//回應後
app.post('/addstr', function (req, res) {

    if (req.body.addstr == "初始化") {
        for (var i = 0; i < session.length; i++) {
            session[i] = ""
        }
        bot[bot.length] = "YOU：" + req.body.addstr + "<br/>";
        bot[bot.length] = "BOT：初始化完畢<br/>";

        res.render('pages/main.ejs', {
            message: "早安",
            send: get_str(),
        });
    }
    else if (req.body.addstr == "我的最愛") {

    }
    else {
        if (session[0] == "place") {

            request('https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=' + req.body.addstr + '&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry&key=AIzaSyCt3g5gLr475dheyZYlJFXBlSgKa6YMqXk', {
                json: true
            }, function (err, data) {
                if (err) throw err
                bot[bot.length] = "YOU：" + req.body.addstr + "<br/>";
                bot[bot.length] = "BOT：地區 - " + data.candidates[0].formatted_address + "<br/>";
                res.render('pages/main.ejs', {
                    message: "早安",
                    send: get_str(),
                });
            });
            session[0] = ""
        }
        else if (session[0] == "weather") {

            var placecode = placeTocode(req.body.addstr);
            request('http://opendata.cwb.gov.tw/opendataapi?dataid=' + placecode + '&authorizationkey=CWB-357C384E-33A3-4DFA-BBE8-AFF232297CF5&format=json', {
                json: true
            }, function (err, data) {
                if (err) throw err
                bot[bot.length] = "YOU：" + req.body.addstr + "<br/>";
                bot[bot.length] = "BOT：<br/>地區：" + data.cwbopendata.dataset.locations.locationsName + "<br/>";
                bot[bot.length] = "時間：" + data.cwbopendata.dataset.locations.location[1].weatherElement[1].time[1].dataTime + "<br/>";
                bot[bot.length] = "溫度：" + data.cwbopendata.dataset.locations.location[1].weatherElement[1].time[1].elementValue.value + "度C<br/>";
                bot[bot.length] = "時間：" + data.cwbopendata.dataset.locations.location[1].weatherElement[1].time[2].dataTime + "<br/>";
                bot[bot.length] = "溫度：" + data.cwbopendata.dataset.locations.location[1].weatherElement[1].time[2].elementValue.value + "度C<br/>";
                bot[bot.length] = "時間：" + data.cwbopendata.dataset.locations.location[1].weatherElement[1].time[3].dataTime + "<br/>";
                bot[bot.length] = "溫度：" + data.cwbopendata.dataset.locations.location[1].weatherElement[1].time[3].elementValue.value + "度C<br/>";
                res.render('pages/main.ejs', {
                    send: get_str(),
                });
            });
            session[0] = ""
        }
        else if (session[0] == "traffic") {
            search(req.body.addstr)
            res.render('pages/main.ejs', {
                message: "早安",
                send: get_str(),
            });

        }
        else if (session[0] == "traffic_TRA") {
            bot[bot.length] = "YOU：" + req.body.addstr + "<br/>";
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
                    bot[bot.length] = "BOT：起站 - " + originName + " ， "
                    bot[bot.length] = "迄站 - " + destinationName + "<br/>"
                    bot[bot.length] = "BOT：要搭幾月幾號的車？<br/>"
                    Train = [originName, originID, destinationName, destinationID]
                    delTRA = bot.length
                    bot[bot.length] = '<input type="date" class="input" name="time">'
                    res.render('pages/main.ejs', {
                        message: "早安",
                        send: get_str(),
                    });
                    session[0] = "need_TRA_time";
                });


        }
        else if (session[0] == "need_TRA_time") {
            bot.splice(delTRA, 1, "")
            bot[bot.length] = "YOU：" + req.body.time + "<br/>"
            axios.get('http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/DailyTimetable/OD/' + Train[1] + '/to/' + Train[3] + '/' + req.body.time + '?&$format=json', { // 參考(抄襲XD)noobTW
                headers: getAuthorizationHeader(),
            })
                .then(function (response) {
                    bot[bot.length] = "BOT：<br/>"
                    for (var i = 0; i < response.data.length; i++) {
                        bot[bot.length] = "車次代碼 - " + response.data[i].DailyTrainInfo.TrainNo + "此班車在" + response.data[i].OriginStopTime.DepartureTime + "於" + Train[0] + "發車<br/>"
                    }
                    res.render('pages/main.ejs', {
                        message: "早安",
                        send: get_str(),
                    });
                })

            session[0] = ""
        }
        else {
            search(req.body.addstr)
            res.render('pages/main.ejs', {
                message: "早安",
                send: get_str(),
            });
        }
    }

});

//判斷使用者要找什麼
function search(input) {
    if (input.match("add") || input.match("加入")) {
        // Session[5]="add";
        mylove[mylove.length] = bot[(bot.length - 2)]
        bot[bot.length] = "BOT：我的最愛加入成功<br/>";
    }
    else {
        if (input == "地點") {
            bot[bot.length] = "YOU：" + input + "<br/>";
            bot[bot.length] = "BOT：要查詢哪個地方？<br/>";
            session[0] = "place";
        }
        else if (input == "天氣") {
            bot[bot.length] = "YOU：" + input + "<br/>";
            bot[bot.length] = "BOT：要查詢哪裡的天氣？<br/>";
            session[0] = "weather";
        }
        else if (input == "交通") {
            bot[bot.length] = "YOU：" + input + "<br/>";
            bot[bot.length] = "BOT：要搭乘什麼？<br/>";
            session[0] = "traffic";
        }
        else if (input.match("台鐵") || input.match("臺鐵") || input.match("火車")) {
            bot[bot.length] = "YOU：" + input + "<br/>";
            bot[bot.length] = "BOT：起點站和終點站？<br/>";
            session[0] = "traffic_TRA";
        }
        else if (input == "") {
            bot[bot.length] = "YOU：" + input + "<br/>";
            bot[bot.length] = "BOT：不會打字哦，廢物？<br/>";
        }
        else {
            bot[bot.length] = "YOU：" + input + "<br/>";
            bot[bot.length] = "BOT：抱歉，我聽不懂<br/>";
        }
    }
};






//把陣列轉成字串
function get_str() {
    var str = ""

    bot.forEach(input => {
        str += input
    });
    return str
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
//port
app.listen(3000, function () {
    console.log('Listening on port 3000!');
});
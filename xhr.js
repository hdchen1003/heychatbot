

// var request = require('xhr-request')


// request('https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/Station?$select=StationName%2CStationID&$format=JSON', {
//     json: true
// }, function (err, data) {
//     if (err) throw err
//     console.log(data[1].StationID)
// });



const axios = require('axios');
const jsSHA = require('jssha');

const getAuthorizationHeader = function() {
	var AppID = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';
	var AppKey = 'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF';

	var GMTString = new Date().toGMTString();
	var ShaObj = new jsSHA('SHA-1', 'TEXT');
	ShaObj.setHMACKey(AppKey, 'TEXT');
	ShaObj.update('x-date: ' + GMTString);
	var HMAC = ShaObj.getHMAC('B64');
	var Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';

	return { 'Authorization': Authorization, 'X-Date': GMTString};
}

axios.get('https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/Station?$select=StationName%2CStationID&$format=JSON', { // 欲呼叫之API網址(此範例為台鐵車站資料)
	headers: getAuthorizationHeader(),
})
	.then(function(response){
		console.log(response.data);
});



request('http://ptx.transportdata.tw/MOTC/v2/Rail/TRA/Station?$select=StationName%2CStationID&$format=JSON', {
    json: true
  }, function (err, data) {
    if (err) throw err
    var find2
    console.log(data[3].StationID)
    for (var i = 0; i < data.length; i++) {
      if (req.body.addstr.match(data[i].StationName.Zh_tw)) {
        originName = data[i].StationName.Zh_tw
        originID = data[i].StationID
        find2 = i + 1
        break;
      }
    }
    for (var j = find2; j < data.length; j++) {
      if (req.body.addstr.match(data[j].StationName.Zh_tw)) {
        destinationName = data[j].StationName.Zh_tw
        destinationID = data[j].StationID
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
    bot[bot.length] = "BOT：起站 - "+originName+" ， "
    bot[bot.length] = "迄站 - "+destinationName+"<br/>"
    bot[bot.length] = "BOT：要搭幾月幾號的車？<br/>"
    //delTRA = bot.length
    //bot[bot.length] = '<form action="" class="forms"> <input type="date" class="input"></form>'
    console.log("ddd"+destinationName,originName)
    session[0]="need_TRA_time";
  });

var bot="你好，想問些什麼呢<br/>";
var you;
var Session;
window.onload = function(){
    document.querySelector('.echo').innerHTML = bot;
};
function ask(){
    if(Session == "place"){
        var input=document.querySelector('.input').value;
        search_place(input);
    }
    else if (Session == "weather"){
        var input=document.querySelector('.input').value;
        search_weather(input);
    }
    else if (Session == "traffic"){
        var input=document.querySelector('.input').value;
        search_traffic(input);
    }
    else{
        var input=document.querySelector('.input').value;
        bot+="YOU："+input+"<br/>";
        document.querySelector('.echo').innerHTML = bot;
        search(input);
    }
    
};
function search(input){
    if(input == "地點"){
        bot+="BOT：要查詢哪個地方？<br/>";
        document.querySelector('.echo').innerHTML = bot;
        Session="place";
    }
    else if(input == "天氣"){
        bot+="BOT：要查詢哪裡的天氣？<br/>";
        document.querySelector('.echo').innerHTML = bot;
        Session="weather";
    }
    else if(input == "交通"){
        bot+="BOT：要從哪裡到哪裡？<br/>";
        document.querySelector('.echo').innerHTML = bot;
        Session="traffic";
    }
    else if(input == ""){
        bot+="BOT：不會打字哦，廢物？<br/>";
        document.querySelector('.echo').innerHTML = bot;
    }
    else{
        bot+="BOT：抱歉，我聽不懂<br/>";
        document.querySelector('.echo').innerHTML = bot;
    }

};

function search_place(input){
    input = encodeURIComponent(input);
    httpAPI();
   
    function httpAPI(){
        var xhr = new XMLHttpRequest();
        xhr.open('get',"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input="+input+"&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry&key=AIzaSyCt3g5gLr475dheyZYlJFXBlSgKa6YMqXk",true);   
        xhr.send();
        xhr.onload = function(){
            var data = JSON.parse(xhr.responseText);
            bot+="BOT：地區："+data.candidates[0].formatted_address+"<br/>";
            document.querySelector('.echo').innerHTML = bot;  
        }
    }
    Session="";
}

function search_weather(input){
   input = placeTocode(input);
   if(input != 0){
    httpAPI();
   }
   else{
    document.querySelector('.echo').innerHTML = bot; 
   }
   
    function httpAPI(){
        var xhr = new XMLHttpRequest();
        xhr.open('get',"http://opendata.cwb.gov.tw/opendataapi?dataid="+input+"&authorizationkey=CWB-357C384E-33A3-4DFA-BBE8-AFF232297CF5&format=json",true);   
        xhr.send();
        xhr.onload = function(){
            var data = JSON.parse(xhr.responseText);
            //console.log(data.cwbopendata.dataset.locations.location[1]);
            bot+="BOT：地區："+data.cwbopendata.dataset.locations.locationsName+"<br/>";
            bot+="時間："+data.cwbopendata.dataset.locations.location[1].weatherElement[1].time[1].dataTime+"<br/>";
            bot+="溫度："+data.cwbopendata.dataset.locations.location[1].weatherElement[1].time[1].elementValue.value+"度C<br/>";
            bot+="時間："+data.cwbopendata.dataset.locations.location[1].weatherElement[1].time[2].dataTime+"<br/>";
            bot+="溫度："+data.cwbopendata.dataset.locations.location[1].weatherElement[1].time[2].elementValue.value+"度<br/>";
            bot+="時間："+data.cwbopendata.dataset.locations.location[1].weatherElement[1].time[3].dataTime+"<br/>";
            bot+="溫度："+data.cwbopendata.dataset.locations.location[1].weatherElement[1].time[3].elementValue.value+"度<br/>";
            document.querySelector('.echo').innerHTML = bot;    
        }
    }
    
    Session="";
}
function search_traffic(input){
    bot+="BOT：目前尚未加入，敬請期待<br/>"
    document.querySelector('.echo').innerHTML = bot;
    Session="";
}

function placeTocode(place){
    if((place.match("臺北")) || (place.match("台北"))){
        place = "F-D0047-061"
    }
    else if (place.match("台中") || place.match("臺中")){
        place = "F-D0047-073"
    }
    else if (place.match("宜蘭")){
        place = "F-D0047-003"
    }
    else if (place.match("桃園")){
        place = "F-D0047-005"
    }
    else if (place.match("新竹縣")){
        place = "F-D0047-009"
    }
    else if (place.match("苗栗")){
        place = "F-D0047-013"
    }
    else if (place.match("彰化")){
        place = "F-D0047-017"
    }
    else if (place.match("南投")){
        place = "F-D0047-021"
    }
    else if (place.match("雲林")){
        place = "F-D0047-025"
    }
    else if (place.match("嘉義縣")){
        place = "F-D0047-029"
    }
    else if (place.match("屏東")){
        place = "F-D0047-033"
    }
    else if (place.match("台東")||(place.match("臺東"))){
        place = "F-D0047-037"
    }
    else if (place.match("花蓮")){
        place = "F-D0047-041"
    }
    else if (place.match("澎湖")){
        place = "F-D0047-045"
    }
    else if (place.match("基隆")){
        place = "F-D0047-049"
    }
    else if (place.match("新竹市")){
        place = "F-D0047-053"
    }
    else if (place.match("嘉義市")){
        place = "F-D0047-057"
    }
    else if (place.match("新北市")){
        place = "F-D0047-069"
    }
    else if (place.match("台南市")||(place.match("臺南"))){
        place = "F-D0047-077"
    }
    else if (place.match("連江")){
        place = "F-D0047-081"
    }
    else if (place.match("金門")){
        place = "F-D0047-085"
    }
    else if (place.match("台灣") ||(place.match("臺灣")) ){
        place = "F-D0047-089"
    }
    else if (place.match("高雄")){
        place = "F-D0047-065"
    }
    else{
        bot+="BOT：目前尚未加入，敬請期待<br/>"
        return 0;
    }
    return place;

}





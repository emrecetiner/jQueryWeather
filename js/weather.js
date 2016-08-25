(function ($, document, window) {
    var defaults = {
        retryLimit: 10,
        relativeTimeZone: true,
        width: 960,
    };
    $.fn.weatherFeed = function (options) {
        options = options || {};
        var tryCount = 0;
        this.each(function () {
            var degree = options.degree;
            var lang = options.lang;
            var $weatherTag = $(this);
            var city = $.trim($(this).text().split(',')[0]);
            var state = $.trim($(this).text().split(',')[1]);
            var days = options.showDays;
            var title = city + ", " + state;
            var image = "";
            var description = "";
            var codeImgURL = "images/weather/";

            //lets build the load bar now
            var loadBar = '<div class="loading">' +
                '<span class="loadMessage">Yükleniyor...</span></div>';
            $weatherTag.html(loadBar);
            $weatherTag.find(".loading").progressbar({value: false});

            function replaceDay(text) {
                if (lang != "tr") {
                    return text;
                } else {
                    var days = {
                        "Mon": "Pzt",
                        "Tue": "Sal",
                        "Wed": "Çar",
                        "Thu": "Per",
                        "Fri": "Cum",
                        "Sat": "Cmt",
                        "Sun": "Paz"
                    }
                    for (var day in days) {
                        text = text.replace(day, days[day]);
                    }
                    return text;
                }
            }

            function replaceMonth(text) {
                if (lang != "tr") {
                    return text;
                } else {
                    var Months = {
                        "Jan": "Oca",
                        "Feb": "Şub",
                        "Mar": "Mar",
                        "Apr": "Nis",
                        "May": "May",
                        "Jun": "Haz",
                        "Jul": "Tem",
                        "Aug": "Ağu",
                        "Sep": "Eyl",
                        "Oct": "Eki",
                        "Nov": "Kas",
                        "Dec": "Ara"
                    }

                    for (var month in Months) {
                        text = text.replace(month, Months[month]);
                    }

                    return text;
                }
            }

            function replaceStatus(text) {
                if (lang != "tr"){
                    return text;
                }else{
                    var status = {
                        "Tornado": "Kasırga",
                        "Tropical Storm": "Tropikal Fırtına",
                        "hurricane": "Fırtına",
                        "Severe Thunderstorms": "Şiddetli Fırtına",
                        "Thunderstorms": "Gök Gürültülü Fırtına",
                        "Mixed Rain And Snow": "Karla Karışık Yağmur",
                        "Mixed Rain And Sleet": "Sulu Kar",
                        "Mixed Snow And Sleet": "Karla Karışık Sulu Kar",
                        "Showers": "Sağanak",
                        "Snow Flurries": "Kısa ve Şiddetli Kar",
                        "Light Snow Showers": "Hafif Kar Yağışı",
                        "Snow": "Kar",
                        "Hail": "Dolu",
                        "Sleet": "Sulu Kar",
                        "Dust": "Çöl Tozu",
                        "Foggy": "Sisli",
                        "Haze": "Puslu",
                        "Smoky": "Sisli",
                        "Windy": "Rüzgarlı",
                        "Cold": "Soğuk",
                        "Cloudy": "Bulutlu",
                        "Scattered": "Aralıklı",
                        "Partly": "Parçalı",
                        "Mostly": "Çok",
                        "Mostly Cloudy (Night)": "Gece Çok Bulutlu",
                        "Mostly Cloudy (Day)": "Gündüz Çok Bulutlu",
                        "Partly Cloudy (Night)": "Gece Parçalı Bulutlu",
                        "Partly Cloudy (Day)": "Gündüz Parçalı Bulutlu",
                        "Clear (Night)": "Gece Açık",
                        "Sunny": "Güneşli",
                        "Fair (Night)": "Gece Açık",
                        "Fair (Day)": "Gündüz Açık",
                        "Mixed Rain And Hail": "Karla Karışık Yağmur ve Dolu",
                        "Hot": "Sıcak",
                        "Isolated Thunderstorms": "Yer Yer Yağışlı",
                        "Scattered Thunderstorms": "Aralıklı Sağanak",
                        "Scattered Showers": "Aralıklı Yağış",
                        "Heavy Snow": "Yoğun Kar",
                        "Scattered Snow Showers": "Aralıklı Kar Yağışı",
                        "Heavy Snow": "Yoğun Kar",
                        "Snow Showers": "Kar Yağışlı",
                        "Not Available": "Müsait Değil"
                    }

                    for (var statu in status) {
                        text = text.replace(statu, status[statu]);
                    }

                    return text;
                }
            }


            $.ajax({
                url: "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22" + city + "%2C%20" + state + "%22)%20and%20u%3D'" + degree + "'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys",
                dataType: "json",
                success: function (data) {
                    //first lets get the current time by parsing the title from the data query
                    var timeIndexStart = data.query.results.channel.item.title.lastIndexOf(' at ') + 4; //4 is the size of the string " at " (whitespace included)
                    var timeIndexEnd = data.query.results.channel.item.title.length - 4; //4 is the number of characters from the end of the string (1 space + time zone)
                    var timeZoneStart = data.query.results.channel.item.title.lastIndexOf(" ") + 1;
                    //lets go ahead and store the time now
                    //format = "Conditions for "city", "state" at [time] [time zone]"
                    var time = data.query.results.channel.item.title.substring(timeIndexStart, timeIndexEnd);
                    var timeZone = data.query.results.channel.item.title.substring(timeZoneStart);
                    var d = new Date();

                    var localTime = d.getTime();

                    var localOffset = d.getTimezoneOffset() * 60000;

                    var utc = localTime + localOffset;
                    var currentTime;

                    if (options.relativeTimeZone) {
                        var timeByLocation = new Object();
                        timeByLocation["EDT"] = utc + (3600000 * -5);
                        timeByLocation["EST"] = utc + (3600000 * -5);
                        timeByLocation["CDT"] = utc + (3600000 * -6);
                        timeByLocation["CST"] = utc + (3600000 * -6);
                        timeByLocation["MDT"] = utc + (3600000 * -7);
                        timeByLocation["MST"] = utc + (3600000 * -7);
                        timeByLocation["PDT"] = utc + (3600000 * -8);
                        timeByLocation["PST"] = utc + (3600000 * -8);
                        timeByLocation["HST"] = utc + (3600000 * -10);
                        timeByLocation["AKDT"] = utc + (3600000 * -9);
                        timeByLocation["AKST"] = utc + (3600000 * -9);
                        currentTime = timeByLocation[timeZone];
                    }
                    else {
                        currentTime = localTime;
                    }

                    var today = new Date(currentTime);
                    var dstOffset = 0;
                    var hourMod = "";
                    var minMod = "";
                    var background = "";

                    if (today.dst())
                        dstOffset = 1;

                    if (today.getHours() + dstOffset < 10)
                        hourMod = "0";
                    if (today.getMinutes() < 10)
                        minMod = "0";

                    var code = parseInt(data.query.results.channel.item.forecast[0].code);
                    if (code < 18 || code > 37 || code == 35)
                        background = codeImgURL + "day_dark_cloud.jpg";
                    else if (code < 28) {
                        if ((today.getHours() + dstOffset) > 20 || (today.getHours() + dstOffset) < 7)
                            background = codeImgURL + "night_cloud.jpg";
                        else
                            background = codeImgURL + "day_cloud.jpg";
                    }
                    else {
                        if ((today.getHours() + dstOffset) > 20 || (today.getHours() + dstOffset) < 7)
                            background = codeImgURL + "night_cloud.jpg";
                        else
                            background = codeImgURL + "day_clear.jpg";
                    }

                    //now lets populate the forcast items
                    var weatherListItem = "<h2 class='weather'>" + title + "</h2><ul class='weatherSummary'>";
                    var tempSummary;
                    $weatherTag.find(".loadMessage").text("Generating Weather: " + title);
                    //lets create today's current weather item
                    for (var i = 0; i < data.query.results.channel.item.forecast.length && i < days; i++) {

                        if (i == 0) {
                            day = "<p class='day'>Bugün</p>";
                            image = "<img src='" + codeImgURL + data.query.results.channel.item.forecast[i].code + ".png'/>";
                            date = "<p>" + replaceMonth(data.query.results.channel.item.forecast[i].date) + "</p>";
                            high = "<p class='highTemp'> En Yük: " + data.query.results.channel.item.forecast[i].high + " &deg; " + degree + "</p>";
                            low = "<p class='lowTemp'> En Düş: &nbsp;" + data.query.results.channel.item.forecast[i].low + " &deg; " + degree + "</p>";
                            tempSummary = high + low;
                            description = "<p>" + replaceStatus(data.query.results.channel.item.forecast[i].text) + "</p>";
                            dayDom = "<li class='today'>" + day + image + date + description + tempSummary + "</li>";
                        }
                        else {
                            day = "<p class='day'>" + replaceDay(data.query.results.channel.item.forecast[i].day) + "</p>";
                            date = "<p>" + replaceMonth(data.query.results.channel.item.forecast[i].date) + "</p>";
                            image = "<img src='" + codeImgURL + data.query.results.channel.item.forecast[i].code + ".png'/>";
                            high = "<span class='highTemp'> Y: " + data.query.results.channel.item.forecast[i].high + " &deg;" + degree + "</span>";
                            low = "<span class='lowTemp'> D: " + data.query.results.channel.item.forecast[i].low + " &deg;" + degree + "</span>";
                            description = "<p>" + replaceStatus(data.query.results.channel.item.forecast[i].text) + "</p>";
                            dayDom = "<li class='fullDay forecast'>" + day + image + date + description + "<p>" + high + "&nbsp;-" + low + "</p></li>";
                        }
                        weatherListItem += dayDom;

                        //update progress bar

                    }
                    weatherListItem += "</ul>";
                    $weatherTag.html(weatherListItem);
                    $weatherTag.find(".weatherSummary").css('background-image', 'url(' + background + ')');

                },
                error: function (xhr, status, error) {
                    tryCount++;
                    if (tryCount <= options.retryLimit) {
                        //try again
                        $.ajax(this);
                        return;
                    }
                }
            });
        });
    };

    Date.prototype.stdTimezoneOffset = function () {
        var jan = new Date(this.getFullYear(), 0, 1);
        var jul = new Date(this.getFullYear(), 6, 1);
        return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    }

    Date.prototype.dst = function () {
        return this.getTimezoneOffset() < this.stdTimezoneOffset();
    }

})(jQuery, document, window);

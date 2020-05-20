const fs = require("fs")
const beautify = require("js-beautify").js

exports.init = (app) => {
    
    app.post("/calcTime", (req, res, next) => {
        var convertTime = (sTime) => {
            var aTime = sTime.split(":")
            return {
                hours: parseInt(aTime[0],10),
                minutes: parseInt(aTime[1],10)
            }
        }
        try {
            var iBreak = req.body.Break
            var StartTime = req.body.StartTime
            var EndTime = req.body.EndTime

            var time = JSON.parse(fs.readFileSync("C:/temp/mytime.json").toString())
            /* mytime.json: {
                "time": 5.54
            } */
            StartTime = convertTime(StartTime) //07:07:00 -> hours: 7, min: 7
            EndTime = convertTime(EndTime)
            var calcDate = new Date() // 23.03.2020 08:10:00.0000
            calcDate.setHours(EndTime.hours - StartTime.hours) // 16 - 8 
            calcDate.setMinutes(EndTime.minutes - StartTime.minutes - iBreak) // 7 - 50 - 12 
            var normalTime = 8.0
            var workTime = calcDate.getHours() + ((calcDate.getMinutes() / 0.6)/100)
            var overEight = workTime - normalTime

            time.time += overEight
            
            fs.writeFileSync("C:/temp/mytime.json", JSON.stringify(time));
            res.send(time);
        } catch (error) {
            console.log(error)
            res.send("CalcError")
        }
    });
}
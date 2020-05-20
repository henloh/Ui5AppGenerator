exports.init = (app) => {

    app.post("/getCurrentServices", (req, res, next) => {
        console.log("Reading XML ...")
        async function exec() {
            try {
                var sProjname = req.body.Name
                sProjname = await getServices(sProjname)
                console.log("Services loaded.")
                res.send(sProjname)
            } catch (e) {
                console.log(e)
                res.send("No service found!")
            }
        }
        exec()
    });

    app.post("/initServiceFromMetadata", (req, res, next) => {
        console.log("Reading XML ...")
        async function exec() {
            try {
                var sProjname = req.body.Name
                var sServiceName = req.body.ServiceName
                sProjname = await initServiceMetadata(sProjname, sServiceName)
                console.log("XML converted. OData ready to recieve Data.")
                res.send(sProjname)
            } catch (e) {
                console.log(e)
                res.send("XML conversion Error!")
            }
        }
        exec()
    });
    app.post("/initNewService", (req, res, next) => {
        console.log("Reading XML ...")
        async function exec() {
            try {
                var sProjname = req.body.Name
                var sServiceName = JSON.parse(req.body.CustomMetadata)
                sProjname = await initServiceData(sProjname, sServiceName)
                console.log("XML converted. OData ready to recieve Data.")
                res.send(sProjname)
            } catch (e) {
                console.log(e)
                res.send("XML conversion Error!")
            }
        }
        exec()
    });
}

// ________________________________________________________________________________________________________
// ________________________________________________________________________________________________________
// ________________________________________________________________________________________________________
// ___________________________________________#HELPERS_____________________________________________________
// ________________________________________________________________________________________________________
// ________________________________________________________________________________________________________
// ________________________________________________________________________________________________________

getServices = (Projname) => {
    return new Promise((resolve, reject) => {
        try {
            var error = "not implemented"
            throw error
            // oData Services aus manifest.json auslesen
            resolve(sProjname)
        } catch (e) {
            console.log("Error in Promise 'getServices': ")
            console.log(e)
            reject("getServices Error")
        }
    })
}
initServiceMetadata = (Projname, Servicename) => {
    return new Promise((resolve, reject) => {
        try {
            var error = "not implemented"
            throw error
            // Metadaten vom Gateway Laden 
            resolve(sProjname)
        } catch (e) {
            console.log("Error in Promise 'initServiceMetadata': ")
            console.log(e)
            reject("getServices Error")
        }
    })
}
initServiceData = (Projname, Servicename) => {
    return new Promise((resolve, reject) => {
        try {
            var error = "not implemented"
            throw error
            // Inputs vom User lesen - Model aufbauen - Ranges!? ...  
            //Object.getOwnPropertyNames(obj)
            /*
                Entity: {
                    Att1: {
                        type: "Integer",
                        range: "0230, 0210" // One from
                        range: "100-200" // Random between
                        key: true
                        // String
                        range: "Rathalos, Anjanath, Baroth" // One from
                        Wenn der String Key ist wird eine Zahl geadded (in: 0...39)
                    },
                }, ...
            */
            resolve(sProjname)
        } catch (e) {
            console.log("Error in Promise 'initServiceData': ")
            console.log(e)
            reject("getServices Error")
        }
    })
}
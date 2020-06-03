// Main Server File for local UI5 dev

// Create a proxy for the gateway system to send and recieve data
// const http = require("http")
const express = require("express")
const url = require("url")
const httpProxy = require("http-proxy")
const bodyParser = require("body-parser")
// const appgen = require("./appgen")
const lib = require("./lib/libloader")
const path = require("path")
const fs = require("fs")

// .env is ignored by the .gitignore
require("dotenv").config()

// local webserver port
const port = 443
// Gateway
const proxy_cfg = {
    // the prefix you use to call your backend functions via the proxy server
    prefix: "/",
    // the host of your gateway server
    target: "https://" + process.env.GW_URL + "/",
    // port of your gateway server
    port: "44300",
    secure: false,
    headers: {
        host: process.env.HOST
    },
    auth: process.env.GW_USR + ":" + process.env.GW_PWD
}
// Create the proxy
var proxy = httpProxy.createProxyServer(proxy_cfg)

var app = express()
app.use(express.static("./"))
app.use(bodyParser.urlencoded({extended: true}))

app.zWorkDir = require("os").homedir() + process.env.WORKDIR

initHelpers = () => {
    // extend the app
    // appgen.init(app)
    lib.init(app)
}
initHelpers()

app.use("/sap", (request, response) => {
    proxy.on('error', function (err, req, res) {
    //console.log(err);
    });
    proxy.on('proxyRes', function (proxyRes, req, res) {
    //console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
    });
    proxy.on('close', function (req, socket, head) {
    //console.log('Client disconnected');
    });

    // We have to set the host of the request to our remote server
    // It currently contains localhost... which leads to problems 
    request.headers.host = proxy_cfg.target
    // cut the prefix from the beginning of the url
    // request.url = request.url.slice(request.url.indexOf("/", 1));
    request.url = "/sap/" + request.url.slice(proxy_cfg.prefix.length)
    proxy.web(request, response)

});

// Uses the same login as your Gateway. 
// The user credentials form the webside are then used for the gateway communication
app.use((req, res, next) => {
    // -----------------------------------------------------------------------
    // authentication middleware
    const auth = {login: process.env.GW_USR, password: process.env.GW_PWD} 

    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = new Buffer.from(b64auth, 'base64').toString().split(':')

    // Verify login and password are set and correct
    if (login && password && login === auth.login && password === auth.password) {
        // Access granted...
        return next()
    }

    // Access denied...
    res.set('WWW-Authenticate', 'Basic realm="401"') // change this
    res.status(401).send('Authentication required.') // custom message
});

app.get("/", (request, response, next) => {
    var uri = url.parse(request.url).pathname
    var filename = path.join(process.cwd(), uri)

    fs.exists(filename, function(exists) {
        if (!exists) {
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });
            response.write("404 Not Found\n");
            response.end();
            return
        }   
        // filename += "AppGenerator\\webapp"
        if (fs.statSync(filename).isDirectory()) filename += "/index.html";

        fs.readFile(filename, "binary", function(err, file) {
            if (err) {
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, "binary");
            response.end();
            });
        }
    );
}).listen(parseInt(port, 10));

  
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
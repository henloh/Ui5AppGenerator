const creator = require("./creator")
const editor = require("./editor")
const git = require("./git")
const builder = require("./builder")
const mockgen = require("./mockgen")

exports.init = (app) => {

    creator.init(app)
    editor.init(app)
    git.init(app)
    builder.init(app)
    mockgen.init(app)
    
}
path = require('path')

config = {};

exports.config = null

exports.loadConfigFile = (configPath) ->
    exports.config = require(path.resolve(configPath))

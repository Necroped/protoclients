let path = require('path');
let fs = require('fs-extra');
const silentLogger = require('./silentLogger.js');
let protocols = fs.readdirSync(path.posix.join(__dirname, './protocols'));
let clients = {};

let get_class = protocol => {
    if (!protocols.includes(protocol + ".js")) throw "Incorrect protocol";
    return require('./protocols/' + protocol);
}

module.exports = ({logger, protocol, params} = {}) => {
    const log = {...logger, ...silentLogger};
    if (!protocols.includes(protocol + ".js")) throw "Incorrect protocol";
    let client_id = get_class(protocol).generate_id(params);
    if (!clients.hasOwnProperty(client_id)) clients[client_id] = new (require('./protocols/' + protocol))(params, log);
    return clients[client_id];
}

module.exports.parameters = protocol => {
    if (!protocols.includes(protocol + ".js")) throw "Incorrect protocol";
    return require('./protocols/' + protocol).parameters;
}

module.exports.list = () => protocols.reduce((result, protocol) => {
    let extension = path.posix.extname(protocol);
    protocol = protocol.slice(0, -extension.length);
    result[protocol] = require('./protocols/' + protocol);
    return result;
}, {});

module.exports.get_class = get_class;

module.exports.are_equal = (params1, params2) => get_class(params1.protocol).generate_id(params1) === get_class(params2.protocol).generate_id(params2)

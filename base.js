let path = require('path');
const get_stream = require('get-stream');
const is_stream = require('is-stream');
let moment = require('moment');

module.exports = class {
    static parameters = {
        parallel: {number: true},
        polling: {boolean: true},
        polling_interval: {number: true}
    };
    static accept_ranges = true;
    constructor(params, logger, protocol) {
        this.logger = logger;
        this.protocol = protocol;
        this.params = {};
        this.fileObjects = {};
        this.timeout = null;
        this.disconnect_timeout = [];
        this.queue = require("parallel_limit")(params.parallel);
        this.connections = new Array(params.parallel).fill(null);
        this.on_error = () => {};
        this.on_watch_complete = () => {};
        this.on_watch_start = () => {};
        this.on_watch_stop = () => {};
        this.on_file_added = () => {};
        this.on_file_removed = () => {};
        this.update_settings(params);
    }
    id() {
        return this.constructor.generate_id(this.params);
    }
    update_settings(params) {
        this.params = params;
        if (params.polling && params.polling_interval) this.polling = params.polling_interval;
        else {
            clearTimeout(this.timeout);
            this.polling = false;
        }
        this.queue.set_size(params.parallel);
    }
    wrapper(f, control_release) {
        return this.queue.run((slot, slot_control) => Promise.resolve()
            .then(() => {
                clearTimeout(this.disconnect_timeout[slot]);
                return this.connect(slot);
            })
            .then(connection => f(connection, slot, slot_control))
            .then(result => {
                Promise.resolve()
                    .then(() => {
                        if (control_release && slot_control?.keep_busy) return slot_control.release_promise;
                    })
                    .then(() => {
                        this.disconnect_timeout[slot] = setTimeout(() => {
                            this.disconnect(slot);
                        }, 300000)
                    })
                return result;
            }), control_release);
    }
    walk(dirname, ignored) {}
    init_watcher(dirname, ignored) {
        if (!this.started) return;
        this.now = moment().format('YYYYMMDDHHmmssSSS');
        return this.walk(dirname, ignored)
            .then(() => {
                for (let filename in this.fileObjects) {
                    if (this.fileObjects.hasOwnProperty(filename) && this.fileObjects[filename].last_seen !== this.now) {
                        this.on_file_removed(filename);
                        this.logger.info(this.protocol.toUpperCase() + " walk removing: ", filename);
                    }
                }
                if (this.polling) this.timeout = setTimeout(() => {
                    this.init_watcher(dirname, ignored);
                }, this.polling);
            })
            .catch(err => {
                this.logger.error("Walk failed with dirname: ", dirname, err);
                this.on_error(err);
            })
    }
    start_watch(dirname, ignored = /(^|[\/\\])\../) {//(^|[\/\\])\.+([^\/\\\.]|$)/
        if (this.started) return;
        this.started = true;
        this.on_watch_start();
        return this.init_watcher(this.constructor.normalize_path(dirname), ignored).then(() => this.on_watch_complete());
    }
    stop_watch() {
        return Promise.resolve()
            .then(() => {
                clearTimeout(this.timeout);
                this.polling = false;
                this.started = false;
                this.fileObjects = {};
                this.timeout = null;
            })
            .then(() => this.on_watch_stop());
    }
    connect() {}
    disconnect() {}
    createReadStream(source) {throw {message: "createReadStream method not implemented for " + this.protocol, not_implemented: 1}}
    mkdir(dir) {throw {message: "mkdir method not implemented for " + this.protocol, not_implemented: 1}}
    stat(target) {throw {message: "stat method not implemented for " + this.protocol, not_implemented: 1}}
    read(source) {throw {message: "read method not implemented for " + this.protocol, not_implemented: 1}}
    write(target, contents = '') {throw {message: "write method not implemented for " + this.protocol, not_implemented: 1}}
    copy(source, target, streams, size, params) {throw {message: "copy method not implemented for " + this.protocol, not_implemented: 1}}
    link(source, target) {throw {message: "link method not implemented for " + this.protocol, not_implemented: 1}}
    symlink(source, target) {throw {message: "symlink method not implemented for " + this.protocol, not_implemented: 1}}
    move(source, target) {throw {message: "move method not implemented for " + this.protocol, not_implemented: 1}}
    remove(target) {throw {message: "remove method not implemented for " + this.protocol, not_implemented: 1}}
    tag(target) {throw {message: "tag method not implemented for " + this.protocol, not_implemented: 1}}
    static filename(dirname, uri) {
        if (dirname === "." || dirname === "/" || dirname === "./" || dirname === "") return uri;
        return uri.slice(dirname.length + 1);
    }
    static path(dirname, filename) {
        return path.posix.join(this.normalize_path(dirname), filename);
    }
    static normalize_path(dirname) {
        return path.posix.normalize((dirname || "").replace(/[\\\/]+/g, "/")).replace(/^(.+?)\/*?$/, "$1");  //remove trailing slashes unless it's root path
    }
    static get_data(data, encoding = 'utf-8') {
        if (typeof data === "string") return data;
        return Promise.resolve()
            .then(() => {
                if (is_stream.readable(data)) return get_stream.buffer(data);
                return data;
            })
            .then(() => {
                if (encoding && Buffer.isBuffer(data)) return data.toString(encoding);
                return data;
            })
    }
}
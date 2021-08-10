const FtpSrv = require('ftp-srv');

const createServer = ({ host, port }) => {
    
    const ftpServer = new FtpSrv({ 
        url :  `ftp://0.0.0.0:${port}`, 
        anonymous: true, 
        pasv_url: `ftp://${host}`
    });
    ftpServer.on('login', ({ connection }, resolve, reject) => {

        try {
            resolve({
                root: './test/resources/',
                cwd: '/'
            });
        } catch(e) {
            reject();
        }
    });
    ftpServer.on('client-error', ({connection, context, error}) => { console.log("ERROR FROM SERVER") });
    //await ftpServer.listen();
    console.log(`FTP server listening on ftp://${host}:${port}`);
    return ftpServer.listen()
};


module.exports = createServer;
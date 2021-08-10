/* const ftpServer = require('./ftp/server.js');
const ProtoClient = require('../index.js');

const host = '127.0.0.1';
const port = '9876';

// start ftp server
const ftp = async () => {
    await ftpServer({ host, port });
    const ftpClient = ProtoClient({
      protocol: 'ftp', 
      params: {
        parallel: 100,
        host,
        port
      }
    });
    //ftpClient.list_uri('./ftp_dir')
    ftpClient.walk({
      dirname: './',
      ignored: /(^|[\/\\])\../, 
      on_file: (file) => {
       console.log(file)
      }
    });
    return true;
};
ftp(); */
const ftpTests = require('./ftp/index.js');
(async () => {
  await ftpTests();
})()

const fs = require('fs');

const expected = {
  generate_id: (host, port) => `{"protocol":"ftp","host":"${host}","port":"${port}"}`,
  list_uri: () => [{
    type: 'd',
    name: 'ftp',
    target: undefined,
    sticky: false,
    rights: { user: 'rwx', group: 'rx', other: 'rx' },
    acl: false,
    owner: '1000',
    group: '1000',
    size: 4096
  }],
  mkdir: (path) => fs.statSync(path, { throwIfNoEntry : false }).isDirectory(),
  stat: () => ({size: 0, mtime: new Date(), isDirectory: () => true})
};


module.exports = expected;
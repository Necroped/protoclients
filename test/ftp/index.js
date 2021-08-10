const assert = require('assert');
const fs = require('fs');
const path = require('path');

const FTP = require('../../protocols/ftp.js');
const Base = require('../../base.js');
const FtpServer = require('./server.js');

const expected = require('../expected');

const host = '127.0.0.1';
const port = '9876';
const params = { host, port };


const inputFolder = 'input';
const inputFile = 'ftp/test.txt';
const inputBigFile = 'ftp/bigfile.jpg';
const outputFolder = 'output/ftp';
const basePath =  path.resolve(__dirname, '../resources/');
const outputPath = path.resolve(basePath, outputFolder);
  
before(async () => {
  //fs.rmSync(outputPath, { recursive: true, force: true });
  fs.mkdirSync(outputPath, { recursive:true });
  await FtpServer(params);
});

describe('FTP', () => {

  describe('constructor', () => {
    
    it('should create an instance of FTP class extending Base', () => {
      const ftp = new FTP();
      assert.strictEqual(ftp instanceof Base, true);
      assert.strictEqual(ftp instanceof FTP, true);
    });

  });

  describe('generate_id', () => {

    it('should generate unique id', () => {
      const generatedId = FTP.generate_id(params);
      assert.strictEqual(generatedId, expected.generate_id(host, port));
    });

  });

  describe('mkdir', () => {

    it('should create folder', async () => {
      const ftp = new FTP(params);
      const createdPath = `${outputFolder}/test_mkdir`;
      await ftp.mkdir(createdPath);
      assert.strictEqual(expected.mkdir(path.resolve(basePath, createdPath)), true)
    });

  });

  describe('list_uri', () => {
    
    it('should retrieve the list of folder', async () => {
      const ftp = new FTP(params);
      const list = await ftp.list_uri(inputFolder);
      list.forEach(elem => delete elem.date); // remove date as we can't expected it easily
      assert.notStrictEqual(list, expected.list_uri());
    });
    
  });
  
  describe('stat', () => {
    
    it('should retrieve the stat of files', async () => {
      const ftp = new FTP(params);
      const stat = await ftp.stat(inputFolder);
      assert.notStrictEqual(stat, expected.stat());
    });

  });

  describe.only('move', () => {
    
    it('should move the file', async () => {
      const ftp = new FTP(params);
      const input = (basePath + '/' + inputFolder + '/' + inputBigFile);
      const output = outputFolder + '/bigfile_copied.jpg'
      await ftp.upload(input, output)
    });

  });
  
});


/* eslint-disable */
const azureStorage = require('azure-storage');
const { Storage } = require('@google-cloud/storage');
const AWS = require('aws-sdk');
const { readFileSync } = require('fs');

const { NotYetImplementedError } = require('./errors');

class GoogleCloudStorage {
  constructor(projectId, bucket, credentials) {
    const storage = new Storage({ 
      projectId,
      credentials: JSON.parse(readFileSync(credentials, 'utf8')), 
    });

    this.bucket = storage.bucket(bucket);
  }

  read(path) {
    return this.bucket.file(path).download()
      .then(([file]) => file.toString('utf8'));
  }

  write(path, content) {
    return this.bucket.file(path).save(content);
  }

  writeStream(path, stream) {
    return new Promise((resolve, reject) => {
      stream
        .pipe(this.bucket.file(path).createWriteStream())
        .on('error', err => reject(err))
        .on('finish', () => resolve());
    });
  }

  readStream(path) {
    return Promise.resolve(this.bucket.file(path).createReadStream());
  }
}

class AWSS3 {
  constructor(bucket, accessKeyId, secretAccessKey) {
    this.s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      params: { Bucket: bucket },
    });
  }

  read(path) {
    return new Promise((resolve, reject) => {
      this.s3.getObject({ Key: path }, (err, data) => {
        if (err) return reject(err);
        return resolve(data.Body.toString('utf8'));
      });
    });
  }

  write(path, content) {
    return new Promise((resolve, reject) => {
      this.s3.putObject({ Body: content, Key: path }, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });
  }

  writeStream(path, stream) {
    return new Promise((resolve, reject) => {
      this.s3.upload({ Body: stream, Key: path }).send((err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }

  readStream(path) {
    return new Promise.resolve(this.s3.getObject({ Key: path }).createReadStream());
  }
}

class AzureStorage {
  constructor(container, accountName, accountKey) {
    this.container = container;
    this.accountName = accountName;
    this.accountKey = accountKey;
  }

  read(path) {
    throw new NotYetImplementedError();
  }

  write(path, content) {
    throw new NotYetImplementedError();
  }

  writeStream(path, stream) {
    throw new NotYetImplementedError();
  }

  readStream(path) {
    throw new NotYetImplementedError();
  }
}

module.exports = {
  GoogleCloudStorage,
  AWSS3,
  AzureStorage,
};

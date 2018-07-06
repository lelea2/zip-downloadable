const AWS = require('aws-sdk');
const s3Zip = require('s3-zip');
const bucket = process.env.S3_BUCKET;
const folder = '';

const download = (event, context, callback) => {
  console.log('event', event.body);
  const body = (typeof event.body === 'string') ? JSON.parse(event.body) : event.body;
  const { files, zipFileName } = body;
  console.log(files, zipFileName);
  // Create body stream
  try {
    const body = s3Zip.archive({ bucket }, folder, files);
    // console.log(body);
    const zipParams = {
      params: {
        Bucket: bucket,
        Key: `${folder}${zipFileName}`
      }
    };
    // console.log(zipParams);
    const zipFile = new AWS.S3(zipParams);
    // console.log('>>>> zipfile', zipFile);
    zipFile.upload({ Body: body })
      .on('httpUploadProgress', (evt) => {
        console.log('>>>> httpUploadProgress', evt);
      })
      .send((e, r) => {
        if (e) {
          const err = `zipFile.upload error ${e}`;
          console.log('>>> err', err);
          callback(err, null);
        } 
        console.log('>>>> response', r);
        const response = {
          statusCode: 200,
          body: JSON.stringify(r),
          isBase64Encoded: false
        };
        callback(null, response);
      });
  } catch (e) {
    const err = `catched error: ${e.message}`;
    console.log('>>>> exception', err);
    callback(err, null);
  }
};

module.exports.download = download;
// const context = {
//   fail: (err) => {
//     console.log(err);
//   },
//   succeed: (data) => {
//     console.log(data)
//   }
// };
// download({
//   body: {
//     "files": ["43ad87ec-1195-42cf-aa5f-22691d2356f3_uploadDoc.pdf"],
//     "zipFileName": "test.zip"
//   }
// }, context);

const AWS = require('aws-sdk');
const s3Zip = require('s3-zip');

module.exports.download = (event, context, cb) => {
  console.log('event', event);
  const { region, bucket, folder, files, zipFileName } = event;
  // Create body stream
  try {
    const body = s3Zip.archive({ region: region, bucket: bucket}, folder, files);
    const zipParams = {
      params: {
        Bucket: bucket,
        Key: `${folder}${zipFileName}`
      }
    };
    const zipFile = new AWS.S3(zipParams);
    zipFile.upload({ Body: body })
      .on('httpUploadProgress', (evt) => {
        console.log(evt)
      })
      .send((e, r) => {
        if (e) {
          const err = `zipFile.upload error ${e}`;
          console.log(err);
          context.fail(err);
        } 
        console.log(r);
        context.succeed(r);
      });
  } catch (e) {
    const err = `catched error: ${e.message}`;
    console.log(err);
    context.fail(err);
  }
};

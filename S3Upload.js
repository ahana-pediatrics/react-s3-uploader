// @flow
/* eslint-disable react/no-this-in-sfc */

export type SigningResult = {
  publicUrl: string,
  signedUrl: string,
  headers: {[string]: string},
};

export default class S3Uploader {
  contentDisposition: string = '';

  server: string = '';

  signingUrl: string = '/sign-s3';

  signingUrlMethod: string = 'GET';

  s3path: string = '';

  signingUrlQueryParams: ?{} | ((*) => {[string]: *}) = null;

  signingUrlHeaders: ?{} | ((*) => {[string]: *}) = null;

  successResponses: Array<number> = [200, 201];

  uploadRequestHeaders: ?{[string]: string};

  fileElement = null;

  files: ?FileList = null;

  httprequest: ?XMLHttpRequest = null;

  signingUrlWithCredentials: boolean;

  constructor(options: {[string]: *} = {}) {
    Object.assign(this, options);

    const files = this.fileElement
      ? this.fileElement.files
      : this.files || new FileList();
    this.handleFileSelect(files);
  }

  onFinishS3Put = (signResult: SigningResult, file: File) =>
    console.log('base.onFinishS3Put()', signResult.publicUrl, file.name);

  preprocess = (file: File, next: File => *) => {
    console.log('base.preprocess()', file);
    return next(file);
  };

  onProgress = (percent: number, status: string, file: File) =>
    console.log('base.onProgress()', percent, status, file.name);

  onError = (status: string, file: File) =>
    console.log('base.onError()', status, file.name);

  onSignedUrl = (result: string) => {
    console.log('base.onSignedUrl()', result);
  };

  getSignedUrl: (file: File, uploadToS3Callback: (SigningResult) => *) => *;

  scrubFilename = (filename: string) => filename.replace(/[^\w\d_\-.]+/gi, '');

  handleFileSelect = (files: FileList) => {
    const result = [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      this.preprocess(file, processedFile => {
        this.onProgress(0, 'Waiting', processedFile);
        result.push(this.uploadFile(processedFile));
        return result;
      });
    }
  };

  createCORSRequest = (method: string, url: string, opts: {[string]: *} = {}) => {
    let xhr = new XMLHttpRequest();

    if (xhr.withCredentials != null) {
      xhr.open(method, url, true);
      if (opts.withCredentials != null) {
        xhr.withCredentials = opts.withCredentials;
      }
    } else {
      xhr = null;
    }
    return xhr;
  };

  executeOnSignedUrl = (file: File, callback: (*) => *) => {
    const fileName = this.scrubFilename(file.name);
    let queryString = `?objectName=${fileName}&contentType=${encodeURIComponent(
      file.type
    )}`;
    if (this.s3path) {
      queryString += `&path=${encodeURIComponent(this.s3path)}`;
    }
    if (this.signingUrlQueryParams) {
      const signingUrlQueryParams =
        typeof this.signingUrlQueryParams === 'function'
          ? this.signingUrlQueryParams()
          : this.signingUrlQueryParams;
      Object.keys(signingUrlQueryParams).forEach(key => {
        const val = signingUrlQueryParams[key];
        queryString += `&${key}=${val}`;
      });
    }
    const xhr = this.createCORSRequest(
      this.signingUrlMethod,
      this.server + this.signingUrl + queryString,
      {withCredentials: this.signingUrlWithCredentials}
    );

    if (!xhr) {
      this.onError('CORS not supported', file);
      return null;
    }

    if (this.signingUrlHeaders) {
      const signingUrlHeaders =
        typeof this.signingUrlHeaders === 'function'
          ? this.signingUrlHeaders()
          : this.signingUrlHeaders;
      Object.keys(signingUrlHeaders).forEach(key => {
        const val = signingUrlHeaders[key];
        xhr.setRequestHeader(key, val);
      });
    }
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType('text/plain; charset=x-user-defined');
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) {
        return null;
      }

      if (this.successResponses.indexOf(xhr.status) >= 0) {
        let result;
        try {
          result = JSON.parse(xhr.responseText);
          this.onSignedUrl(result);
        } catch (error) {
          this.onError('Invalid response from server', file);
          return false;
        }
        return callback(result);
      }
      return this.onError(
        `Could not contact request signing server. Status = ${xhr.status}`,
        file
      );
    };

    return xhr.send();
  };

  uploadToS3 = (file: File, signResult: SigningResult) => {
    const xhr = this.createCORSRequest('PUT', signResult.signedUrl);
    if (!xhr) {
      this.onError('CORS not supported', file);
      return null;
    }
    xhr.onload = () => {
      if (this.successResponses.indexOf(xhr.status) >= 0) {
        this.onProgress(100, 'Upload completed', file);
        return this.onFinishS3Put(signResult, file);
      }
      return this.onError(`Upload error: ${xhr.status}`, file);
    };

    xhr.onerror = () => this.onError('XHR error', file);

    xhr.upload.onprogress = e => {
      let percentLoaded;
      if (e.lengthComputable) {
        percentLoaded = Math.round((e.loaded / e.total) * 100);
        return this.onProgress(
          percentLoaded,
          percentLoaded === 100 ? 'Finalizing' : 'Uploading',
          file
        );
      }
      return null;
    };

    xhr.setRequestHeader('Content-Type', file.type);
    if (this.contentDisposition) {
      let disposition = this.contentDisposition;
      if (disposition === 'auto') {
        if (file.type.substr(0, 6) === 'image/') {
          disposition = 'inline';
        } else {
          disposition = 'attachment';
        }
      }

      const fileName = this.scrubFilename(file.name);
      xhr.setRequestHeader(
        'Content-Disposition',
        `${disposition}; filename="${fileName}"`
      );
    }
    if (signResult.headers) {
      const signResultHeaders = signResult.headers;
      Object.keys(signResultHeaders).forEach(key => {
        const val = signResultHeaders[key];
        xhr.setRequestHeader(key, val);
      });
    }
    if (this.uploadRequestHeaders) {
      const {uploadRequestHeaders} = this;
      Object.keys(uploadRequestHeaders).forEach(key => {
        const val = uploadRequestHeaders[key];
        xhr.setRequestHeader(key, val);
      });
    } else {
      xhr.setRequestHeader('x-amz-acl', 'public-read');
    }
    this.httprequest = xhr;
    return xhr.send(file);
  };

  uploadFile = (file: File) => {
    const uploadToS3Callback = this.uploadToS3.bind(this, file);

    if (this.getSignedUrl) {
      return this.getSignedUrl(file, uploadToS3Callback);
    }
    return this.executeOnSignedUrl(file, uploadToS3Callback);
  };

  abortUpload = () => {
    if (this.httprequest) this.httprequest.abort();
  };
}

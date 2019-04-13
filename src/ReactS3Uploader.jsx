// @flow
import * as React from 'react';
import type SigningResult from './S3Upload';
import S3Upload from './S3Upload';

type RefObject<T> = {
  current: T | null,
};

type Props = {
  /**
   * If set, selected files are automatically uploaded to S3
   */
  autoUpload?: boolean,
  /**
   * If set, the input can access mobile devices' camera (if supported by the browser)
   */
  capture?: boolean,
  contentDisposition?: string,
  isInline?: (fileType: string) => boolean,
  getSignedUrl?: (file: File, uploadToS3Callback: (SigningResult) => *) => *,
  onChange?: (SyntheticInputEvent<HTMLInputElement>) => *,
  onError?: string => void,
  onFinish?: (SigningResult, File) => void,
  /**
   * Called periodically as a file uploads
   * @param <number> Percentage complete
   * @param <string> Any messages, e.g. Waiting, Uploading, Finalizing, Upload completed
   * @param <File> File that is being uploaded
   */
  onProgress?: (number, string, File) => void,
  onSignedUrl?: (*) => void,
  preprocess?: (File, (File) => *) => *,
  scrubFilename?: string => void,
  server?: string,
  signingUrl?: string,
  signingUrlHeaders?: ?{} | ((*) => {[string]: *}),
  signingUrlMethod?: string,
  signingUrlQueryParams?: ?{} | ((*) => {[string]: *}),
  signingUrlWithCredentials?: boolean,
  s3path?: string,
  uploadRequestHeaders?: {},
};

type State = {
  value: string,
};

export default class ReactS3Uploader extends React.Component<Props, State> {
  static defaultProps = {
    capture: false,
    getSignedUrl: null,
    isInline(fileType: string) {
      return fileType.substr(0, 6) === 'image/';
    }
    preprocess(file: File, next: File => *) {
      console.log(`Pre-process: ${file.name}`);
      next(file);
    },
    onSignedUrl(signingServerResponse: SigningResult) {
      console.log('Signing server response: ', signingServerResponse);
    },
    onProgress(percent: number, message: string) {
      console.log(`Upload progress: ${percent}% ${message}`);
    },
    onFinish(signResult: SigningResult) {
      console.log(`Upload finished`, signResult);
    },
    onError(message: string) {
      console.log(`Upload error: ${message}`);
    },
    server: '',
    signingUrlMethod: 'GET',
    scrubFilename(filename: string) {
      return filename.replace(/[^\w\d_\-.]+/gi, '');
    },
    s3path: '',
    autoUpload: true,
  };

  state = {
    value: '',
  };

  fileElement: RefObject<HTMLInputElement> = React.createRef();

  onChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const {autoUpload, onChange} = this.props;
    this.setState({value: e.target.value});
    if (autoUpload) {
      this.uploadFile();
    }
    if (onChange) {
      onChange(e);
    }
  };

  getInputProps = () => {
    const invalidProps = Object.keys(ReactS3Uploader.defaultProps);

    return Object.entries(this.props).reduce((propsList, [key, value]) => {
      if (invalidProps.includes(key)) {
        return propsList;
      }
      return {...propsList, [key]: value};
    }, {});
  };

  abort = () => {
    if (this.myUploader) this.myUploader.abortUpload();
  };

  uploadFile = () => {
    const {
      signingUrl,
      getSignedUrl,
      isInline,
      preprocess,
      onSignedUrl,
      onProgress,
      onFinish,
      onError,
      signingUrlMethod,
      signingUrlHeaders,
      signingUrlQueryParams,
      signingUrlWithCredentials,
      uploadRequestHeaders,
      contentDisposition,
      server,
      scrubFilename,
      s3path,
    } = this.props;

    this.myUploader = new S3Upload({
      fileElement: this.fileElement.current,
      signingUrl,
      getSignedUrl,
      isInline,
      preprocess,
      onSignedUrl,
      onProgress,
      onFinishS3Put: onFinish,
      onError,
      signingUrlMethod,
      signingUrlHeaders,
      signingUrlQueryParams,
      signingUrlWithCredentials,
      uploadRequestHeaders,
      contentDisposition,
      server,
      scrubFilename,
      s3path,
    });
  };

  myUploader: ?S3Upload;

  render() {
    const {capture} = this.props;
    const {value} = this.state;
    return (
      <input
        {...this.getInputProps()}
        ref={this.fileElement}
        accept={`image/*${capture ? ';capture=camera' : ''}`}
        type="file"
        onChange={this.onChange}
        value={value}
      />
    );
  }
}

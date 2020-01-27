import * as React from 'react';
import {ChangeEventHandler, Component, createRef} from 'react';
import {S3Uploader, SigningResult} from './S3Uploader';

type RefObject<T> = {
  current: T | null;
};

type Props = {
  /**
   * If set, selected files are automatically uploaded to S3
   */
  autoUpload?: boolean;
  /**
   * If set, the input can access mobile devices' camera (if supported by the browser)
   */
  capture?: boolean;
  contentDisposition?: string;
  isInline?: (fileType: string) => boolean;
  getSignedUrl?: (
    file: File,
    uploadToS3Callback: (result: SigningResult) => {},
  ) => {};
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onError?: (error: string) => void;
  onFinish?: (result: SigningResult, file: File) => void;
  /**
   * Called periodically as a file uploads
   * @param <number> Percentage complete
   * @param <string> Any messages, e.g. Waiting, Uploading, Finalizing, Upload completed
   * @param <File> File that is being uploaded
   */
  onProgress: (progress: number, message: string, file: File) => void;
  onSignedUrl: () => void;
  preprocess: (file: File, handler: (file: File) => {}) => {};
  scrubFilename: (s: string) => string;
  server: string;
  signingUrl: string;
  signingUrlHeaders: {} | (() => {[key: string]: string});
  signingUrlMethod: string;
  signingUrlQueryParams: {} | (() => {[key: string]: string});
  signingUrlWithCredentials?: boolean;
  s3path?: string;
  uploadRequestHeaders?: {};
};

type State = {
  value: string;
};

export default class ReactS3Uploader extends Component<Props, State> {
  static defaultProps = {
    capture: false,
    contentDisposition: '',
    getSignedUrl: null,
    isInline(fileType: string) {
      return fileType.substr(0, 6) === 'image/';
    },
    preprocess(file: File, next: (file: File) => void) {
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

  fileElement: RefObject<HTMLInputElement> = createRef();

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    this.myUploader = new S3Uploader({
      fileElement: this.fileElement.current!,
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

  myUploader?: S3Uploader;

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

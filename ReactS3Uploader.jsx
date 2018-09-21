// @flow
import * as React from 'react';
import S3Upload, {type SigningResult} from './S3Upload';

type RefObject<T> = {
  current: T | null,
};

type Props = {
  capture?: boolean,
  signingUrl?: string,
  getSignedUrl?: (file: File, uploadToS3Callback: (SigningResult) => *) => *,
  preprocess?: (File, (File) => *) => *,
  onSignedUrl?: (*) => void,
  onProgress?: (number, string, File) => void,
  onFinish?: SigningResult => void,
  onError?: string => void,
  signingUrlMethod?: string,
  signingUrlHeaders?: ?{} | ((*) => {[string]: *}),
  signingUrlQueryParams?: ?{} | ((*) => {[string]: *}),
  signingUrlWithCredentials?: boolean,
  uploadRequestHeaders?: {},
  onChange?: (SyntheticInputEvent<HTMLInputElement>) => *,
  contentDisposition?: string,
  server?: string,
  scrubFilename?: string => void,
  s3path?: string,
  autoUpload?: boolean,
};

type State = {
  value: string,
};

export default class ReactS3Uploader extends React.Component<Props, State> {
  static defaultProps = {
    capture: false,
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
      console.log(`Upload finished: ${signResult.publicUrl}`);
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

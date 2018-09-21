// @flow
import * as React from 'react';
import S3Upload, {type SigningResult} from './S3Upload';

type RefObject<T> = {
  current: T | null,
};

type Props = {
  capture: boolean,
  signingUrl: string,
  getSignedUrl: () => *,
  preprocess: (File, (File) => *) => *,
  onSignedUrl: (*) => void,
  onProgress: (number, string, File) => void,
  onFinish: SigningResult => void,
  onFinishS3Put: (*) => *,
  onError: string => void,
  signingUrlMethod: string,
  signingUrlHeaders: ?{} | ((*) => {[string]: *}),
  signingUrlQueryParams: ?{} | ((*) => {[string]: *}),
  signingUrlWithCredentials: boolean,
  uploadRequestHeaders: {},
  onChange: (SyntheticInputEvent<HTMLInputElement>) => *,
  contentDisposition: string,
  server: string,
  scrubFilename: string => void,
  s3path: string,
  inputRef: (*) => void,
  autoUpload: boolean,
};

type State = {
  value: string,
};

class ReactS3Uploader extends React.Component<Props, State> {
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

  fileElement: RefObject<HTMLInputElement> = React.createRef();

  onChange(e: SyntheticInputEvent<HTMLInputElement>) {
    const {autoUpload, onChange} = this.props;
    this.setState({value: e.target.value});
    if (autoUpload) {
      onChange(e);
    }
  }

  getInputProps = () => {
    const invalidProps = Object.keys(ReactS3Uploader);

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
      onFinishS3Put,
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
      onFinishS3Put,
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

module.exports = ReactS3Uploader;

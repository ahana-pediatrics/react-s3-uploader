const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    library: 'react-s3-uploader',
    libraryTarget: 'umd',
    publicPath: '/dist/',
    umdNamedDefine: true,
  },
  externals: {
    // Don't bundle react or react-dom
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React',
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'ReactDOM',
      root: 'ReactDOM',
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: 'last 2 versions',
                  },
                },
              ],
              '@babel/preset-react',
              '@babel/preset-flow',
            ],
            plugins: ['@babel/plugin-proposal-class-properties'],
          },
        },
      },
    ],
  },
};

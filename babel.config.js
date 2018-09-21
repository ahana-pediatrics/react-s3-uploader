module.exports = {
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
  plugins: [
    // Syntax Decorators MUST come before Class Properties
  ],
};

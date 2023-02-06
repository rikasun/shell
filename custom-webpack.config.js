const webpack = require('webpack');
// eslint-disable-next-line import/no-extraneous-dependencies
const { merge } = require('webpack-merge');
const nrwlConfig = require('@nrwl/react/plugins/webpack.js');

module.exports = (config) => {
  nrwlConfig(config);

  const websocketUrl = `wss://${process.env.NX_CODESPACE_NAME}-4200.${process.env.NX_GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/ws`;

  return merge(config, {
    plugins: [
      new webpack.EnvironmentPlugin({
        NX_CODESPACE_NAME: null,
        NX_GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: null,
      }),
    ],
    devServer: {
      allowedHosts: 'all',
      client: {
        webSocketURL: websocketUrl,
      },
    },
  });
};

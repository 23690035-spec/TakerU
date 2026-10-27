module.exports = ({ config }) => {
  const build = process.env.BUILD_NUMBER ? parseInt(process.env.BUILD_NUMBER, 10) : 0;
  return {
    ...config,
    android: {
      ...config.android,
      versionCode: build > 0 ? build : (config.android && config.android.versionCode) || 1,
    },
    extra: {
      ...(config.extra || {}),
      buildNumber: build,
      githubRepo: process.env.GITHUB_REPOSITORY || '',
    },
  };
};

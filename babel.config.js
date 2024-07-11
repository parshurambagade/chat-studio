module.exports = {
  // eslint-disable-next-line prettier/prettier
  presets: ['module:@react-native/babel-preset'],
  plugins: ["nativewind/babel",
    ["module:react-native-dotenv", {
      "envName": "APP_ENV", // Optional: Set an environment variable to differentiate between files (e.g., 'development' or 'production')
      "moduleName": "@env", // Optional: Customize the module name used to access variables (default: '@env')
      "path": ".env" // Optional: Customize the path to the environment file (default: '.env')
    }]
  ],
};

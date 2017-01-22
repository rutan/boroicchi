module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import",
  ],
  "env": {
    "browser": true,
    "node": true,
  },
  "rules": {
    "strict": 0,
    "no-console": 0,
    "no-unused-vars": [
      "error", {
        "argsIgnorePattern": "^_"
      }
    ],
    "no-underscore-dangle": [
      "error", {
        "allowAfterThis": true
      }
    ]
  },
};

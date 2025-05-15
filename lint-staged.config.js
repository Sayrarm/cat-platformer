module.exports = {
    'src/**/*.{js,ts}': ['eslint --fix'],
    'src/**/*.{css,scss}': ['stylelint --fix'],
    '*.{json,md}': ['prettier --write']
};

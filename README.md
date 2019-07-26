# @cosmic-plus/i18n-extractor

![Licence](https://img.shields.io/github/license/cosmic-plus/js-i18n-extractor.svg)
[![Dependencies](https://david-dm.org/cosmic-plus/js-i18n-extractor/status.svg)](https://david-dm.org/cosmic-plus/js-i18n-extractor)
![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@cosmic-plus/i18n-extractor.svg)
![Size](https://img.shields.io/bundlephobia/minzip/@cosmic-plus/i18n-extractor.svg)
![Downloads](https://img.shields.io/npm/dt/@cosmic-plus/i18n-extractor.svg)

Command-line interface that extract internationalized strings for translators.
It is exclusively developed for
[@cosmic-plus/i18n](https://github.com/cosmic-plus/node-i18n).

## Install

### Locally

* **NPM**: `npm install --save-dev @cosmic-plus/i18n-extractor`
* **Yarn**: `yarn add --dev @cosmic-plus/i18n-extractor`

### Globally

* **NPM**: `npm install -g @cosmic-plus/i18n-extractor`
* **Yarn**: `yarn global add @cosmic-plus/i18n-extractor`

## Usage

> i18n-extractor [LANGUAGES|'all'] SOURCE_DIR...

If **LANGUAGES** is provided, update/create translation files for **LANGUAGES**
with internationalized strings extracted from **SOURCE_DIR**. If **LANGUAGES**
is not provided, update any already existing translation files. **LANGUAGES**
must be a comma-separated list of languages, such as `cn,es,pt`.

When no **SOURCE_DIR** is provided, uses `${project_root}/src`. Translation
files are created at `${project_root}/locales/${language}.json`.


### Add a new translation

```sh
i18n-extractor ${language} src
```

### Update existing translations

```sh
i18n-extractor all src
```

### Add as a script into your package.json

Add the following into your package scripts:

```json
"scripts": {
  "i18n": "i18n-extractor all ./src"
}
```

You can now update translations files using:

```js
npm run i18n
```
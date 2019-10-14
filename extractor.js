#!/usr/bin/env node

function usage () {
  // eslint-disable-next-line no-console
  console.log(`
Usage: i18n-extractor [LANGUAGES|'all'] SOURCE_DIR...

If LANGUAGES is provided, update/create translation files for LANGUAGES with
internationalized strings extracted from SOURCE_DIR. If LANGUAGES is not
provided, update any already existing translation files. LANGUAGES must be a
comma-separated list of languages, such as 'cn,es,pt'.

When no SOURCE_DIR is provided, uses '\${project_root}/src'. Translation files
are created at '\${project_root}/locales/\${language}.json'.
`)
}

const { GettextExtractor, JsExtractors, HtmlExtractors } = require("gettext-extractor")
const fs = require("fs")


class Extractor extends GettextExtractor {
  constructor (sourceDirs) {
    super()

    this.jsParser = this.createJsParser([
      JsExtractors.callExpression("__", {
        arguments: { text: 0, context: 1 }
      }),
      JsExtractors.callExpression("__n", {
        arguments: { text: 0, textPlural: 1, context: 2 }
      }),
      JsExtractors.callExpression("__t", {
        arguments: { text: 0 }
      })
    ])

    this.htmlParser = this.createHtmlParser([HtmlExtractors.elementContent("i18n")])

    sourceDirs.forEach(entry => {
      this.jsParser.parseFilesGlob(entry + "/**/*.@(ts|js|tsx|jsx)")
      this.htmlParser.parseFilesGlob(entry + "/**/*.html")
    })

    this.printStats()
  }

  /**
   * Call `this.makeLocale()` for each one of **languages**.
   *
   * @param  {Array} languages An array of languages
   */
  makeLocales (langs) {
    langs.forEach(lang => this.makeLocale(lang))
  }

  /**
   * Make the locale file at `locales/${language}.json`.
   *
   * @param  {[type]} language
   */
  makeLocale (language) {
    if (!fs.existsSync(this.localesDir)){
      fs.mkdirSync(this.localesDir)
    }

    const path = `${this.localesDir}/${language}.json`
    const outdatedPath = `${this.localesDir}/${language}.outdated.json`
    const previous = fs.existsSync(outdatedPath) ? require(outdatedPath) : {}
    if (fs.existsSync(path)) Object.assign(previous, require(path))
    const latest = {}

    this.getMessages().forEach(message => {
      if (message.textPlural) {
        latest[message.text] = {
          one: (previous[message.text] && previous[message.text].one) || "",
          other: (previous[message.text] && previous[message.text].other) || message.textPlural
        }
      } else {
        latest[message.text] = previous[message.text] || ""
      }
      delete previous[message.text]
    })

    const data = JSON.stringify(latest, null, 2)
    fs.writeFile(path, data, () => {})

    // Handle outdated translations.
    for (let key in previous) {
      if (previous[key] === "") delete previous[key]
    }

    if (Object.keys(previous).length) {
      const outdated = JSON.stringify(previous, null, 2)
      fs.writeFile(outdatedPath, outdated, () => {})
    } else {
      if (fs.existsSync(outdatedPath)) fs.unlinkSync(outdatedPath)
    }
  }

  /**
   * Returns a languages *Array* that contains both **langs** from command-line
   * and aleady existing languages from `locales/` directory.
   *
   * @param  {String} langs A list of languages
   * @return {Array} An array of languages
   */
  parseLanguages (languages) {
    const array = languages ? languages.split(",") : []
    if (array.length === 1 && array[0] === "all") array.pop()
    if (array.length) return array

    const files = fs.readdirSync(this.localesDir)
    if (files) files.filter(filename => {
      if (filename.match(/.*\.json$/)) {
        const language = filename.replace(/\..*/, "")
        if (array.indexOf(language) === -1) array.push(language)
      }
    })

    return array
  }
}

try {
  if (process.argv[2] === "-h" || process.argv[2] === "--help") throw null

  // Find localesDir.
  let root = process.cwd()
  while (!fs.existsSync(root + "/package.json")) {
    root = root.replace(/\/[^/]*$/,"")
    if (!root) throw new Error ("Can't find project directory (no package.json).")
  }
  Extractor.prototype.localesDir = root + "/locales"

  // Parse arguments.
  const [,, languages, ... sourceDirs] = process.argv
  if (!sourceDirs.length) sourceDirs.push(root + "/src")

  // Extract i18n messages.
  const extractor = new Extractor(sourceDirs)
  const languagesArray = extractor.parseLanguages(languages)
  extractor.makeLocales(languagesArray)

} catch (error) {
  if (error) console.error(error)
  usage()
}

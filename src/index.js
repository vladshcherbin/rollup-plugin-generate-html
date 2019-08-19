import fs from 'fs-extra'
import posthtml from 'posthtml'
import insertAt from 'posthtml-insert-at'
import beautify from 'posthtml-beautify'

const defaultTemplate = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Rollup App</title>
    </head>
    <body>
    </body>
  </html>
`

// TODO filename option rename?
// TODO inline
export default function generateHtml(options = {}) {
  const {
    filename,
    template
  } = options

  if (!filename) {
    throw new Error('"filename" is required') // TODO change message?
  }

  return {
    name: 'generate-html',
    async writeBundle(bundle) {
      // TODO rename variables
      const html = template
        ? await fs.readFile(template, 'utf8')
        : defaultTemplate

      let scriptsHtml = ''

      Object.values(bundle).forEach((chunkInfo) => {
        if (chunkInfo.isEntry) {
          scriptsHtml = `${scriptsHtml}<script src="${chunkInfo.fileName}"></script>`
        }
      })

      const processedHtml = await posthtml([
        // TODO other plugins
        scriptsHtml.length && insertAt({
          selector: 'body',
          append: scriptsHtml
        }),
        beautify({
          rules: {
            blankLines: false
          }
        })
      ]).process(html)

      await fs.outputFile(filename, processedHtml.html)
    }
  }
}

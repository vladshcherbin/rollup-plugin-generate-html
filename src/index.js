import fs from 'fs-extra'
import posthtml from 'posthtml'
import insertAt from 'posthtml-insert-at'
import { html as beautify } from 'js-beautify'

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

export default function generateHtml(options = {}) {
  const {
    filename,
    inline = false,
    template,
    selector = 'body'
  } = options

  if (!filename) {
    throw new Error('"filename" is required') // TODO change message?
  }

  return {
    name: 'generate-html',
    async generateBundle(_, bundle) {
      const templateHtml = template
        ? await fs.readFile(template, 'utf8')
        : defaultTemplate

      let scriptTags = ''

      if (inline) {
        Object.entries(bundle).forEach(([chunkTitle, chunkInfo]) => {
          if (chunkInfo.isEntry) {
            scriptTags = `${scriptTags}<script>${chunkInfo.code}</script>`

            delete bundle[chunkTitle]
          }
        })
      } else {
        Object.values(bundle).forEach((chunkInfo) => {
          if (chunkInfo.isEntry) {
            scriptTags = `${scriptTags}<script src="${chunkInfo.fileName}"></script>`
          }
        })
      }

      const generatedHtml = await posthtml([
        scriptTags.length && insertAt({
          selector,
          append: scriptTags
        })
      ]).process(templateHtml)

      await fs.outputFile(filename, beautify(generatedHtml.html, {
        end_with_newline: true,
        extra_liners: [],
        indent_inner_html: true,
        indent_size: 2
      }))
    }
  }
}

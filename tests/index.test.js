import fs from 'fs-extra'
import { rollup } from 'rollup'
import { terser } from 'rollup-plugin-terser'
import generateHtml from '../src'

process.chdir(`${__dirname}/fixtures`)

async function build(options, minify) {
  const bundle = await rollup({
    input: 'src/index.js',
    plugins: [
      generateHtml(options),
      minify && terser()
    ]
  })

  await bundle.write({
    file: 'dist/app.js',
    format: 'iife',
    compact: minify
  })
}

function readFile(filename) {
  return fs.readFile(filename, 'utf8')
}

afterEach(async () => {
  await fs.remove('dist')
})

describe('Options', () => {
  test('Throw if "filename" is not set', async () => {
    await expect(build()).rejects.toThrow('"filename" is required')
  })

  test('Throw if template file doesn\'t exist', async () => {
    await expect(build({
      filename: 'dist/index.html',
      template: 'nonexistent/template.html'
    })).rejects.toThrow('ENOENT: no such file or directory, open \'nonexistent/template.html\'')
  })
})

describe('Default template', () => {
  describe('External', () => {
    test('Head', async () => {
      await build({
        filename: 'dist/index.html',
        selector: 'head'
      })

      expect(await fs.pathExists('dist/app.js')).toBe(true)
      expect(await fs.pathExists('dist/index.html')).toBe(true)
      expect(await readFile('dist/index.html')).toBe(await readFile('samples/external-head.html'))
    })

    test('Body', async () => {
      await build({
        filename: 'dist/index.html',
        selector: 'body'
      })

      expect(await fs.pathExists('dist/app.js')).toBe(true)
      expect(await fs.pathExists('dist/index.html')).toBe(true)
      expect(await readFile('dist/index.html')).toBe(await readFile('samples/external-body.html'))
    })
  })

  describe('Inline', () => {
    test('Unformatted', async () => {
      await build({
        filename: 'dist/index.html',
        selector: 'head',
        inline: true
      }, true)

      expect(await fs.pathExists('dist/app.js')).toBe(false)
      expect(await fs.pathExists('dist/index.html')).toBe(true)
      expect(await readFile('dist/index.html')).toBe(await readFile('samples/inline-unformatted.html'))
    })

    test('Formatted', async () => {
      await build({
        filename: 'dist/index.html',
        selector: 'head',
        inline: true,
        formatInline: true
      })

      expect(await fs.pathExists('dist/app.js')).toBe(false)
      expect(await fs.pathExists('dist/index.html')).toBe(true)
      expect(await readFile('dist/index.html')).toBe(await readFile('samples/inline-formatted.html'))
    })
  })
})

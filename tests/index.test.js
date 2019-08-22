import fs from 'fs-extra'
import { rollup } from 'rollup'
import generateHtml from '../src'

process.chdir(`${__dirname}/fixtures`)

async function build(options) {
  const bundle = await rollup({
    input: 'src/index.js',
    plugins: [
      generateHtml(options)
    ]
  })

  await bundle.write({
    file: 'dist/app.js',
    format: 'iife'
  })
}

function readFile(filename) {
  return fs.readFile(filename, 'utf8')
}


afterEach(async () => {
  await fs.remove('dist')
})

test('Throw if "filename" is not set', async () => {
  await expect(build({
    template: 'src/template.html'
  })).rejects.toThrow('"filename" is required')
})

test('Throw if specified template doesn\'t exist', async () => {
  await expect(build({
    filename: 'dist/index.html',
    template: 'nonexistent/template.html'
  })).rejects.toThrow('ENOENT: no such file or directory, open \'nonexistent/template.html\'')
})

test('Generate default template with injected script', async () => {
  await build({
    filename: 'dist/index.html'
  })

  expect(await fs.pathExists('dist/app.js')).toBe(true)
  expect(await fs.pathExists('dist/index.html')).toBe(true)
  expect(await readFile('dist/index.html')).toBe(await readFile('samples/bare.html'))
})

test('Generate default template with inline script', async () => {
  await build({
    filename: 'dist/index.html',
    inline: true,
    selector: 'head'
  })

  expect(await fs.pathExists('dist/app.js')).toBe(false)
  expect(await fs.pathExists('dist/index.html')).toBe(true)
  expect(await readFile('dist/index.html')).toBe(await readFile('samples/inline.html'))
})

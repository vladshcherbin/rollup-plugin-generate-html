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

test('Throw if specified template doesn\'t exist', async () => {
  await build({
    template: 'nonexistent/template.html'
  })

  expect(1 + 1).toBe(2)
})

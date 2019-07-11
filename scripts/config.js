const path = require('path')
const babel = require('rollup-plugin-babel')
const typescript = require('rollup-plugin-typescript')
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs')
const replace = require("rollup-plugin-replace");

const resolve = p => {
  return path.resolve(__dirname, '../', p)
}

const config = {
  "web-dev": {
    input: {
      index: resolve('src/index.ts')
    },
    output: {
      dir: 'example-app/src/socketPlugin',
      format: 'umd',
      name: "socketPlugin",
      globals: {
        '@stomp/stompjs': 'stompjs',
        'sockjs-client': 'SockJS',
      },
    },
    plugins: [
      nodeResolve({
        // 将自定义选项传递给解析插件
        customResolveOptions: {
          moduleDirectory: 'node_modules'
        }
      }),
      commonjs(),
      babel({
        exclude: resolve('node_modules/**') // 仅仅转译我们的源码
      }),
      typescript(),
    ],
    external: ['@stomp/stompjs', 'sockjs-client'],
  },
  "web-pro": {
    // alias: alias,
    // sourceMap: true,
    input: {
      index: resolve('src/index.ts')
    },
    output: {
      dir: 'lib',
      format: 'umd',
      name: "socketPlugin",
      globals: {
        '@stomp/stompjs': 'stompjs',
        'sockjs-client': 'SockJS',
      },
    },
    plugins: [
      nodeResolve({
        // 将自定义选项传递给解析插件
        customResolveOptions: {
          moduleDirectory: 'node_modules'
        }
      }),
      commonjs(),
      babel({
        exclude: resolve('node_modules/**') // 仅仅转译我们的源码
      }),
      typescript(),
    ],
    external: ['@stomp/stompjs', 'sockjs-client'],
  }
}
function genConfig(target) {
  // if (config[target].env) {
  //   config[target].plugins.push(replace({
  //     'process.env.NODE_ENV': JSON.stringify(opts.env)
  //   }))
  // }
  return config[target]
}
export default genConfig(process.env.TARGET)
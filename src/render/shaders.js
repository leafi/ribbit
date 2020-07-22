import * as twgl from 'twgl.js/dist/4.x/twgl-full.module.js'
import rchunkVertSource from '@/shaders/rchunk.vert'
import rchunkOpaqueFragSource from '@/shaders/rchunk-opaque.frag'

const sh = {}

const builders = [
  ['rchunkOpaque', [rchunkVertSource, rchunkOpaqueFragSource]]
]

export function initShadersAsync (gl) {
  return new Promise((resolve, reject) => {
    let idx = 0
    let numFail = 0

    const subBuild = () => {
      if (idx >= builders.length) {
        (numFail > 0 ? console.warn : console.info)(`${builders.length - numFail} OK, ${numFail} shaders failed`)
        resolve(numFail === 0)
        return
      }

      const [shaderName, shaderSources] = builders[idx]
      console.log(`Building shader '${shaderName}'...`)
      const maybeProgramInfo = twgl.createProgramInfo(gl, shaderSources)

      if (maybeProgramInfo) {
        sh[shaderName] = maybeProgramInfo
      } else {
        sh[shaderName] = null
        numFail++
      }

      idx++

      window.setTimeout(subBuild, 1)
    }

    window.setTimeout(subBuild, 1)
  })
}

export default sh

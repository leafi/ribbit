/* eslint-env browser */
import '@exampledev/new.css'
import './variables.css'
import './global.css'
// import { h, render } from 'preact'
import { recreateStore } from './store'
// import App from './components/App'
// import Minim from '@/Minim'

console.log('Hi there!')

recreateStore()

// const divEl = document.getElementById('_mount_target')
// console.info(divEl)

// install 'Minim' non-default story
// Minim()

// render(<App />, document.getElementById('app'))

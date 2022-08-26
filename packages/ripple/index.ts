import type { App } from 'vue'
import RippleDirective from './src/ripple-directive'

export { RippleDirective }

export default {
  title: 'Ripple 水波纹',
  install(app: App): void {
    app.directive('Ripple', RippleDirective)
  }
}

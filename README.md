>本文源于 [Vue DevUI](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2FDevCloudFE%2Fvue-devui "https://github.com/DevCloudFE/vue-devui") 开源组件库实践。
# 1. DevUI Ripple介绍


## 1.1 Ripple 涟漪效果
### 水波效果

Ripple水波纹作为比较受欢迎的交互效果，用于对用户的行为进行反馈，本文将解析DevUI,Ripple指令，并且从0到1为大家展示如何写出兼容Vue2和Vue3的自定义指令并且发布到npm

### 效果展示

![ripple.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff828195a59648788cefa2a4ca2813c3~tplv-k3u1fbpfcp-watermark.image?)

本文做为代码逻辑拆解，具体实现以及效果可以进入DevUI官网查看

[官网传送门](https://vue-devui.github.io/)

[Github传送门](https://github.com/DevCloudFE/vue-devui)

[Ripple指令实战打包发布Github传送门](https://github.com/ErKeLost/ripple-directive)
# 2. 核心功能解析

## 2.1 实现根本逻辑

水波纹指令需要作用在一个块级元素，元素要有宽度和高度，每当用户点击，获取用户点击坐标到块级元素的四个直角顶点的距离其中距离最远的顶点作为`ripple`半径画圆

#### 图解
![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/395c0571c2e64cc68324c0332dbc1c8c~tplv-k3u1fbpfcp-watermark.image?)

## 2.2 交互事件

交互事件对于ripple的展示与移除，我们带大家体验h5的`pointEvent`指针事件

## 2.3 Ripple元素生成问题

因为水波纹实际上是一个圆形,最终实现的大小会比当前点击元素大很多，类似于这样

![ripple.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/31d45406115242f297f8d2799abdb9d2~tplv-k3u1fbpfcp-watermark.image?)
一种解决办法是我们给父元素添加`over-flow: "hidden"`，但是这样也会存在着一个问题，我们给父元素动态添加css属性属于修改了用户层面的样式，这就会导致各种隐藏bug，引起不必要的麻烦
这种解决方法，我们采用父元素与`ripple`之间在嵌套一层元素，作为`ripple`的父元素，并且对最外层的父元素也就是用户点击的元素做绝对定位就可以解决问题


## 2.4 如何兼容Vue2 和 Vue3

Vue2和Vue3在指令方面最大的区别就是生命周期的不同，这样我们可以根据当前Vue版本来选择Map不同的生命周期进行兼容Vue2跟Vue3


# 3. 代码实现

## 3.1 获取鼠标点击坐标以及距离顶点距离

- 获取鼠标点击指令元素的`DomRect`对象,获取我们当前距离视口和距离el的各个位置

```js
  // el 代表点击元素 
  const rect = el.getBoundingClientRect();
  // 获取点击位置距离el的垂直和水平距离 event 代表鼠标事件 directive 指令会传递event参数
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const height = rect.height
  const width = rect.width
```
- 然后我们一开始是拿不到点击位置距离各个顶点位置，我们可以根据勾股定理获取到点击坐标到矩形四个顶点的位置，然后判断谁是最长的那么最长的那个就作为`Ripple`的半径，继续上部分代码

```ts
// 计算勾股定理函数
function getDistance (x1: number, y1: number, x2: number, y2: number): number {
  const deltaX = x1 - x2;
  const deltaY = y1 - y2;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}
const topLeft = getDistance(x, y, 0, 0);
const topRight = getDistance(x, y, width, 0);
const bottomLeft = getDistance(x, y, 0, height);
const bottomRight = getDistance(x, y, width, height);
const radius = Math.max(topLeft, topRight, bottomLeft, bottomRight);
```
radius 就是我们需要的`Ripple`的半径
## 3.2 创建Ripple元素与Ripple的第一级父元素
我们先创建Ripple的第一级父元素，
我们其实就是需要复制一个div，让复制出来的div做跟el一样的事，
`cloneNode`不会复制原来的样式，就直接创建元素就好，先获取el的样式，然后复制出一模一样的节点，目前我们需要跟el元素的`boder-radius`相同
```js
const computedStyles = window.getComputedStyle(el);
const {
  borderTopLeftRadius,
  borderTopRightRadius,
  borderBottomLeftRadius,
  borderBottomRightRadius
} = computedStyles
const rippleContainer = document.createElement('div');
rippleContainer.style.top = '0';
rippleContainer.style.left = '0';
rippleContainer.style.width = '100%';
rippleContainer.style.height = '100%';
rippleContainer.style.position = 'absolute';
rippleContainer.style.borderRadius =
`${borderTopLeftRadius} ${borderTopRightRadius} ${borderBottomRightRadius} ${borderBottomLeftRadius}`;
rippleContainer.style.overflow = 'hidden';
rippleContainer.style.pointerEvents = 'none';
```
我们主要需要元素做`overflow = 'hidden'`防止元素溢出，影响全局

然后我们创建Ripple元素

```js
  const x = event.clientX - rect.left 
  const y = event.clientY - rect.top
  const rippleElement = document.createElement('div');
  rippleElement.style.position = 'absolute';
  rippleElement.style.width = `${radius * 2}px`;
  // rippleElement.style.height = `${radius * 2}px`;
  rippleElement.style.top = `${y}px`;
  rippleElement.style.left =`${x}px`;

  rippleElement.style.background = options.color;
  rippleElement.style.borderRadius = '50%';
  rippleElement.style.opacity = 0.1;
  rippleElement.style.transform = `translate(-50%,-50%) scale(0)`;
  rippleElement.style.transition = `transform ${options.duration / 1000}s   ease-in-out
  , opacity ${options.duration / 1000}s
  ease-in-out
  `;
```
## 3.3 事件交互

我们创建完元素之后，接下来进行事件交互，
> 我们应该是在每次鼠标点击的时候触发`Ripple`元素的生成, 因为我们的css 写了`transition` 为 `options.duration` 我们触发transfrom 就会出现`Ripple`的效果了

```js
setTimeout(() => {
    rippleEl.style.transform = `translate(-50%,-50%) scale(1)`;
    rippleEl.style.opacity = `${options.finalOpacity}`;
}, options.delay);
```
![ripple.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4bc079a7106b41c9a1f3e062669d4e53~tplv-k3u1fbpfcp-watermark.image?)
> 然后我们需要优化一下代码 每次点击都会生成`Ripple`元素，所以我们每次结束后都要把当前元素删掉，并且如果上次点击过生成的Ripple也需要删除掉
> 我们首先监听鼠标点击抬起事件，我们鼠标抬起我们需要移除Ripple


```js
let shouldDissolveRipple = false;
function releaseRipple(e?: PointerEvent) {
    // 我们一种是监听指针事件去移除ripple 第二种是当我们设置duration时间过后，我们也需要自动去移除ripple
    if (typeof e !== 'undefined') {
      document.removeEventListener('pointerup', releaseRipple);
    }
    console.log(e);
    console.log(shouldDissolveRipple);
    // 判断我们什么时候需要去调用移除ripple方法，只有我们鼠标抬起，或者设置的duration时间过后
    if (shouldDissolveRipple) {
      dissolveRipple();
    } else {
      shouldDissolveRipple = true;
    }
}
function dissolveRipple() {
    rippleEl.style.transition = 'opacity 120ms ease in out';
    rippleEl.style.opacity = '0';
    setTimeout(() => {
      // 删除ripple第一层父元素
      rippleContainer.remove();
    }, 100);
}
setTimeout(() => {
    rippleEl.style.transform = `translate(-50%,-50%) scale(1)`;
    rippleEl.style.opacity = `${options.finalOpacity}`;
    // 自动移除ripple
    setTimeout(() => releaseRipple(), options.duration);
}, options.delay);
// 监听指针（鼠标）抬起事件 监听移除rippele
document.addEventListener('pointerup', releaseRipple);
```


> 这时候 最简单的ripple效果就出来啦 


## 3.4 兼容Vue2 & Vue3

`app.config.globalProperties` 这是一个在Vue3中访问全局属性的对象，我们只需要判断当前Vue实例中是否有`globalProperties`这个对象，然后赋值不同的生命周期


```js
import { App } from 'vue'

interface Vue2 {
  default: {
    version: string
  }
}

const isVue3 = (app: Vue2 | App): app is App => 'config' in app && 'globalProperties' in app.config
const getHooks = (app: App) => {
  return isVue3(app)
    ? {
        created: 'created',
        mounted: 'mounted',
        updated: 'updated',
        unMounted: 'unmounted'
      }
    : {
        created: 'bind',
        mounted: 'inserted',
        updated: 'updated',
        unMounted: 'unbind'
      }
}

const VRippleDirective = (app: any) => {
  const hooks = getHooks(app)
  app.directive('ripple', {
    [hooks.mounted](el: HTMLElement, { value }: any) {
      clickoutside(el, value)
    },
    [hooks.updated](el: HTMLElement, { value }: any) {
      clickoutside(el, value)
    },
    [hooks.unMounted]() {
      deleteClickOutside()
    }
  })
}
```

然后我们返回一个Vue的插件, 在这里我们可以获取app对象
```js
import VRippleDirective from './ripple'

export const VRipple = {
  install: function (app: App | Vue2, options: any) {
    VRippleDirective(app) // 点击outside
  }
} as Plugin & { installed: boolean }

// Vue3 
const app = createApp(App)
app.use(VRipple)

// Vue2
import Vue from 'vue'
Vue.use(VRipple)
```


> [完整代码传送门](https://github.com/ErKeLost/ripple-directive)
# 4. 打包与发布

我们使用`tsup`进行打包
> 新建 src/index.ts 文件

```js
import VRippleDirective from './ripple'

export const VRipple = { 
    install: function (app: App | Vue2, options: any){ 
        VRippleDirective(app)
    }
} as Plugin & { installed: boolean }
```

> 下载tsup，然后根目录新建tsup.config.js

```js
npm install tsup
``` 
> tsup.config.js
```js
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  target: 'esnext',
  format: ['esm', 'cjs', 'iife'],
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['vue']
})

```
> 然后就可以发布npm包啦

# 5. 总结

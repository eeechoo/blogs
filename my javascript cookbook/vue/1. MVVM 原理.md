# MVVM 双向数据绑定之核心原理

## 1. 概述
MVVM 模式，该模式叫做视图模型双向数据绑定，以达到数据和视图快速同步的目的。
```HTML
<div id="app">
  <p>{{ message }}</p>
  <input v-model="message">
</div>
```
```JAVASCRIPT
new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})
```

## 2. 双向数据绑定
就是指数据的传递有两个方向：

- 方向1：从数据到视图，数据变化时，视图也变化。
- 方向2：从视图到数据，例如 input 框的内容变化时，JS 维护的数据也会变化，同时再次传递到视图上，视图也随之变化。

若要实现以上的数据传递，我们需要去监听数据变化和视图的变化，才能做出相应改变。

## 3. 监听模型数据变化
```JAVASCRIPT
var o = {}; // 创建一个新对象

// 在对象中添加一个属性与存取描述符的示例
var messageValue;
Object.defineProperty(o, "message", {
  get : function(){
    return messageValue;
  },
  set : function(newValue){
    messageValue = newValue;
  },
});
```
以上的代码，在设计上称之为：数据劫持。这个设计也是 MVVM 的核心原理之一。

ES6 的 Proxy 也可以完成此项功能。据称 vue3 就会使用 Proxy 代替 defineProperty。

真正实现时，往往一个模型的变化，需要更新好多视图部分，因此设计时，通常会选用观察者模式（Observer pattern）。


# MVVM 双向数据绑定之基础实现

## 1. 目的是为了实现下面功能
```html
// Vue 实现
<script src="Vue.js"></script>

// 组件
<div id="app">
  <p>{{ message }}</p>
  <input v-model="message">
</div>

// 初始化组件
<script>
  var app6 = new Vue({
    el: '#app',
    data: {
      message: 'Hello Vue!'
    }
  })
</script>
```

## 2. 实现

Vue 实例化
```javascript
// Vue 组件构造器
function Vue(options) {
  // 确定 DOM
  this.elem = document.querySelector(options.el)
  // 记录数据
  this.data = options.data || {}
  // 监视数据改动，数据劫持
  this.observe()
  // 编译模板
  this.compile()
}
```

observe 数据劫持
```JAVASCRIPT
// 监视模型数据
Vue.prototype.observe = function () {
  // 遍历全部的 data 模型数据
  Object.keys(this.data).forEach(attr => {
    Object.defineProperty(this, attr, {
      get() {
        return this.data[attr]
      },
      set(value) {
        this.data[attr] = value
        // 数据修改的时候，通过监视器模式，监视器改变
        watcherSet.notify(attr)
      }
    })
  })
}
```

观察者模式
```javascript
// 观察者集合构造器
function WatcherSet() {
  this.members = {}
}
// 注册观察者
WatcherSet.prototype.register = function(watcher) {
  // 每个属性使用一个 Set 集合，来存储观察者
  if (this.members[watcher.attr]) {
    this.members[watcher.attr].add(watcher)
  } else {
    this.members[watcher.attr] = new Set([watcher])
  }
}
// 通知某个属性的更新方法执行
WatcherSet.prototype.notify = function(attr) {
  // 调用当前属性上每个观察者的 update 方法，更新 DOM
  this.members[attr].forEach((watcher) => {
    watcher.update()
  })
}

// 观察者集合
var watcherSet = new WatcherSet()

// 观察者构造器
function Watcher(attr, update) {
  this.attr = attr
  this.update = update
  // 将当前观察者加入观察者集合
  watcherSet.register(this)
}
```

编译 HTML 模板
```javascript
Vue.prototype.compile = function() {
  let vm = this
  let pattern = /{{\s*(\w+)\s*}}/
  // 遍历全部的 DOM 节点
  Array.from(vm.element.children).forEach(node => {
        // 监听数据改变 处理 {{ }}
        if (pattern.test(node.innerHTML)) {
            // 利用正则表达式，找到内容中 {{ }} 的部分，替换为当前模型的值
            node.originInnerHTML = node.innerHTML
            let match = node.originInnerHTML.match(pattern)
            let attr = match[1]
            node.innerHTML = node.originInnerHTML.replace(pattern, vm[attr]);
            // 增加一个观察者
            new Watcher(attr, () => {
            node.innerHTML = node.originInnerHTML.replace(pattern, vm[attr]);
            }) 
        } else if (node.hasAttribute("v-model")) {
            let attr = node.getAttribute("v-model")
            node.value = vm[attr]
            // 监听DOM变化，更新数据模型
            node.addEventListener("input", e => {
                vm[attr] = e.target.value
            }) 
            // 增加一个观察者
            new Watcher(attr, () => {
                node.value = vm[attr]
            }) 
        }
        
  })
}
```
# Vue 规范检查项

## 组件规范

### 组件选项顺序

```
components > props > data > computed > watch > filter > 钩子函数（按执行顺序） > methods
```

### 1. 组件名为多个单词

组件名应该始终是多个单词组成（大于等于 2），且命名规范为 KebabCase 格式。这样可以避免跟现有的以及未来的 HTML 元素相冲突。

```javascript
// 正例
export default {
  name: 'TodoItem'
};

// 反例
export default {
  name: 'Todo'
}
export default {
  name: 'todo-item'
}
```

### 2. Template 中使用组件

在模版中使用组件，应使用 PascalCase 模式，并且使用自闭合组件。

```html
<!-- 正例 -->
<MyComponent />
<Row><table :column="data" /></Row>

<!-- 反例 -->
<my-component /> <row><table :column="data" /></row>
```

### 3. data 必须是一个函数

当在组件中使用 data 属性的时候（除了 new Vue 外的任何地方），它的值必须是返回一个对象的函数。因为如果直接是一个对象的话，子组件之间的属性值会互相影响。

```javascript
// 正例
export default {
  data () {
    return {
      name: 'jack'
    }
  }
}

// 反例
export default {
  data: {
    name: 'jack'
  }
}
```

### 4. Prop 定义应该尽量详细

- 必须使用 camelCase 驼峰命名
- 必须指定类型
- 必须加上注释，表明其含义
- 必须加上 required 或者 default，两者二选其一
- 如果有业务需要，必须加上 validator 验证

```javascript
// 正例
props: {
  // 组件状态，用于控制组件的颜色
  status: {
    type: String,
    required: true,
    validator: function (value) {
      return ['succ', 'info', 'error'].indexOf(value) !== -1
    }
  },
  // 用户级别，用于显示皇冠个数
  userLevel: {
    type: String,
    required: true
  }
}
```

### 5. 为组件样式设置作用域

```html
<!-- 正例 -->
<template>
  <button class="btn btn-close">X</button>
</template>
<style scoped>
  .btn-close {
    background-color: red;
  }
</style>

<!-- 反例 -->
<template>
  <button class="btn btn-close">X</button>
</template>
<style>
  .btn-close {
    background-color: red;
  }
</style>
```

### 6. 特性元素较多时主动换行

```html
<!-- 正例 -->
<MyComponent
  foo="a"
  bar="b"
  baz="c"
  foo="a"
  bar="b"
  baz="c"
  foo="a"
  bar="b"
  baz="c"
/>

<!-- 反例 -->
<MyComponent
  foo="a"
  bar="b"
  baz="c"
  foo="a"
  bar="b"
  baz="c"
  foo="a"
  bar="b"
  baz="c"
  foo="a"
  bar="b"
  baz="c"
/>
```

### 7. 模板中使用简单的表达式

组件模板应该只包含简单的表达式，复杂的表达式则应该重构为计算属性或方法。

```html
<!-- 正例 -->
<template>
  <p>{{ normalizedFullName }}</p>
</template>

<script>
  export default {
    computed: {
      normalizedFullName: function () {
        return this.fullName
          .split(" ")
          .map(function (word) {
            return word[0].toUpperCase() + word.slice(1);
          })
          .join(" ");
      },
    },
  };
</script>

<!-- 反例 -->
<template>
  <p>
    {{ fullName.split(' ').map(function (word) { return word[0].toUpperCase() +
    word.slice(1) }).join(' ') }}
  </p>
</template>
```

### 8. 指令使用缩写形式

指令推荐都使用缩写形式（用 : 表示 v-bind:、用 @ 表示 v-on:、用 # 表示 v-slot:）

```html
<!-- 正例 -->
<input @input="onInput" @focus="onFocus" />

<!-- 反例 -->
<input v-on:input="onInput" @focus="onFocus" />
```

### 9. 必须为 v-for 设置键值 key

```html
<!-- 正例 -->
<div v-for="item in items" :key="item.id">{{ item.name }}</div>
```

### 10. v-show 与 v-if 选择

- 如果运行时需要非常频繁地切换，使用 v-show
- 如果在运行时条件很少改变，使用 v-if

### 11. 标签顺序保持一致

单文件组件应该总是让标签顺序保持为：

```html
<template>...</template>
<script>
  ...
</script>
<style>
  ...
</style>
```

## Vue Router 规范

### 1. 页面跳转数据传递使用路由参数

页面跳转需要将数据传递到另一个页面时，推荐使用路由参数进行传参，而不是将数据保存到 vuex（刷新会导致数据丢失）。

```javascript
// 正例
let id = "123";
this.$router.push({ name: "userCenter", query: { id: id } });
```

### 2. 使用路由懒加载（延迟加载）机制

```javascript
{
  path: '/uploadAttachment',
  name: 'uploadAttachment',
  meta: {
    title: '上传附件'
  },
  component: () => import('@/view/components/uploadAttachment/index.vue')
}
```

## 其它规范

### 1. 尽量不要手动操作 DOM

因使用 Vue 框架，所以在项目开发中尽量使用 vue 的数据驱动更新 DOM，尽量（不到万不得已）不要手动操作 DOM，包括：增删改 DOM 元素、更改样式、添加事件等。

### 2. 删除无用代码

因使用了 git/svn 等代码版本工具，对于无用代码必须及时删除，例如：一些调试的 console 语句、无用的弃用功能代码。

## 性能优化规范

### 1. 不要将所有的数据都放在 data 中

可以将一些不被视图渲染的数据声明到实例外部然后在内部引用。因为 Vue2 初始化数据的时候会将 data 中的所有属性遍历通过 Object.definePrototype 重新定义所有属性；Vue3 是通过 Proxy 去对数据包装，内部也会涉及到递归遍历，在属性比较多的情况下很耗费性能。

### 2. watch 尽量不要使用 deep: true 深层遍历

因为 watch 不存在缓存，是指定监听对象，如果 deep: true 并且监听对象类型情况下，会递归处理收集依赖，最后触发更新回调。

### 3. v-for 时给每项元素绑定事件需要用事件代理

Vue 源码中是通过 addEventListener 去给 DOM 绑定事件的，比如使用 v-for 需要渲染 100 条数据并且为每个节点添加点击事件，如果每个都绑定事件就存在很多的 addEventListener，性能上肯定不好，需要使用事件代理处理。

### 4. v-for 尽量不要与 v-if 一同使用

因为 AST 在转化为 render 函数的时候会将每个遍历生成的对象都会加入 if 判断，最后在渲染的时候每次都会判断一次需要不需要渲染，这样就很浪费性能。通用的做法可以外面再包一层用于 if 判断。

### 5. v-for 的 key 不要以遍历索引作为 key

对于增删列表项的情况下一定不要用索引序号作为 key，其它情况除非不得已否则不要用索引序号作为 key。

### 6. SPA 页面采用 keep-alive 缓存组件

使用了 keep-alive 之后页面不会卸载而是会缓存起来，keep-alive 底层使用的 LRU 算法（淘汰缓存策略），当从其他页面回到初始页面的时候不会重新加载而是从缓存里获取，这样既减少 HTTP 请求也不会消耗过多的加载时间。

### 7. 避免使用 v-html

- 可能会导致 xss 攻击
- v-html 更新的是元素的 innerHTML，内容按普通 HTML 插入，不会作为 Vue 模板进行编译

### 8. 拆分组件，提取公共代码，提取组件的 CSS

主要目的就是提高复用性、增加代码的可维护性，减少不必要的渲染，将组件中公共的方法和 css 样式分别提取到各自的公共模块下。

### 9. 首页白屏-骨架屏

当第一次进入 Vue 项目的时候，会出现白屏的情况，为了避免这种尴尬的情况，在 Vue 编译之前使用骨架屏加载动画避免。

### 10. 合理使用 v-if

当值为 false 时内部指令不会执行，具有阻断功能。如果操作不是很频繁可以使用 v-if 替代 v-show，如果很频繁可以使用 v-show 来处理。

### 11. 获取 DOM 使用 ref 代替 document.getElementsByClassName

document.getElementsByClassName 获取 DOM 节点的作用是一样的，但使用 ref 会减少获取 DOM 节点的消耗。

### 12. Object.freeze 冻结数据

使用 Object.freeze 处理的 data 属性，不会被 getter、setter，减少一部分消耗。但是 Object.freeze 也不能滥用，当需要一个非常长的字符串的时候推荐使用。

### 13. 合理使用路由懒加载、异步组件

当打包构建应用时，JavaScript 包会变得非常大，影响页面加载。然后当路由被访问的时候才加载对应组件，这样就更加高效了。

### 14. 防抖、节流

比如注册新用户时用户输入昵称需要校验昵称的合法性，考虑到用户输入的比较快或者修改频繁，这时候需要使用节流，间隔性的去校验，这样就减少了判断的次数达到优化的效果。

### 15. 重绘、回流

回流的性能消耗比重绘大，回流一定会触发重绘，重绘不一定会回流。回流会导致渲染树需要重新计算，开销比重绘大，所以要尽量避免回流的产生。

### 16. 组件销毁时做好清理

组件销毁时候需要做的事情，比如当页面卸载的时候需要将页面中定时器清除，销毁绑定的监听事件。

```javascript
// destroyed 钩子中清理
export default {
  destroyed() {
    // 清除定时器
    if (this.timer) {
      clearInterval(this.timer);
    }
    // 移除事件监听
    window.removeEventListener("resize", this.handleResize);
  },
};
```

### 17. 使用异步组件和组件懒加载

原理与路由懒加载一样的，只有需要的时候才会加载组件。

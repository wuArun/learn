# HTML 规范检查项

## 基本规范

### 1. 标签规范

- 自闭合（self-closing）标签，无需闭合（例如：img input br hr 等）
- 可选的闭合标签（closing tag），需闭合
- 尽量减少标签数量

```html
<!-- 正例 -->
<img src="..." alt="..." />
<input type="text" />
<br />
<hr />

<!-- 反例 -->
<Img src="..."></Img>
```

### 2. 缩进规范

- JSX 语法使用 2 个空格缩进
- 每个子元素都需要相对其父级缩进
- 将每个块元素、列表元素或表格元素都放在新行

```html
<!-- 正例 -->
<div>
  <ul>
    <li>item</li>
  </ul>
</div>

<!-- 反例 -->
<div>
  <ul>
    <li>item</li>
  </ul>
</div>
```

### 3. 空格规范

- 自闭合标签的斜线前有且仅有一个空格
- JSX 行内属性之间仅有一个空格
- JSX 属性的大括号内部两侧无空格

```html
<!-- 正例 -->
<Foo />
<Foo bar="bar" />

<!-- 反例 -->
<Foo />
<!-- 无空格 -->
<Foo bar="bar" />
<!-- 多余空格 -->
<Foo bar="{" baz } />
<!-- 大括号内有多余空格 -->
```

### 4. 引号规范

- JSX 属性使用双引号，不要使用单引号

```html
<!-- 反例 -->
<Foo bar="bar" />

<!-- 正例 -->
<Foo bar="bar" />
```

### 5. 括号规范

- 多行的 JSX 标签需用小括号包裹

```html
<!-- 正例 -->
<MyComponent variant="long body" foo="bar">
  <MyChild />
</MyComponent>

<!-- 正例 - 单行无需括号 -->
<MyComponent>{body}</MyComponent>
```

## 标签使用规范

### 1. 自闭合标签

无子元素的标签需写成自闭合标签

```html
<!-- 反例 -->
<Foo variant="stuff"></Foo>

<!-- 正例 -->
<Foo variant="stuff" />
```

### 2. 标签属性换行

- 标签名和它的属性可以写在一行，前提是不超过单行最大 100 字符
- 如果标签有多个属性，且存在换行，则每个属性都需要换行独占一行
- 结束标签需另起一行

```html
<!-- 反例 -->
<Foo superLongParam="bar" anotherSuperLongParam="baz" />

<!-- 正例 -->
<Foo superLongParam="bar" anotherSuperLongParam="baz" />
```

### 3. 禁止 dangerouslySetInnerHTML 与 children 共用

```html
<!-- 反例 -->
<div dangerouslySetInnerHTML={{ __html: "HTML" }}>
  Children
</div>

<!-- 正例 -->
<div dangerouslySetInnerHTML={{ __html: "HTML" }} />
```

### 4. HTML 自闭标签不能有子节点

```html
<!-- 反例 -->
<br>Children</br>

<!-- 正例 -->
<div>Children</div>
```

### 5. 不要使用危险属性

```html
<!-- 反例 -->
<div dangerouslySetInnerHTML={{ __html: "Hello World" }}></div>;

<!-- 正例 -->
<div>Hello World</div>;
```

### 6. 文本节点中不要使用注释字符串

```html
<!-- 反例 -->
<div>// empty div</div>

<!-- 正例 -->
<div>{/* empty div */}</div>
```

### 7. 标签中禁止出现无意义字符

```html
<!-- 正例 -->
<div>&gt;</div>
<div>{'>'}</div>
```

## 语义化标签

### 优先使用语义化标签

HTML5 中新增很多语义化标签，优先使用语义化标签，避免一个页面都是 div 或者 p 标签。

```html
<!-- 正例 -->
<header></header>
<nav></nav>
<main>
  <article>
    <section></section>
  </article>
  <aside></aside>
</main>
<footer></footer>

<!-- 反例 -->
<div>
  <div></div>
  <div></div>
</div>
```

## 属性规范

### 1. 属性名采用驼峰式命名法

```html
<!-- 反例 -->
<Foo UserName="hello" phone_number="{12345678}" />

<!-- 正例 -->
<Foo userName="hello" phoneNumber="{12345678}" />
```

### 2. prop 值为 true 时，可以省略它的值

```html
<!-- 反例 -->
<Foo hidden="{true}" />

<!-- 正例 -->
<Foo hidden />
```

### 3. 不要声明重复的属性名

```html
<!-- 反例 -->
<Hello name="John" name="John" />

<!-- 正例 -->
<Hello firstname="John" lastname="Doe" />
```

### 4. style 的属性值必须是一个对象

```html
<!-- 反例 -->
<div style="color: 'red'" />

<!-- 正例 -->
<div style={{ color: "red" }} />
```

### 5. 不要单独使用 target='\_blank'

需配合 rel='noreferrer noopener'

```html
<!-- 反例 -->
<a target="_blank" href="http://example.com/"></a>

<!-- 正例 -->
<a target="_blank" rel="noopener noreferrer" href="http://example.com"></a>
```

### 6. 不要用数组的索引值作为 map 生成元素的 key

```html
<!-- 反例 -->
{todos.map((todo, index) =>
<Todo {...todo} key="{index}" />
)}

<!-- 正例 -->
{todos.map(todo => (
<Todo {...todo} key="{todo.id}" />
))}
```

### 7. 禁止将 children 作为属性名

```html
<!-- 反例 -->
<div children='Children' />
<MyComponent children={<AnotherComponent />} />

<!-- 正例 -->
<div>Children</div>
<MyComponent>Children</MyComponent>
```

## 性能优化

### 1. link 标签预处理

通过 link 标签的 rel 属性来提升渲染速度。

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//example.com" />

<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />

<!-- 预加载 -->
<link rel="preload" href="style.css" />

<!-- 预渲染 -->
<link rel="prerender" href="https://example.com" />
```

### 2. 异步加载非首屏 CSS

将首屏关键 CSS 内联后，剩余的非首屏 CSS 内容使用外部 CSS，并且异步加载。

### 3. 图片优化

- 大图片应进行压缩
- 使用合适的图片格式（WebP、SVG）
- 图片应懒加载

```html
<!-- 正例 - 懒加载 -->
<img loading="lazy" src="image.jpg" alt="..." />

<!-- 正例 - 使用 WebP -->
<picture>
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="..." />
</picture>
```

### 4. 使用 CDN

非首屏资源应合理使用 CDN。

## 安全规范

### 1. XSS 防范

- 避免使用 v-html、dangerouslySetInnerHTML
- 用户输入的内容需要进行转义处理

### 2. a 标签安全

- 使用 target='\_blank' 时必须添加 rel="noopener noreferrer"

## 可访问性（a11y）

### 1. alt 属性

图片必须添加 alt 属性

```html
<!-- 正例 -->
<img src="photo.jpg" alt="产品图片" />

<!-- 装饰性图片 -->
<img src="decorative.png" alt="" />
```

### 2. 表单关联

- label 必须与 input 关联

```html
<!-- 正例 -->
<label for="username">用户名：</label>
<input id="username" type="text" />

<!-- 或包裹关联 -->
<label>用户名：<input type="text" /></label>
```

### 3. 按钮类型

- 提交按钮应明确指定 type

```html
<!-- 正例 -->
<button type="submit">提交</button>
<button type="button">普通按钮</button>
<button type="reset">重置</button>
```

## SEO 规范

### 1. title 标签

每个页面必须有唯一的 title 标签。

```html
<head>
  <title>页面标题 - 网站名称</title>
</head>
```

### 2. meta 标签

```html
<head>
  <meta charset="UTF-8" />
  <meta name="description" content="页面描述" />
  <meta name="keywords" content="关键词1, 关键词2" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
```

### 3. 语义化结构

- 使用 header、nav、main、article、section、aside、footer
- 合理使用 h1-h6 标签

## HTML 文件结构

### 1. 文件样板

```html
<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1"
    />
    <title>My Site - There are a lot of fun!</title>
    <meta
      name="description"
      content="web front-end coding and engineering specification"
    />
    <meta
      name="keyword"
      content="code,html,css,javascript,typescript,react,node"
    />
    <link rel="stylesheet" href="index.css" />
  </head>
  <body>
    <div id="root"></div>
    <script src="./index.js"></script>
  </body>
</html>
```

### 2. DOCTYPE 规范

- 文档开头必须有 doctype
- 必须使用 HTML5 小写 doctype

```html
<!-- 正确 -->
<!doctype html>
<html lang="zh-CN"></html>

<!-- 错误 - XHTML doctype -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" ...>

<!-- 错误 - 大写 doctype -->
<!DOCTYPE html>
```

### 3. html 元素规范

- 必须有且仅有一个位于顶层的 html 元素
- 必须有 lang 属性
- 内容必须有且仅有一个 head 和一个 body

```html
<!-- 正确 -->
<!doctype html>
<html lang="zh-CN">
  <head>
    ...
  </head>
  <body>
    ...
  </body>
</html>
```

lang 属性格式：语言-地区，如 en-US, zh-CN

```html
<!-- 正确 -->
<html lang="zh-CN"></html>

<!-- 错误 - 大小写错误 -->
<html lang="zh-cn"></html>

<!-- 错误 - 使用下划线 -->
<html lang="zh_CN"></html>
```

### 4. meta 元素规范

- meta 元素必须包含在 head 元素内
- 必须使用 UTF-8 字符编码

```html
<head>
  <meta charset="utf-8" />
</head>
```

### 5. viewport 响应式设置

```html
<!-- 标准响应式 -->
<meta name="viewport" content="width=device-width, initial-scale=1" />

<!-- 禁用缩放 -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, minimum-scale=1"
/>

<!-- 禁用所有缩放手势 -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, user-scalable=no"
/>
```

## 资源加载规范

### 1. CSS 和 JavaScript 引入

引入 CSS 和 JavaScript 时无需指定 type。

```html
<!-- 反例 -->
<link type="text/css" rel="stylesheet" href="example.css" />
<script type="text/javascript" src="example.js"></script>

<!-- 正例 -->
<link rel="stylesheet" href="example.css" />
<script src="example.js"></script>
```

### 2. CSS 和 JS 放置位置

- 在 head 标签内引入 CSS
- 在 body 结束标签前引入 JS

```html
<!-- 正例 -->
<head>
  <link rel="stylesheet" href="example.css" />
</head>
<body>
  ...
  <script src="path/to/my/script.js"></script>
</body>
```

### 3. 外部资源协议

外部资源的引用地址跟随页面协议，省略协议部分。

```html
<link rel="stylesheet" href="//g.alicdn.com/lib/style/index-min.css" />
```

### 4. preload 预加载

使用 preload 预加载关键资源。

```html
<link rel="preload" href="style.css" as="style" />
<link rel="preload" href="main.js" as="script" />
```

### 5. DNS 预解析

使用 dns-prefetch 和 preconnect 处理 DNS 解析延迟问题。

```html
<link rel="preconnect" href="https://fonts.googleapis.com/" crossorigin />
<link rel="dns-prefetch" href="https://fonts.googleapis.com/" />
```

## 编码规范

### 1. 缩进

统一使用 2 个空格缩进，不要使用 4 个空格或 tab 缩进。

```html
<!doctype html>
<html>
  <head>
    <title>Page title</title>
  </head>
  <body>
    <img src="images/company-logo.png" alt="Company" />
    <h1 class="hello-world">Hello, world!</h1>
  </body>
</html>
```

### 2. 注释规范

- HTML 注释代码中，不允许出现任何敏感信息（业务规则、员工隐私、AK、密码、内网 IP 等）
- 单行注释，需在注释内容和注释符之间需留有一个空格
- 多行注释，注释符单独占一行，注释内容 2 个空格缩进

```html
<!-- 单行注释 -->

<!--
  多行注释
  多行注释
-->
```

### 3. 标签规范

- 标签名统一使用小写
- 不要省略自闭合标签结尾处的斜线，且斜线前需留有一个空格

```html
<!-- 反例 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<img src="images/foo.png" alt="foo" />

<!-- 正例 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<img src="images/foo.png" alt="foo" />
```

### 4. 属性规范

- 属性值使用双引号，不要使用单引号
- 不要为 Boolean 属性添加取值

```html
<!-- 反例 -->
<input type="text" disabled="disabled" />
<input type="checkbox" value="1" checked="checked" />

<!-- 正例 -->
<input type="text" disabled />
<input type="checkbox" value="1" checked />
```

- 自定义属性的命名以 data- 为前缀

```html
<!-- 反例 -->
<a modal="toggle" href="#">Example link</a>

<!-- 正例 -->
<a data-modal="toggle" href="#">Example link</a>
```

## 模板语言规范（以 Nunjucks 为例）

### 1. 变量、过滤器和关键字必须有前后空格

```html
{# 错误，没有空格 #} {{username}} {{tags|join(',')}} {# 正确 #} {{ username }}
{{ tags | join(',') }}
```

### 2. 未过滤的用户输入必须 HTML 转义

```html
{# 错误 #}
<p>{{ description }}</p>
<script>
  window.user = {{ user | dump }}
</script>

{# 正确 #} {{ description | escaped }}
<script>
  window.user = {{ user | dump | escaped }}
</script>
```

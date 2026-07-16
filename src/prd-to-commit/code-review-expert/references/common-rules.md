# 通用代码规范检查项

以下规范适用于所有前端项目，不区分框架。

## 代码质量

### 1. 避免冗余代码

- 删除未使用的变量、函数、import
- 删除注释掉的代码
- 删除调试用的 console 语句

### 2. 函数职责单一

- 每个函数只做一件事
- 避免过长的函数，适当拆分

### 3. 避免重复代码

- 重复的逻辑应提取为公共方法
- 重复的样式应提取为公共 CSS

### 4. 硬编码问题

- 字符串应提取为常量或配置
- 魔法数字应定义常量

### 5. 注释规范

- 复杂业务逻辑需要注释
- 公共方法需要注释参数和返回值

## 安全规范

### 1. XSS 防范

- 用户输入的内容需要进行转义处理
- 避免使用 innerHTML、v-html 等直接渲染 HTML

### 2. 敏感信息

- 禁止在代码中硬编码密钥、密码、token 等敏感信息
- 敏感信息应通过环境变量或后端接口获取

## 性能规范

### 1. 请求优化

- 避免重复请求，对于相同参数应有缓存机制
- 大量数据应分页加载
- 非关键接口应异步加载

### 2. 图片优化

- 大图片应进行压缩
- 使用合适的图片格式（WebP、SVG）
- 图片应懒加载

### 3. 资源加载

- 非首屏资源应懒加载
- 合理使用 CDN

## Git 提交规范

### 1. 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

type 类型：

- feat: 新功能
- fix: Bug 修复
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试
- chore: 构建/工具链

### 2. 提交粒度

- 每次提交只做一件事
- 提交信息应清晰描述变更内容

## 目录结构规范

### 1. 目录命名

- 使用小写字母
- 多个单词用中划线分隔（如：user-center）
- 目录名应表达语义

### 2. 文件命名

- 组件文件：PascalCase（如：UserCenter.vue）
- 工具文件：kebab-case（如：format-date.ts）
- 配置文件：kebab-case（如：vite.config.ts）

### 3. 目录结构一致性

- 同类型文件放同一目录
- 遵循项目已有的目录结构风格

## 项目与目录命名规范

### 1. 项目命名

全部采用小写方式，以中划线分隔。

```text
// 正例
mall-management-system

// 反例
mall_management-system / mallManagementSystem
```

### 2. 目录命名

全部采用小写方式，以中划线分隔，有复数结构时，要采用复数命名法，缩写不用复数。

```text
// 正例
scripts / styles / components / images / utils / layouts / demo-styles / demo-scripts / img / doc

// 反例
script / style / demo_scripts / demoStyles / imgs / docs
```

### 3. 命名严谨性

代码中的命名严禁使用拼音与英文混合的方式，更不允许直接使用中文的方式。

```javascript
// 正例
henan / luoyang / rmb 等国际通用的名称，可视同英文

// 反例
DaZhePromotion [打折] / getPingfenByName() [评分] / int 某变量 = 3
```

**杜绝完全不规范的缩写**，避免望文不知义：

```javascript
// 反例
AbstractClass"缩写"命名成 AbsClass
condition"缩写"命名成 condi
```

## HTML 规范

### 1. 标签规范

- 自闭合（self-closing）标签，无需闭合（例如：img input br hr 等）
- 可选的闭合标签（closing tag），需闭合（例如：</li> 或 </li>）
- 尽量减少标签数量

### 2. 格式规范

- 将每个块元素、列表元素或表格元素都放在新行
- inline 元素视情况换行，以长度不超过编辑器一屏为宜
- 每个子元素都需要相对其父级缩进

### 3. 语义化标签

HTML5 中新增很多语义化标签，所以优先使用语义化标签，避免一个页面都是 div 或者 p 标签。

```html
<!-- 正例 -->
<header></header>
<footer></footer>

<!-- 反例 -->
<div>
  <p></p>
</div>
```

## CSS & LESS & SCSS 规范

### 1. 命名规范

- 类名使用小写字母，以中划线分隔
- id 采用驼峰式命名
- scss 中的变量、函数、混合、placeholder 采用驼峰式命名
- ID 和 class 的名称总是使用可以反应元素目的和用途的名称，或其他通用的名称，代替表象和晦涩难懂的名称

```css
/* 正例 */
.heavy {
  font-weight: 800;
}
.important {
  color: red;
}

/* 反例 */
.fw-800 {
  font-weight: 800;
}
.red {
  color: red;
}
```

### 2. 选择器规范

1. CSS 选择器中避免使用标签名。从结构、表现、行为分离的原则来看，应该尽量避免 CSS 中出现 HTML 标签。

2. 很多前端开发人员写选择器链的时候不使用"直接子选择器"，应该总是考虑直接子选择器。

```css
/* 正例 */
.content > .title {
  font-size: 2rem;
}

/* 反例 */
.content .title {
  font-size: 2rem;
}
```

### 3. 缩写属性

```css
/* 正例 */
border-top: 0;
font:
  100%/1.6 palatino,
  georgia,
  serif;
padding: 0 1em 2em;

/* 反例 */
border-top-style: none;
font-family: palatino, georgia, serif;
font-size: 100%;
line-height: 1.6;
padding-bottom: 2em;
padding-left: 1em;
padding-right: 1em;
padding-top: 0;
```

### 4. 选择器与属性格式

每个选择器及属性独占一行：

```css
/* 正例 */
button {
  width: 100px;
  height: 50px;
  color: #fff;
  background: #00a0e9;
}

/* 反例 */
button {
  width: 100px;
  height: 50px;
  color: #fff;
  background: #00a0e9;
}
```

### 5. 省略 0 后面的单位

```css
/* 正例 */
div {
  padding-bottom: 0;
  margin: 0;
}

/* 反例 */
div {
  padding-bottom: 0px;
  margin: 0em;
}
```

### 6. 避免使用 ID 选择器及全局标签选择器

```css
/* 正例 */
.header {
  padding-bottom: 0px;
  margin: 0em;
}

/* 反例 */
#header {
  padding-bottom: 0px;
  margin: 0em;
}
```

### 7. 代码组织

1. 将公共 less 文件放置在 style/less/common 文件夹

2. 按以下顺序组织：

```less
@import;
变量声明;
样式声明;
```

### 8. 避免嵌套层级过多

将嵌套深度限制在 3 级。对于超过 4 级的嵌套，给予重新评估。

```css
/* 正例 */
.main-title {
  .name {
    color: #fff;
  }
}

/* 反例 */
.main {
  .title {
    .name {
      color: #fff;
    }
  }
}
```

## JavaScript 规范

### 1. 命名规范

采用小写驼峰命名 lowerCamelCase，代码中的命名均不能以下划线，也不能以下划线或美元符号结束。

```javascript
// 反例
_name / name_ / name$;
```

方法名、参数名、成员变量、局部变量都统一使用 lowerCamelCase 风格，必须遵从驼峰形式。

```javascript
// 正例
localValue / getHttpMessage() / inputUserId;
```

其中 method 方法命名必须是**动词**或者**动词+名词**形式：

```javascript
// 正例
saveShopCarData / openShopCarInfoDialog;

// 反例
save / open / show / go;
```

**增删查改，详情统一使用如下 5 个单词**，不得使用其他：

```
add / update / delete / detail / get
```

### 2. 常量命名

常量命名全部大写，单词间用下划线隔开，力求语义表达完整清楚。

```javascript
// 正例
MAX_STOCK_COUNT;

// 反例
MAX_COUNT;
```

### 3. 字符串

统一使用单引号(')，不使用双引号(")。

```javascript
// 正例
let str = "foo";
let testDiv = '<div id="test"></div>';

// 反例
let str = "foo";
let testDiv = "<div id='test'></div>";
```

### 4. 对象声明

使用字面值创建对象：

```javascript
// 正例
let user = {};

// 反例
let user = new Object();
```

使用字面量来代替对象构造器：

```javascript
// 正例
var user = {
  age: 0,
  name: 1,
  city: 3,
};

// 反例
var user = new Object();
user.age = 0;
user.name = 0;
user.city = 0;
```

### 5. undefined 判断

永远不要直接使用 undefined 进行变量判断；使用 typeof 和字符串'undefined'对变量进行判断。

```javascript
// 正例
if (typeof person === "undefined") {
  // ...
}

// 反例
if (person === undefined) {
  // ...
}
```

### 6. 慎用 console.log

因 console.log 大量使用会有性能问题，所以在非 webpack 项目中谨慎使用 log 功能。

## HTML 性能优化

### link 标签：通过预处理提升渲染速度

在我们对大型单页应用进行性能优化时，也许会用到按需懒加载的方式，来加载对应的模块，但如果能合理利用 link 标签的 rel 属性值来进行预加载，就能进一步提升渲染速度。

1. **dns-prefetch**：当 link 标签的 rel 属性值为"dns-prefetch"时，浏览器会对某个域名预先进行 DNS 解析并缓存。这样，当浏览器在请求同域名资源的时候，能省去从域名查询 IP 的过程。

2. **preconnect**：让浏览器在一个 HTTP 请求正式发给服务器前预先执行一些操作，这包括 DNS 解析、TLS 协商、TCP 握手，通过消除往返延迟来为用户节省时间。

3. **prefetch/preload**：两个值都是让浏览器预先下载并缓存某个资源，但不同的是，prefetch 可能会在浏览器忙时被忽略，而 preload 则是一定会被预先下载。

4. **prerender**：浏览器不仅会加载资源，还会解析执行页面，进行预渲染。

```html
<link rel="dns-prefetch" href="//example.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preload" href="style.css" />
```

## CSS 性能优化

### 1. 异步加载非首屏 CSS

由于 CSS 会阻塞 DOM 的渲染，所以我们将首屏关键 CSS 内联后，剩余的非首屏 CSS 内容可以使用外部 CSS，并且异步加载，防止非首屏 CSS 内容阻塞页面的渲染。

### 2. CSS 文件压缩

通过压缩 CSS 文件大小来提高页面加载速度。压缩后的文件能够明显减小，可以大大降低了浏览器的加载时间。

### 3. CSS 层级嵌套最好不要超过 3 层

一般情况下，元素的嵌套层级不能超过 3 级，过度的嵌套会导致代码变得臃肿、沉余、复杂，导致 CSS 文件体积变大，造成性能浪费，影响渲染的速度。

### 4. 删除无用 CSS 代码

一般情况下，会存在这两种无用的 CSS 代码：

- 各种情况下的重复代码
- 整个页面内没有生效的 CSS 代码

## JavaScript 性能优化

### 1. 尽量使用原生方法

### 2. switch 语句相对 if 较快

通过将 case 语句按照最可能到最不可能的顺序进行组织。

```javascript
// 正例
switch (value) {
  case "likely":
    // ...
    break;
  case "unlikely":
    // ...
    break;
}
```

### 3. 避免全局查找

在一个函数中会用到全局对象存储为局部变量来减少全局查找，因为访问局部变量的速度要比访问全局变量的速度更快些。

```javascript
// 正例
function() {
  var local = window;
  console.log(local.document.body);
}

// 反例
function() {
  console.log(window.document.body);
}
```

### 4. 循环遍历变量的最快方法（for > forEach > map）

在运行循环的所有方式中，for 循环是最快的方式，比 forEach 快了 10 倍，在对于大型数组时，最好使用 for 循环。

```javascript
// 最快
for (let i = 0; i < arr.length; i++) {
  // ...
}

// 较快
arr.forEach((item) => {
  // ...
});

// 较慢
arr.map((item) => {
  // ...
});
```

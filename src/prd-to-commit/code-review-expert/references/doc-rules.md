# 文档通用规约

## 空格规范

### 1. 中英文之间需要增加空格

```markdown
<!-- 反例 -->

HTML定义网页的结构与内容，CSS定义其格式与样式，而JavaScript则为网页增加可交互性，创作功能丰富的Web应用。

<!-- 正例 -->

HTML 定义网页的结构与内容，CSS 定义其格式与样式，而 JavaScript 则为网页增加可交互性，创作功能丰富的 Web 应用。
```

### 2. 中英文与数字之间需要增加空格

```markdown
<!-- 反例 -->

截至2012年，所有的现代浏览器都完整的支持 ECMAScript5.1，旧版本的浏览器至少支持 ECMAScript3 标准。

<!-- 正例 -->

截至 2012 年，所有的现代浏览器都完整的支持 ECMAScript 5.1，旧版本的浏览器至少支持 ECMAScript 3 标准。
```

### 3. 全角标点与其他字符之间不加空格

```markdown
<!-- 反例 -->

不像 UDP， HTTP 是一个不会静默丢失消息的协议。

<!-- 正例 -->

不像 UDP，HTTP 是一个不会静默丢失消息的协议。
```

### 4. 半角标点与其他字符之间需要增加空格

```markdown
<!-- 反例 -->

Cookie 主要用于以下三个方面：1.会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）2.个性化设置（如用户自定义设置、主题等）3.浏览器行为跟踪（如跟踪分析用户行为等）

<!-- 正例 -->

Cookie 主要用于以下三个方面：

1. 会话状态管理（如用户登录状态、购物车、游戏分数或其它需要记录的信息）
2. 个性化设置（如用户自定义设置、主题等）
3. 浏览器行为跟踪（如跟踪分析用户行为等）

<!-- 反例 -->

我+你=世界。

<!-- 正例 -->

我 + 你 = 世界。
```

### 5. 链接文字前后不需要增加空格

```markdown
<!-- 反例 -->

[了解更多](https://developer.mozilla.org/zh-CN/docs/Web) 开发技术相关知识。

<!-- 正例 -->

[了解更多](https://developer.mozilla.org/zh-CN/docs/Web)开发技术相关知识。
```

## 标点符号规范

### 1. 正确使用引号

中文句子内夹用英文句子时，该英文句子用中文双引号标示，保留英文句子内部的英文标点符号，句末使用中文标点。

```markdown
<!-- 反例 - 英文句子不建议使用英文引号标示 -->

他写的是 "Hello, world!"。

<!-- 反例 - 英文句子不建议使用中文单引号标示 -->

他写的是'Hello, world!'。

<!-- 反例 - 英文句子内部的标点符号建议保留英文标点符号 -->

他写的是"Hello，world！"。

<!-- 正例 -->

他写的是"Hello, world!"。
```

### 2. 正确使用省略号

中文省略号的形式为"……"（中文输入法下 SHIFT + 6），6 个居中小圆点；英文省略号的形式为"…"，3 个齐线小圆点。

夹用英文的中文句子里，英文内部的省略使用英文省略号；中文内部的省略使用中文省略号。

```markdown
<!-- 反例 -->

省略号是 3 个小圆点...
省略号是 6 个齐线小圆点......
省略号是 6 个句号。。。。。。

<!-- 正例 -->

省略号是 6 个居中小圆点，占两个全角空格……
```

### 3. 正确使用破折号

中文破折号的形式为"——"，长度相当于两个汉字的长度。

```markdown
<!-- 反例 - 破折号不推荐使用两个中横线 -->

第三方框架和库--用来快速构建网站和应用。

<!-- 正例 -->

第三方框架和库——用来快速构建网站和应用。
```

## 全角和半角规范

### 1. 中文标点符号使用全角

```markdown
<!-- 反例 - 中文句子冒号未使用全角 -->

前端框架: React、Vue、Angular。

<!-- 反例 - 中文句子内夹用并列的英文单词时未使用顿号分隔 -->

前端框架：React, Vue, Angular。

<!-- 正例 -->

前端框架：React、Vue、Angular。

<!-- 反例 - 中文句子括号未使用全角 -->

至少熟悉一门非前端的语言(如 Java、PHP、C、C++、Python、Ruby)，并有实践经验！

<!-- 正例 -->

至少熟悉一门非前端的语言（如 Java、PHP、C、C++、Python、Ruby），并有实践经验！
```

### 2. 英文和数字使用半角

```markdown
<!-- 反例 - 英文和数字不应该使用全角 -->

该版本正式名称为 ＥＣＭＡＳｃｒｉｐｔ 2015，但通常被称为 ＥＣＭＡＳｃｒｉｐｔ 6 或者 ＥＳ6。

<!-- 正例 -->

该版本正式名称为 ECMAScript 2015，但通常被称为 ECMAScript 6 或者 ES6。
```

### 3. 完整的英文整句和特殊名词使用半角标点

```markdown
<!-- 反例 -->

乔布斯那句话是怎么说的？「Stay hungry，stay foolish。」
推荐你阅读《Hackers＆Painters：Big Ideas from the Computer Age》，非常的有趣。

<!-- 正例 -->

乔布斯那句话是怎么说的？「Stay hungry, stay foolish.」
推荐你阅读《Hackers & Painters: Big Ideas from the Computer Age》，非常的有趣。
```

## 名词规范

### 1. 正确地拼写英文专有词汇

```markdown
<!-- 反例 -->

我们需要一位熟悉 Js、h5，至少理解一种框架（如 backbone、angular、RJS 等）的 FED。

<!-- 正例 -->

我们需要一位熟悉 JavaScript、HTML5，至少理解一种框架（如 Backbone.js、AngularJS、React 等）的前端开发者。
```

### 2. 常用专有名词拼写

**前端技术：**

- HTML, CSS, JavaScript/JS, AJAX, JSON, DOM, BOM, Less, HTTP, HTTPS, WebSocket
- ECMAScript, ECMAScript 2015, ECMAScript 6, ES6, ES2015

**前端库/框架：**

- jQuery, jQuery UI, jQuery Mobile, YUI, Zepto, Dojo
- React, React Native, Bootstrap, RequireJS, Sea.js, AngularJS, Backbone.js

**构建工具：**

- Gulp, Grunt, webpack, Yeoman, npm, spm, Babel

**测试框架：**

- Mocha, Jasmine, Should.js

**后端/数据库：**

- PHP, Java, Node.js
- MySQL, MongoDB, Redis

**服务器：**

- Apache, Nginx

**代码托管：**

- GitHub, GitLab, GitCafe

**浏览器：**

- Chrome, Firefox, Safari, Internet Explorer/IE, IE 7, Opera, UC

**操作系统：**

- Android, iOS, Windows, OS X, Ubuntu, Linux, Debian
- PC, Mobile, H5

**设备：**

- MacBook, MacBook Pro, MacBook Air, iMac, Mac Pro, Mac mini
- iPad Air, iPad Air 2, iPad mini, iPhone, iPhone 6s, iPhone 6s Plus, Apple Watch

**公司：**

- Alibaba, Taobao, Google, Alphabet, Apple, Microsoft, Yahoo

**其他：**

- FPS, UI, URL, URI, URLs, URIs

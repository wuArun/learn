# CSS 规范检查项

## 编码风格

### 1. 分号结尾

所有声明都应该以分号结尾，不能省略。

```css
/* 反例 */
.selector {
  margin-top: 10px;
  padding-left: 15px;
}

/* 正例 */
.selector {
  margin-top: 10px;
  padding-left: 15px;
}
```

### 2. 缩进

使用 2 个空格缩进，不要使用 4 个空格或 tab 缩进。

```css
/* 反例 */
.selector {
  padding-left: 15px;
}

/* 正例 */
.selector {
  padding-left: 15px;
}
```

### 3. 选择器和花括号空格

选择器和 { 之间保留一个空格。

```css
/* 反例 */
.selector {
  padding-left: 15px;
}

/* 正例 */
.selector {
  padding-left: 15px;
}
```

### 4. 属性名空格

属性名和 : 之前无空格，: 和属性值之间保留一个空格。

```css
/* 反例 */
.selector {
  margin-top: 10px;
  padding-left: 15px;
}

/* 正例 */
.selector {
  margin-top: 10px;
  padding-left: 15px;
}
```

### 5. 组合器空格

> 、+、~、|| 等组合器前后各保留一个空格。

```css
/* 反例 */
.selector > .children {
  padding-left: 15px;
}
.selector + .brother {
  padding-left: 15px;
}

/* 正例 */
.selector > .children {
  padding-left: 15px;
}
.selector + .brother {
  padding-left: 15px;
}
```

### 6. 逗号空格

在使用 , 分隔的属性值中，, 之后保留一个空格。

```css
/* 反例 */
.selector {
  background-color: rgba(0, 0, 0, 0.5);
  box-shadow:
    0px 1px 2px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

/* 正例 */
.selector {
  background-color: rgba(0, 0, 0, 0.5);
  box-shadow:
    0px 1px 2px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}
```

### 7. 注释空格

注释内容和注释符之间留有一个空格。

```css
/* 反例 */
.selector {
  /*comment*/
  /*  comment  */
  /**
   *comment
   */
  padding-left: 15px;
}

/* 正例 */
.selector {
  /* comment */
  /**
   * comment
   */
  padding-left: 15px;
}
```

### 8. 右花括号

声明块的右大括号 } 应单独成行。

```css
/* 反例 */
.selector {
  padding-left: 15px;
}

/* 正例 */
.selector {
  padding-left: 15px;
}
```

### 9. 单行声明

属性声明应单独成行，每个选择器也建议单独成行。

```css
/* 反例 */
.selector {
  padding-left: 15px;
  margin-left: 10px;
}

/* 正例 */
.selector {
  padding-left: 15px;
  margin-left: 10px;
}

/* 多选择器时每个单独成行 */
.selector,
.selector-secondary,
.selector-third {
  padding: 15px;
}
```

### 10. 代码行长度

单行代码最多不要超过 100 个字符。

```css
/* 反例 */
background-image: -webkit-gradient(
  linear,
  left bottom,
  left top,
  color-stop(0.04, rgb(88, 94, 124)),
  color-stop(0.52, rgb(115, 123, 162))
);

/* 正例 */
background-image: -webkit-gradient(
  linear,
  left bottom,
  left top,
  color-stop(0.04, rgb(88, 94, 124)),
  color-stop(0.52, rgb(115, 123, 162))
);
```

### 11. 单行也需多行格式

声明块内只有一条语句时，也应该写成多行。

```css
/* 反例 */
.selector {
  padding-left: 15px;
}

/* 正例 */
.selector {
  padding-left: 15px;
}
```

## 选择器规范

### 1. 避免使用 ID 选择器

id 会带来过高的选择器优先级，使得后续很难进行样式覆盖。

```css
/* 反例 */
#special {
  padding: 15px;
}

/* 正例 */
.normal.special {
  padding: 15px;
}
```

### 2. 属性选择器引号

属性选择器的值始终用双引号包裹。

```css
/* 反例 */
input[type="text"] {
  height: 20px;
}

/* 正例 */
input[type="text"] {
  height: 20px;
}
```

### 3. 选择器性能

CSS 选择器从高（高效率）到低（低效率）的顺序是：

1. ID 选择器（#header）
2. 类选择器（.header）
3. 标签（元素）选择器（div）
4. 相邻兄弟选择器（h2 + p）
5. 子选择器（ul > li）
6. 后代选择器（ul a）
7. 通配符选择器（\*）
8. 属性选择器（[class^="grid-"]）
9. 伪类/伪元素选择器（a:hover、a::before）

- 使用 class 而不是原生元素标签
- 减少在经常出现的组件中使用个别属性选择器
- 控制选择器的长度，每个组合选择器内的条目尽量不超过 3 个

## 属性和属性值规范

### 1. 十六进制值

使用尽可能短的十六进制值。

```css
/* 反例 */
.selector {
  color: #ffffff;
}

/* 正例 */
.selector {
  color: #fff;
}
```

### 2. 十六进制大小写

十六进制值统一使用小写字母。

```css
/* 反例 */
.selector {
  color: #fefefe;
}

/* 正例 */
.selector {
  color: #fefefe;
}
```

### 3. 零值单位

长度值为 0 时，省略掉长度单位。

```css
/* 反例 */
.selector {
  margin-top: 0px;
  font-size: 0em;
}

/* 正例 */
.selector {
  margin-top: 0;
  font-size: 0;
}
```

### 4. 小数点前的零

保留小数点前的 0。

```css
/* 反例 */
.selector {
  opacity: 0.5;
  left: -0.5px;
}

/* 正例 */
.selector {
  opacity: 0.5;
  left: -0.5px;
}
```

### 5. 属性声明顺序

相关联的属性声明最好写成一组，并按如下顺序排序：

1. **定位**：position、left、right、top、bottom、z-index
2. **盒模型**：display、float、width、height、margin、padding、border
3. **文字排版**：font、color、line-height、text-align
4. **外观**：background
5. **其他**

```css
.declaration-order {
  /* 定位 */
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;

  /* 盒模型 */
  display: block;
  float: right;
  width: 100px;
  height: 100px;
  border: 1px solid #e5e5e5;

  /* 排版 */
  font:
    normal 13px "Helvetica Neue",
    sans-serif;
  line-height: 1.5;
  color: #333;
  text-align: center;

  /* 外观 */
  background-color: #f5f5f5;

  /* 其他 */
  opacity: 1;
}
```

### 6. 简写属性

适时使用简写属性，但只有真正需要设置所有值或大多数值时才使用简写属性。

```css
/* 反例 */
.selector {
  margin: 0 0 10px;
}

/* 正例 */
.selector {
  margin-bottom: 10px;
}
```

### 7. 避免 !important

不要使用 !important 重写样式。

### 8. 避免 @import

不要使用 CSS 的 @import，与 <link> 相比性能更差。

```css
/* 反例 */
<style>
  @import url("more.css");
</style>

/* 正例 */
<link rel="stylesheet" href="more.css">
```

## Sass / Less 规范

### 1. 四则运算符空格

四则运算符两侧各保留一个空格。

```less
/* 反例 */
.selector {
  width: $default-width/2;
}

/* 正例 */
.selector {
  width: $default-width / 2;
}
```

### 2. Mixin 命名和参数

Mixin 名称和括号 () 间无空格，参数中 , 之前无空格，, 之后保留一个空格。

```less
/* 反例 */
.selector {
  .size(30px,20px);
  .clearfix ();
}

/* 正例 */
.selector {
  .size(30px, 20px);
  .clearfix();
}
```

### 3. 代码组织顺序

按如下顺序组织 Sass / Less 代码：

1. @import 语句
2. 全局变量声明
3. 样式声明

```scss
@import "common/theme.scss";

$color-red: #f0f0f0;

.selector {
  color: $color-red;
}
```

### 4. 块内属性顺序

块内的属性声明按如下顺序排序：

1. 标准属性声明
2. mixin 调用
3. 嵌套的子级选择器

```scss
.btn {
  background: #ccc;
  font-weight: bold;
  @include transition(background 0.5s ease);

  .icon {
    margin-right: 10px;
  }
}
```

### 5. 嵌套层级限制

嵌套选择器的深度不要超过 3 层。

```scss
/* 反例 */
.container {
  .header {
    .user-name {
      // STOP！不要再嵌套更深选择器
    }
  }
}
```

### 6. 注释使用

可以使用双斜杠注释。但编译为 CSS 后，代码中的双斜杠注释会被删除，而 /\* \*/ 会被保留。

```scss
// 单行注释
.selector-a {
  padding-left: 15px;
}

/*
 * 多行注释
 * 多行注释
 */
.selector-b {
  margin-left: 15px;
}
```

### 7. Mixin vs Extend

使用 Mixin（@mixin 和 @include 指令）来让代码遵循 DRY 原则。应避免使用 @extend 指令，它不够直观且具有潜在风险。

## 性能优化

### 1. CSS 异步加载

由于 CSS 会阻塞 DOM 的渲染，将首屏关键 CSS 内联后，剩余的非首屏 CSS 内容使用外部 CSS，并且异步加载。

### 2. CSS 文件压缩

通过压缩 CSS 文件大小来提高页面加载速度。

### 3. CSS 层级嵌套

CSS 层级嵌套最好不要超过 3 层，过度的嵌套会导致代码变得臃肿。

### 4. 删除无用 CSS 代码

删除两种无用 CSS 代码：

- 重复的 CSS 代码
- 整个页面内没有生效的 CSS 代码

### 5. 避免全局标签选择器

避免使用 ID 选择器及全局标签选择器防止污染全局样式。

```css
/* 正例 */
.header {
  padding-bottom: 0;
  margin: 0;
}

/* 反例 */
#header {
  padding-bottom: 0;
  margin: 0;
}
```

## 安全规范

### 1. 避免内联样式

避免使用内联样式（style 属性），应使用 class 选择器。

### 2. 用户内容样式

如果页面需要展示用户生成的内容，确保正确设置 Content-Type 头，防止 CSS 注入攻击。

# 前端代码审查标准

本文件为前端审查的总纲，各子章节的详细检查项分布在各引用文件中，以下通过链接索引。

---

## 引用文件索引

| # | 引用文件 | 内容说明 | 适用文件 |
|---|---------|---------|---------|
| 1 | `common-rules.md` | **通用规范** — 代码质量、安全、性能、目录命名、Git提交 | 全部前端文件 |
| 2 | `ts-rules.md` | **TypeScript 规范** — 类型定义、泛型、枚举、断言、any禁止 | `.ts`、`.tsx` |
| 3 | `js-rules.md` | **JavaScript 规范** — 命名、字符串、对象、undefined判断 | `.js`、`.jsx` |
| 4 | `react-rules.md` | **React 规范** — 组件、JSX、Hooks、性能优化 | `.tsx`、`.jsx` |
| 5 | `html-rules.md` | **HTML/JSX 规范** — 标签、格式化、安全、语义化 | `.html`、`.tsx` |
| 6 | `css-rules.md` | **CSS 规范** — 编码风格、选择器、命名、属性 | `.css`、`.scss`、`.less` |

---

## 一、通用规范（common-rules.md）

**必须读取 `common-rules.md` 获取完整规范。**

### 1.1 代码质量
- 删除未使用的变量、函数、import
- 删除注释掉的代码
- 删除调试用的 `console` 语句（**高严重**）
- 每个函数只做一件事，避免过长函数
- 重复逻辑提取为公共方法，重复样式提取为公共 CSS
- 字符串提取为常量或配置，魔法数字定义常量
- 复杂业务逻辑需要注释，公共方法需要注释参数和返回值

### 1.2 安全
- 用户输入内容需转义处理
- 避免 `innerHTML`、`v-html` 直接渲染 HTML（**高严重**）
- **禁止硬编码密钥、密码、token**（**高严重**）
- 敏感信息通过环境变量或后端接口获取

### 1.3 性能
- 避免重复请求，相同参数应有缓存机制（**高严重**）
- 大量数据分页加载，非关键接口异步加载
- 图片懒加载，使用合适的格式（WebP、SVG）
- 非首屏资源懒加载

### 1.4 目录与文件命名
- 目录名小写，中划线分隔（`user-center`）
- 组件文件 PascalCase（`UserCenter.tsx`）
- 工具文件 kebab-case（`format-date.ts`）
- 配置文件 kebab-case（`vite.config.ts`）
- 项目命名全部小写，中划线分隔（`mall-management-system`）
- **禁止拼音与英文混合命名**，禁止中文命名（**高严重**）
- 杜绝不规范的缩写（`AbsClass`、`condi`）

### 1.5 Git 提交规范
- 提交格式：`<type>(<scope>): <subject>`
- type: feat / fix / docs / style / refactor / test / chore
- 每次提交只做一件事

---

## 二、TypeScript 规范（ts-rules.md）

**必须读取 `ts-rules.md` 获取完整规范。**

### 2.1 类型定义
- 所有函数参数、返回值必须有类型定义
- 优先使用 `interface` 定义对象类型（可 implements/extends）
- 使用 `type` 定义联合类型、元组、函数类型
- 使用泛型而非 `any`，为泛型提供 `extends` 约束

### 2.2 类型推断
- 变量声明有初始值时可省略类型标注
- 函数参数必须标注类型

### 2.3 泛型规范
- 优先使用泛型而不是 `any`
- 为泛型提供约束（`T extends { length: number }`）

### 2.4 null 和 undefined
- 使用 `?.` 和 `??` 处理 null/undefined
- 明确区分 null 和 undefined

### 2.5 枚举规范
- 优先使用 `const enum` 或 `对象 + as const`
- **避免数字枚举**（**中严重**）

### 2.6 类型断言
- 优先使用类型守卫（`value is Type`）
- 必须使用 `as` 语法，禁止 `<Type>` 尖括号语法

### 2.7 any 禁止使用
- **禁止使用 `any` 类型**（**高严重**）
- 使用 `unknown` 替代不确定类型
- 使用 `as const` 获取精确类型

---

## 三、JavaScript 规范（js-rules.md）

**必须读取 `js-rules.md` 获取完整规范。**

### 3.1 命名规范
- 变量、方法、参数采用 lowerCamelCase
- 常量 UPPER_SNAKE_CASE，语义完整
- 方法名必须是「动词」或「动词+名词」形式
- 增删查改统一：`add / update / delete / detail / get`
- **禁止拼音与英文混合**，禁止中文命名（**高严重**）

### 3.2 字符串规范
- 统一使用单引号 `'`，不使用双引号

### 3.3 对象声明
- 使用字面值创建对象（`{}`），禁止 `new Object()`
- 使用字面量代替对象构造器

### 3.4 undefined 判断
- 禁止直接使用 `undefined` 变量判断，使用 `typeof`

---

## 四、React 规范（react-rules.md）

**必须读取 `react-rules.md` 获取完整规范。**

### 4.1 基本规则
- 每个文件只包含一个 React 组件
- 文件扩展名 `.tsx` / `.jsx`，命名 PascalCase
- 组件引用 PascalCase，实例 camelCase
- 目录根组件使用 `index.tsx`，以目录名作为组件名

### 4.2 JSX 规范
- 属性名 camelCase
- 多行 JSX 用括号包裹
- 无子元素的标签写成自闭合
- JSX 属性使用双引号

### 4.3 Hooks 规范
- props 传递的函数用 `useCallback` 包裹
- 防抖等场景用 `useMemo`（获取最新 state）
- 避免不必要的 re-render（`React.memo`、`useMemo`、`useCallback`）

### 4.4 性能优化
- 大列表使用虚拟滚动
- 对象和数组的依赖避免直接使用字面量

---

## 五、HTML 规范（html-rules.md）

**必须读取 `html-rules.md` 获取完整规范。**

### 5.1 标签规范
- 自闭合标签无需闭合（`img`、`input`、`br`、`hr`）
- 可选的闭合标签需闭合
- 无子元素的标签写成自闭合

### 5.2 格式规范
- JSX 使用 2 个空格缩进
- 每个子元素相对父级缩进
- 块元素、列表元素、表格元素放在新行
- 单行代码不超过 100 个字符
- 多属性换行时每个属性独占一行

### 5.3 安全规范
- **禁止** `dangerouslySetInnerHTML`（**高严重**）
- `dangerouslySetInnerHTML` 与 `children` 禁止共用
- 禁止使用危险属性

### 5.4 语义化标签
- 优先使用 HTML5 语义化标签（`header`、`footer`、`nav`、`article`、`section`）

---

## 六、CSS 规范（css-rules.md）

**必须读取 `css-rules.md` 获取完整规范。**

### 6.1 编码风格
- 所有声明以分号结尾（不可省略）
- 使用 **2 个空格**缩进（禁止 4 个空格或 tab）
- 选择器和 `{` 之间保留一个空格
- 属性名和 `:` 之间无空格，`:` 和属性值之间保留一个空格
- 声明块的 `}` 单独成行
- 属性声明单独成行

### 6.2 选择器规范
- 组合器（`>`、`+`、`~`、`||`）前后各保留一个空格
- 多选择器时每个单独成行
- 避免过深的选择器嵌套（不超过 3 层）

### 6.3 命名规范
- 类名小写，中划线分隔
- ID 使用驼峰命名
- 避免使用 `!important`

### 6.4 属性规范
- 颜色值小写缩写（`#fff` 而非 `#FFFFFF`）
- 0 值不带单位（`margin: 0` 而非 `margin: 0px`）
- 单行代码不超过 100 个字符

---

## 常见问题模式

### 1. 前端 any 类型
```typescript
// 问题代码
const data: any = await api.getUser();

// 正确写法
interface UserResponse { name: string; }
const data: UserResponse = await api.getUser();
```

### 2. 前端 console 遗留
```typescript
// 问题代码
function handleClick() {
  console.log('button clicked', event);
}

// 正确写法：使用 logger 或在开发环境条件输出
```

### 3. 拼音命名
```javascript
// 问题代码
function getPingfenByName() { ... }
const DaZhePromotion = '打折';

// 正确写法
function getScoreByName() { ... }
const DiscountPromotion = '打折';
```

### 4. useCallback + debounce 错误
```tsx
// 问题代码 — useCallback 包裹 debounce 无法获取最新 state
const handleClick = useCallback(
  debounce(() => { setCount((c) => ++c); }, 1000),
  [],
);

// 正确写法 — useMemo 保证每次 render 更新防抖函数
const handleClick = useMemo(
  () => debounce(() => { setCount(count + 1); }, 1000),
  [count],
);
```
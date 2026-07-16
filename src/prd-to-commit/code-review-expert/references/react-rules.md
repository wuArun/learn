# React 规范检查项

## 基本规则

### 1. 每个文件只包含一个 React 组件

### 2. 使用 JSX 语法

### 3. 使用 class 基础写组件，少用 React.createClass

```javascript
// 正例
class Listing extends React.Component {
  render() {
    return <div />;
  }
}

// 反例
const Listing = React.createClass({
  render() {
    return <div />;
  },
});
```

### 4. 命名规范

- **扩展名**: 使用 jsx 作为 React 组件的扩展名
- **文件名**: 文件命名采用帕斯卡命名法，如：`ReservationCard.jsx`
- **引用名**: 组件引用采用帕斯卡命名法，其实例采用驼峰式命名法（eslint: react/jsx-pascal-case）

```javascript
// 反例
const reservationCard = require("./ReservationCard");

// 正例
const ReservationCard = require("./ReservationCard");

// 反例
const ReservationItem = <ReservationCard />;

// 正例
const reservationItem = <ReservationCard />;
```

**组件命名**: 使用文件名作为组件名。例如：`ReservationCard.jsx` 组件的引用名应该是 ReservationCard。然而，对于一个目录的根组件，应该使用 `index.jsx` 作为文件名，使用目录名作为组件名。

```javascript
// 反例
const Footer = require("./Footer/Footer.jsx");

// 反例
const Footer = require("./Footer/index.jsx");

// 正例
const Footer = require("./Footer");
```

### 5. 属性规范

属性名采用驼峰式命名法

```jsx
// 反例
<Foo
  UserName="hello"
  phone_number={12345678}
/>

// 正例
<Foo
  userName="hello"
  phoneNumber={12345678}
/>
```

### 6. 括号规范

当组件跨行时，要用括号包裹 JSX 标签（eslint: react/wrap-multilines）

```jsx
// 反例
render() {
  return <MyComponent className="long body" foo="bar">
           <MyChild />
         </MyComponent>;
}

// 正例
render() {
  return (
    <MyComponent className="long body" foo="bar">
      <MyChild />
    </MyComponent>
  );
}

// 正例, when single line
render() {
  const body = <div>hello</div>;
  return <MyComponent>{body}</MyComponent>;
}
```

## React Hooks 规范

### 1. useCallback 与 useMemo

在组件内部，那些会成为其他 useEffect 依赖项的方法，建议用 useCallback 包裹，或者直接编写在引用它的 useEffect 中。

自己所不欲勿施于人，如果你的 function 会作为 props 传递给子组件，请一定要使用 useCallback 包裹，对于子组件来说，如果每次 render 都会导致你传递的函数发生变化，可能会对它造成非常大的困扰。同时也不利于 react 做渲染优化。

```javascript
// 反例
const handleClick = useCallback(
  debounce(() => {
    setCount((c) => ++c);
  }, 1000),
  [],
);

// 反例
const handleClick = useCallback(
  debounce(() => {
    setCount(count + 1);
  }, 1000),
  [],
);

// 正例
const handleClick = useMemo(
  () =>
    debounce(() => {
      setCount(count + 1);
    }, 1000),
  [count],
);
// 这样保证每当 count 发生变化时，会返回一个新的加了防抖功能的新函数。
```

### 2. 状态每次改变，整个 function 都会重新执行

可能导致：函数的每次执行，其内部定义的变量和方法都会重新创建，也就是说会从新给它们分配内存，这会导致性能受到影响。

**解决方法**：

- 变量尽量放在函数外部
- 方法使用 useCallback 包裹起来

## 国际化规范

国际化采用统一的命名规范，开发者在开发具体功能的时候要按照语言 code 定义描述，不能直接写死描述。

### 1. 引入多语言工具类

### 2. 调用多语言方法

```
intl.get(code).d(defaultMessage)
```

- `code`: 多语言 code
- `defaultMessage`: 默认描述，当多语言找不到的情况下返回默认值

### 3. CODE 命名规范（CODE 分为两段）

- **第一段**: `[服务名].[功能名]` 例如：`hfpm.event`，其中 hpfm 是服务名，event 是功能名
- **第二段** 分为 2 种类型：
  - **模型**: `model.[模型名].[字段名]` 例如：`model.event.code` 是 event 模型的 code 字段
  - **视图**: `view.[类型].[具体类型].[具体含义]`
    - 验证类型: `view.validation.require`
    - 提示信息: `view.message.success`
    - 操作类型: `view.option.submitOrder`
    - 按钮: `view.button.save`, `view.button.submit`

统一按照 `[具体类型].[具体含义]` 的方式定义。

**注意**：内容中如果包含 `:` 以及以 `{` 开头，比如用引号包裹下 `abc: "测试:冒号"` `cde: "{name} 姓名"`，如果内容中包含引号，需要转义 `abc: '引"号'`

### 4. 增加多语言注解

最后在需要用到多语言的类上增加注解，其中 code 是对应到上面 `服务.功能` 的字符串数组。

### 国际化注意事项

1. **多语言编码中不能出现字符串/变量拼接，必须为纯字符串**

```
// 不规范
intl.get('hfpm.event.name') + name

// 规范
intl.get('hfpm.event.name', { name })
```

多语言编码中出现字符串/变量拼接是不推荐使用的，如果一定要使用这种方法，请勿在多个文件中传递使用。

2. **多语言的编码长度不能过长，一般规定长度不能大于 60**

3. **一个编码只能对应唯一一个默认值**

如果默认值出现了拼接，需要换成 intl 的模板国际化举例：

```
hzero.common.validation.notNull 多语言描述是 {name} 不能为空
intl.get() 函数第二个参数是变量的值。
```

4. **在书写组件的时候，不要使用纯组件，纯组件会导致国际化无法切换问题**

## 性能优化规范

### 1. 使用 PureComponent

React.PureComponent 中浅层对比了 prop 和 state 来避免重新渲染。但是假如 props 和 state 的属性值是对象的情况下，并不能阻止不必要的渲染，因为只是比较了地址，所以在使用 PureComponent 的时候要确保数据类型是值的类型，如果是引用类型，最好不要有深层次的变化。

### 2. 使用 ShouldComponentUpdate

这个函数可以决定是否要重新渲染组件，也属于一个生命周期函数，如果 props 更改或者调用 setState 这个函数会返回一个布尔值，true 表示会重新渲染，如果为 false 则不会重新渲染。

### 3. 使用 React.memo

如果组件在相同的 props 的情况下渲染结果相同时，可以通过将其包装在 React.memo 中，React 将跳过渲染组件并直接复用最近一次渲染的结果。React.memo 对比的是 props 的变化，如果一个组件被这个钩子函数包裹，但是其内部有 useState 或者 useReducer 之类的，仍会进行重新渲染，这个也是进行的浅层比较，如果想要控制对比的过程，可以将自定义的函数通过第二个参数进行传递。

### 4. 使用 useMemo 缓存计算结果

如果一个组件中有一个计算量比较大的函数，重新渲染每次都调用比较消耗性能，所以我们可以使用 useMemo 来缓存这个函数的计算结果，这样只有传入的参数发生变化才会重新进行计算。

### 5. 使用 useCallback 来缓存函数

假如一个组件中有一个函数，只要状态发生变化，这个函数就会被重新定义，使用 useCallback 可以进行缓存。

### 6. 使用发布订阅模式来避免中间组件不必要的渲染

如果组件的嵌套层级比较深，可能造成中间组件不必要的渲染，可能中间组件只是传递了 props，这种情况我们可以通过发布订阅模式，让只关心某个状态的组件去更新，可以借助一些类似的第三方库：redux。

### 7. 尽量将状态放到子组件中（状态下方）

如果一个状态只是某部分子组件在使用，可以将其提取为一个组件，然后状态定义到这个组件中，避免中间组件不必要的渲染。

### 8. 列表的每个 item 加上 key 属性

通过添加 key 属性可以更好的辅助 Diff 算法进行虚拟 DOM 计算，避免不必要的渲染。

### 9. state 更新合并

出于性能考虑，React 可能会把多个 setState() 调用合并成一个调用；因为 this.props 和 this.state 可能会异步更新，所以这种场景下需要让 setState() 接收一个函数而不是一个对象。

```javascript
// 反例
this.setState({
  count: this.state.count + 1,
});

// 正例
this.setState((prevState) => ({
  count: prevState.count + 1,
}));
```

### 10. 组件懒加载

组件懒加载实现的效果是让真正需要渲染这个组件的时候才渲染，主要是通过 React.lazy 和 React.Suspense 这两个组件来进行组件懒加载。主要是使用 React.lazy 来定义一个动态加载的组件，React.Suspense 主要是用来包裹要懒加载的组件的。

```javascript
const LazyComponent = React.lazy(() => import("./LazyComponent"));

function App() {
  return (
    <React.Suspense fallback={<Loading />}>
      <LazyComponent />
    </React.Suspense>
  );
}
```

### 11. 使用虚拟列表

虚拟列表可以根据滚动容器的元素的高度来渲染长列表的数据，尤其是在一些没有直接分页的场景，主要是使用第三方库：react-window、react-virtualized。

### 12. 使用 React.fragment 来避免不必要的 div

因为 React 规定一个组件只能有一个父元素，我们可以通过 React.Fragment 来代替不必要的 div。

```jsx
// 反例
render() {
  return (
    <div>
      <Child />
    </div>
  );
}

// 正例
render() {
  return (
    <React.Fragment>
      <Child />
    </React.Fragment>
  );
}

// 简写形式
render() {
  return (
    <>
      <Child />
    </>
  );
}
```

## React 编码风格规范

### 1. 缩进

JSX 语法使用 2 个空格缩进。

```jsx
// 反例
<Foo
    superLongParam="bar"
    anotherSuperLongParam="baz"
>
    <Quux />
</Foo>

// 正例
<Foo
  superLongParam="bar"
  anotherSuperLongParam="baz"
>
  <Quux />
</Foo>
```

### 2. 空格

- 自闭合标签的斜线前有且仅有一个空格

```jsx
// 反例
<Foo/>

// 正例
<Foo />
```

- JSX 行内属性之间仅有一个空格

```jsx
// 反例
<App  spacy />

// 正例
<App cozy />
```

- JSX 属性的大括号内部两侧无空格

```jsx
// 反例
<Foo bar={ baz } />

// 正例
<Foo bar={baz} />
```

- 不要在 JSX 属性的等号两边加空格

```jsx
// 反例
<Hello name={firstname} />;

// 正例
<Hello name={firstname} />;
```

### 3. 引号

JSX 属性使用双引号，不要使用单引号。

```jsx
// 反例
<Foo bar='bar' />

// 正例
<Foo bar="bar" />

// 反例
<Foo style={{ left: "20px" }} />

// 正例
<Foo style={{ left: '20px' }} />
```

### 4. 小括号

多行的 JSX 标签需用小括号包裹。

```jsx
// 反例
render() {
  return <MyComponent variant="long body" foo="bar">
           <MyChild />
         </MyComponent>;
}

// 正例
render() {
  return (
    <MyComponent variant="long body" foo="bar">
      <MyChild />
    </MyComponent>
  );
}
```

### 5. 标签规范

- 无子元素的标签需写成自闭合标签

```jsx
// 反例
<Foo variant="stuff"></Foo>

// 正例
<Foo variant="stuff" />
```

- 标签属性的换行

```jsx
// bad - 属性应全部换行，或全部跟组件名写在一行
<Foo superLongParam="bar"
     anotherSuperLongParam="baz" />

// good
<Foo
  superLongParam="bar"
  anotherSuperLongParam="baz"
/>
```

- 禁止在有子节点的组件或 DOM 元素中使用 dangerouslySetInnerHTML 属性

```jsx
// 反例
<div dangerouslySetInnerHTML={{ __html: "HTML" }}>
  Children
</div>

// 正例
<div dangerouslySetInnerHTML={{ __html: "HTML" }} />
```

- 不要使用危险属性

```jsx
// 反例
<div dangerouslySetInnerHTML={{ __html: "Hello World" }}></div>;

// 正例
<div>Hello World</div>;
```

- HTML 自闭标签不能有子节点

```jsx
// 反例
<br>Children</br>

// 正例
<div>Children</div>
```

- JSX 语句的文本节点中不要使用注释字符串

```jsx
// 反例
<div>// empty div</div>

// 正例
<div>{/* empty div */}</div>
```

- 标签中禁止出现无意义字符

```jsx
// 正例
<div> &gt; </div>
<div> {'>'} </div>
```

## 语言特性规范

### 1. 基本规范

- 不要使用未声明的组件

```jsx
// 反例
<Hello name="John" />;

// 正例
import Hello from "./Hello";
<Hello name="John" />;
```

- 每个文件只包含一个 React 组件

- 不要在函数组件中使用 this

```jsx
// 反例
function Foo(props, context) {
  return <div>{this.context.foo ? this.props.bar : ""}</div>;
}

// 正例
function Foo(props, context) {
  return <div>{context.foo ? props.bar : ""}</div>;
}
```

- 使用 ES6 class 创建组件，而不是 createReactClass

```jsx
// 反例
const Listing = createReactClass({
  render() {
    return <div>{this.state.hello}</div>;
  },
});

// 正例
class Listing extends React.Component {
  render() {
    return <div>{this.state.hello}</div>;
  }
}
```

- 如果组件没有内部状态或 refs，应使用函数组件，而不是类组件

```jsx
// 反例
class Listing extends React.Component {
  render() {
    return <div>{this.props.hello}</div>;
  }
}

// 正例
function Listing({ hello }) {
  return <div>{hello}</div>;
}
```

- 不要使用 React.createElement，除非你不是用 JSX 文件初始化应用程序

### 2. 方法规范

- 不要在 JSX 属性中使用 .bind()

```jsx
// 反例
class extends React.Component {
  onClickDiv() {
    // ...
  }

  render() {
    return <div onClick={this.onClickDiv.bind(this)} />;
  }
}

// 正例 - 在 constructor 中绑定事件处理函数
class extends React.Component {
  constructor(props) {
    super(props);
    this.onClickDiv = this.onClickDiv.bind(this);
  }

  onClickDiv() {
    // ...
  }

  render() {
    return <div onClick={this.onClickDiv} />;
  }
}
```

- render 方法必须要有返回值

```jsx
// 反例
render() {
  (<div />);
}

// 正例
render() {
  return (<div />);
}
```

- 禁止使用 ReactDOM.render 的返回值

```jsx
// 反例
const inst = ReactDOM.render(<App />, document.body);
doSomethingWithInst(inst);

// 正例
ReactDOM.render(<App ref={doSomethingWithInst} />, document.body);
```

- 禁止使用已经废弃的方法

```jsx
// 禁止使用
React.render(<MyComponent />, root);
React.unmountComponentAtNode(root);
React.findDOMNode(this.refs.foo);
React.renderToString(<MyComponent />);
React.renderToStaticMarkup(<MyComponent />);
React.createClass({ /* Class object */ });
React.DOM.div();
componentWillMount() { }
componentWillReceiveProps() { }
componentWillUpdate() { }
```

- 不要使用 findDOMNode

```jsx
// 反例
class MyComponent extends Component {
  componentDidMount() {
    findDOMNode(this).scrollIntoView();
  }

  render() {
    return <div />;
  }
}

// 正例
class MyComponent extends Component {
  componentDidMount() {
    this.node.scrollIntoView();
  }

  render() {
    return <div ref={(node) => (this.node = node)} />;
  }
}
```

- 不要使用 componentWillMount、componentWillReceiveProps、componentWillUpdate

### 3. Props 规范

- 采用小驼峰风格命名 prop

```jsx
// 反例
<Foo UserName="hello" phone_number={12345678} />

// 正例
<Foo userName="hello" phoneNumber={12345678} />
```

- 声明的 prop 必须被使用

- props，state 优先使用解构赋值

```jsx
// 正例
const MyComponent = ({ id }) => {
  return <div id={id} />;
};
```

- prop 值为 true 时，可以省略它的值

```jsx
// 反例
<Foo hidden={true} />

// 正例
<Foo hidden />
```

- prop 需要 propTypes 验证

- 不要使用模糊的类型检查器（any, array, object）

- 如果属性有 isRequired 类型检查，不要在 defaultProps 内对其赋值

- 不要用数组的索引值作为 map 生成元素的 key

```jsx
// 反例
{
  todos.map((todo, index) => <Todo {...todo} key={index} />);
}

// 正例
{
  todos.map((todo) => <Todo {...todo} key={todo.id} />);
}
```

- 禁止将 children 作为属性名

```jsx
// 反例
<div children='Children' />
<MyComponent children={<AnotherComponent />} />

// 正例
<div>Children</div>
<MyComponent>Children</MyComponent>
```

- 不要声明重复的属性名

```jsx
// 反例
<Hello name="John" name="John" />;

// 正例
<Hello firstname="John" lastname="Doe" />;
```

- style 的属性值必须是一个对象

```jsx
// 反例
<div style="color: 'red'" />

// 正例
<div style={{ color: "red" }} />
```

- 不要单独使用 target='\_blank'，需配合 rel='noreferrer noopener'

```jsx
// 反例
<a target='_blank' href="http://example.com/"></a>

// 正例
<a target='_blank' rel='noopener noreferrer' href="http://example.com"></a>
```

### 4. State 规范

- 不要在 setState 中使用 this.state

```javascript
// 反例
function increment() {
  this.setState({ value: this.state.value + 1 });
}

// 正例
function increment() {
  this.setState((prevState) => ({ value: prevState.value + 1 }));
}
```

- 声明的 state 必须被使用

### 5. Refs 规范

使用 ref 回调函数或 React.createRef()，不要使用字符串。

```jsx
// 反例
class MyComponent extends React.Component {
  componentDidMount() {
    this.refs.inputRef.focus();
  }

  render() {
    return <input type="text" ref="inputRef" />;
  }
}

// 正例 - 使用回调函数
class MyComponent extends React.Component {
  componentDidMount() {
    this.inputRef.focus();
  }

  render() {
    return (
      <input
        type="text"
        ref={(ele) => {
          this.inputRef = ele;
        }}
      />
    );
  }
}

// 正例 - 使用 React.createRef()
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.inputRef.current.focus();
  }

  render() {
    return <input type="text" ref={this.inputRef} />;
  }
}
```

### 6. 组件方法排序

推荐的方法排序如下：

1. 可选的 static 方法
2. constructor
3. getChildContext
4. componentWillMount
5. componentDidMount
6. componentWillReceiveProps
7. shouldComponentUpdate
8. componentWillUpdate
9. componentDidUpdate
10. componentWillUnmount
11. clickHandlers 或 eventHandlers
12. render 的 getter 方法
13. 可选的 render 方法
14. render

### 7. Mixins 规范

不要使用 mixins。

## 命名规范

### 1. 文件扩展名

使用 .jsx、.tsx、.js 或 .ts 作为 React 组件的文件扩展名。

### 2. 引用名

使用大驼峰风格命名引用的组件，使用小驼峰风格命名引用组件的实例。

```jsx
// 反例
import reservationCard from "./reservation-card";

// 正例
import ReservationCard from "./reservation-card";

// 反例
const ReservationItem = <ReservationCard />;

// 正例
const reservationItem = <ReservationCard />;
```

### 3. 高阶组件命名

高阶组件命名：将高阶组件名和传入组件名组合作为 displayName。

```javascript
// 正例
export default function withFoo(WrappedComponent) {
  function WithFoo(props) {
    return <WrappedComponent {...props} foo />;
  }

  const wrappedComponentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  WithFoo.displayName = `withFoo(${wrappedComponentName})`;
  return WithFoo;
}
```

## Hooks 规范

### 1. 只在最顶层调用 Hooks

不要在循环、条件和嵌套函数中调用 Hooks。

```jsx
// 反例
function ComponentWithConditionalHook() {
  if (cond) {
    useConditionalHook();
  }
}

// 反例
function ComponentWithHookInsideLoop() {
  while (cond) {
    useHookInsideLoop();
  }
}

// 正例
function ComponentWithHook() {
  useHook();
}
```

### 2. Hooks 命名规范

Hooks 命名必须以 use 开头，小驼峰形式。

```javascript
// 反例
const customHook = () => {};

// 正例
const useCustomHook = () => {};
```

### 3. 只在 React 函数组件和自定义 Hooks 中调用 Hooks

```jsx
// 反例 - class 组件中调用
class ClassComponentWithHook extends React.Component {
  render() {
    React.useState();
  }
}

// 正例 - 函数组件中调用
function ComponentWithHook() {
  useHook();
}

// 正例 - 自定义 Hooks 中调用
function useHookWithHook() {
  useHook();
}
```

### 4. useEffect 及类似 Hooks 需要声明所有依赖

```javascript
// 反例
function MyComponent() {
  const local = {};
  useEffect(() => {
    console.log(local);
  }, []);
}

// 正例
function MyComponent() {
  const local = {};
  useEffect(() => {
    console.log(local);
  }, [local]);
}
```

## 国际化规范（react-intl-universal）

### 1. 国际化库使用

```javascript
import intl from 'react-intl-universal';

// 当前工程的i18nCode
export const I18N_CODE = 'rosefinch.common';

export const getIntl = (intlCode, str, varibles) => {
  return intl.get(`${I18N_CODE}.${intlCode}, varibles).d(str);
};
```

### 2. 国际化使用规范

国际化使用需要唯一编码和默认值，只有使用如此操作才能够正确扫描。

```javascript
getIntl("delete.title", "删除提示");
```

### 3. CODE 命名规范

- 第一段: `[服务名].[功能名]` 例如：`hfpm.event`
- 第二段:
  - 模型: `model.[模型名].[字段名]` 例如：`model.event.code`
  - 视图: `view.[类型].[具体类型].[具体含义]` 例如：`view.button.save`

### 4. 国际化注意事项

- 多语言编码中不能出现字符串/变量拼接，必须为纯字符串
- 多语言的编码长度不能大于 60
- 一个编码只能对应唯一一个默认值
- 不要使用纯组件，会导致国际化无法切换

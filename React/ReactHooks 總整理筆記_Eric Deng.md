本文複製[React Hooks 總整理筆記](https://gcdeng.com/blog/react-hooks#functional-updates)

## React Hook 使用規則

1.  只能在 React function component 或是自定義的 hook 中使用，不能在一般的 JavaScript function 中使用。
2.  只能在 React function component **最上層**直接呼叫，不能在條件式、迴圈或巢狀函式內呼叫 hook，React 使用這個規則來保證每次 render 時呼叫 hook 的順序都是一樣的。

## useState

```jsx
const [state, setState] = useState(initialState);
```

useState 會回傳當前的 state 以及另一個用來更新 state 的 setState function。

如果是第一次 render，state 的值會是 initialState，如果是在後續的 render，initialState 不會被使用，state 會是最近一次更新的 state 值。

> **Note**
> 
> React guarantees that&nbsp;`setState`&nbsp;function identity is stable and won’t change on re-renders. This is why it’s safe to omit from the&nbsp;`useEffect`&nbsp;or&nbsp;`useCallback`&nbsp;dependency list.
> 
> `setState` 的記憶體位置(reference identity)不會因為 re-render 而改變，所以傳遞給其他子元件也不會造成子元件 re-render。

### Functional updates

```jsx
function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  return (
    <>
      Count: {count}
      <button onClick={() => setCount(initialCount)}>Reset</button>
      <button onClick={() => setCount((prevCount) => prevCount - 1)}>-</button>
      <button onClick={() => setCount((prevCount) => prevCount + 1)}>+</button>
    </>
  );
}
```

也可以結合 object spread 語法來更新 object state

```jsx
const [state, setState] = useState({count: 4, name: 'blue'});
setState(prevState => {...prevSate, count: prevSate.count + 1};
console.log(state); // {count: 5, name: 'blue'}
```

### 惰性初始 state

如果初始 state 需要複雜的邏輯運算，你可以傳入一個 init function 給 useState，init function 只會在初始 render 時被調用。

```jsx
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation(props);
  return initialState;
});
```

### Batching of state updates​

React 不會在每次 setState 後就馬上同步地執行 re-render，而是將多個 setState 累積加入到 queue 中，再一次 re-render 更新多個 state，藉由批次處理 state updates 就只要 re-render 一次來改善效能。

在 React 18 之前只會 batch 更新 React event handler 裡面的 setState，如果是在 setTimeout 或是 promise 之類的原生 event handler 裡面的 setState 是不會被 batch update。

```jsx
// Before React 18 only React events were batched

function handleClick() {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // React will only re-render once at the end (that's batching!)
}

setTimeout(() => {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // React will render twice, once for each state update (no batching)
}, 1000);
```

在 React 18 之後全部的 event handler裡面的 setState 都會自動被 batch update 了。

```jsx
// After React 18 updates inside of timeouts, promises,
// native event handlers or any other event are batched.

function handleClick() {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // React will only re-render once at the end (that's batching!)
}

setTimeout(() => {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // React will only re-render once at the end (that's batching!)
}, 1000);
```

如果你不想要 batch update 還是可以用 flushSync 讓 state 可以獨立同步的被更新做 re-render。

```jsx
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCounter((c) => c + 1);
  });
  // React has updated the DOM by now
  flushSync(() => {
    setFlag((f) => !f);
  });
  // React has updated the DOM by now
}
```

## useEffect​

```jsx
useEffect(didUpdate);
```

function component body 內 (render 的期間) 不能直接執行會產生 side effect 的行為，例如 data fetching, timers, subscriptions，這些行為應該寫在 useEffect。

### Effect function

useEffect 傳入的第一個參數是一個 effect function，任何有 side effect 的行為都應該要寫在這個 effect function 內，**effect function 會在 component render 完成(paint)之後才執行**，effect function 只能回傳一個 clean-up function 或是什麼都不回傳(包含`undefined`)。

### Cleaning up an effect​

```jsx
useEffect(() => {
  const subscription = props.source.subscribe();
  return () => {
    // Clean up the subscription
    subscription.unsubscribe();
  };
});
```

在 component 離開螢幕之前需要清除 effect 所建立的資源，像是 subscription 或 Timer ID，以避免 memory leaks。這些要清除的 effect 可以寫在 effect function 回傳的 clean-up function 內，**clean-up function 會在元件被移除前(unmount)被調用。**

component 通常都會 render 很多次，在每次 render 執行下一個 effect 之前，上一個 effect 的 clean-up function 會先被執行清除已建立的資源。

### Timing of effects​

effect function 執行的時機點會在**layout 和 paint 之後**，也就是畫面都已經渲染好，user 已經看到畫面之後。也因為這樣執行 effect function 時才不會 block 住瀏覽器更新畫面，適用於很多常見的 side effect，例如 data fetching、設定 subscription 和 event handler，不阻礙瀏覽器更新畫面的工作。

但有些 effect 需要發生在 paint 之前，例如使用者可見的 DOM 改變，避免 user 先看到初始值又突然一閃變成 side effect 改變的值，這時可以選擇使用 `useLayoutEffect` ，他跟 useEffect 的差別只在於他執行的時機點是在 paint 之前，但是使用時需要注意他會 blocking 瀏覽器渲染畫面，不能執行運算時間太長的工作，否則會延後 user 看到畫面的時間。

### Conditionally firing an effect

如果 useEffect 只有傳入一個 function 參數，預設會是在**每次 render 完成之後**調用 effect function。

如果在第二個參數中傳入 dependency array，可以讓 useEffect**只在 dependency array 中的值改變之後**才執行 effect function。

```jsx
useEffect(() => {
  // 偵測到 props.source 改變之後才執行這個function
  const subscription = props.source.subscribe();
  return () => {
    subscription.unsubscribe();
  };
}, [props.source]);
```

所有在該 component 中會隨時間而變的值（例如 props 和 state）以及在該 effect function 所使用到的值都應該寫在 dependency array 裡，否則 effect function 會用到上一次 render 的舊值。

如果只想要在 mount 時執行一次 effect function，unmount 時執行一次 clean-up function，可以只帶一個空的 dependency array(`[]`)。

> 建議使用 &nbsp;[eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks#installation) 中的 &nbsp;[exhaustive-deps](https://github.com/facebook/react/issues/14920) 規則。它會在依賴錯誤時發出警告並提出修正建議。

### 總結常見的四個使用情境​

1.  不帶 dependency array，在每次 render 完成之後都執行 effect function
2.  帶空的 dependency array，只會執行一次 effect function，時機點是在初次 render 完成之後
3.  將 effect function 內會用到的 dependency state/props 放進 dependency array 中，如果 dependency 有變化才執行 effect function
4.  return clean-up function，在 unmount 時清除 effect 中使用到的資源

## useContext

```jsx
const value = useContext(MyContext);
```

接收一個 context object 參數（[React.createContext](https://reactjs.org/docs/context.html#reactcreatecontext)&nbsp; 的回傳值）並回傳該 context 目前的值。

`useContext`取得的值取決於距離 component 最近的 &nbsp;`&lt;MyContext.Provider&gt;`&nbsp; 的 &nbsp;`value`&nbsp;prop。

呼叫 &nbsp;`useContext` 的 component 總是會在 context value 更新時 re-render。如果 re-render component 的操作很昂貴，你可以透過 `useMemo` 或其他 [memoization 來最佳化](https://github.com/facebook/react/issues/15156#issuecomment-474590693)。

Example:

```jsx
const themes = {
  light: {
    foreground: '#000000',
    background: '#eeeeee',
  },
  dark: {
    foreground: '#ffffff',
    background: '#222222',
  },
};

const ThemeContext = React.createContext(themes.light);

function App() {
  return (
    <ThemeContext.Provider value={themes.dark}>
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      I am styled by theme context!
    </button>
  );
}
```

### `React.createContext`

```jsx
const MyContext = React.createContext(defaultValue);
```

### `Context.Provider`

```jsx
<MyContext.Provider value={/* some value */}>
```

每一個 context object 都有一個 Provider React component，提供子元件訂閱 context 的改變事件。

多個 Context Provider 可以直接寫成巢狀，例如：

```jsx
class App extends React.Component {
  render() {
    const { signedInUser, theme } = this.props;

    // App component that provides initial context values
    return (
      <ThemeContext.Provider value={theme}>
        <UserContext.Provider value={signedInUser}>
          <Layout />
        </UserContext.Provider>
      </ThemeContext.Provider>
    );
  }
}
```

## useMemo

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

Pass a “create” function and an array of dependencies

Returns a&nbsp;[memoized](https://en.wikipedia.org/wiki/Memoization)&nbsp;value. 記住 callback function 回傳的運算結果，可以是任何值，包含 object、array、basic type，甚至是 React Component。

re-render 時只有在 dependencies 改變後才會重新執行 callback function 更新 memoizedValue，如果 dependencies 沒有改變會直接使用當前的 memoizedValue，不會重新執行 callback function。適合把**執行速度慢的運算**或是**dependencies 沒變結果就不會變得運算**使用 useMemo 將結果存起來，避免每次 render 都要重複執行不必要的運算以改善效能。

傳到 &nbsp;`useMemo`&nbsp; 的 function 會在 render 期間執行，因此**不能執行有 side effect 的運算**。

如果沒有提供 array，每次 render 時都會計算新的值，等於沒作用。

## useCallback​

```jsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

接收一個 callback function 跟一個 dependency array

回傳 memoized callback，這個 memoized callback 只會在 dependencies 改變時更新，如果 dependencies 沒有改變，memoized callback 會被保存在同一個記憶體位置(reference identity)，在下一次的 render 直接繼續使用。

一般的 callback function 即使內容或是結果沒有任何改變也會在每次 render 時存進新的記憶體位置，當這 callback 有傳給 child component 使用時，因為對 child 來說都是新的 prop，會造成 child component 每次都 re-render，但這其實是不必要的而且浪費效能的因為 re-render 之後還是一樣的結果，只需要在 callback function 真的有改變時才 re-render 就好，為了改善這個效能問題，可以改成用 memoizedCallback 傳遞給 child，如此一來只有在 callback function 真正有改變時才會讓 child component re-render。

 > `useCallback(fn, deps)`&nbsp; 相等於 &nbsp;`useMemo(() =&gt; fn, deps)`。

## Memorized Hook​

useMemo, useCallback

不建議全部都用 Memorized Hook，因為可能會有 memory overhead，memory usage 太多也會有 performance issue ，適用的函式要符合：

- 執行速度很慢  (Expensive function or expensive calculation)
- 不需要每次 render 都執行的運算

## useReducer​

```jsx
const [state, dispatch] = useReducer(reducer, initialArg, init);
```

第一個參數是 reducer function，**reducer 是一個不能有 side effect 的 pure function**，負責的工作是接收前一個 state 以及 action 然後計算下一個 state 並回傳。

useReducer 會回傳當前的 state 以及 dispatch function，component 可以透過 dispatch action 來更新 state 觸發 re-render。

Example

```jsx
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}
```

使用上的流程主要會是這樣：

1.  定義 action object，下一個狀態要做什麼改變？
2.  定義 reducer，接收到 action 之後下一個狀態該如何改變？
3.  在元件中使用 state
4.  在元件中的 event handler 透過 dispatch action 呼叫 reducer 來更新 state，re-render component

![image](./use-reducer.jpg)

[https://dmitripavlutin.com/react-usereducer/](https://dmitripavlutin.com/react-usereducer/)

> **Note**
> 
> React guarantees that&nbsp;`dispatch`&nbsp;function identity is stable and won’t change on re-renders. This is why it’s safe to omit from the&nbsp;`useEffect`&nbsp;or&nbsp;`useCallback`&nbsp;dependency list.
> 
> dispatch function 在 re-render 的時候不會被改變，因此不會造成子元件 re-render，適合拿來傳遞給子元件使用同時保持好的效能。

### 如何初始化​

有兩種方式可以初始化 useReducer state，第一種是透過第二個參數傳入初始狀態

```jsx
const [state, dispatch] = useReducer(reducer, { count: initialCount });
```

第二種方式是惰性初始化(Lazy initialization)，透過第三個參數傳入 init function，init function 可以接收 props，然後回傳要初始化的 state，這種方式可以讓你把初始化的邏輯寫在 reducer 之外，要在 reducer 中處理初始化的 action 也會比較方便。

```jsx
function init(initialCount) {
  return { count: initialCount };
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return init(action.payload);
    default:
      throw new Error();
  }
}

function Counter({ initialCount }) {
  const [state, dispatch] = useReducer(reducer, initialCount, init);
  return (
    <>
      Count: {state.count}
      <button
        onClick={() => dispatch({ type: 'reset', payload: initialCount })}
      >
        Reset
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
    </>
  );
}
```

### useReducer 跟 Redux 不同之處​

-  **userReducer 資料是存在 component state，而 Redux 是存在 global store**，可以搭配 useContext 做到類似 global store 的效果。
-  **userReducer 沒有 middleware**，不能像 Redux 用 thunk 或 saga 來處理 side effect。

## useRef

```jsx
const refContainer = useRef(initialValue); // {current: initialValue}
```

useRef 會回傳一個有 &nbsp;`current` 屬性的 object，`refContainer.current` 的值會被初始化為 initialValue。

refContainer 會在 component**整個生命週期都保存一樣的 reference**。如果是自己建立的`{current: ...}`&nbsp;object，每次 render 後 reference 就會改變。

更新 current 的值**不會觸發 re-render**。

更新 &nbsp;`useRef` object 的 current&nbsp; 是 side effect，所以要寫在 &nbsp;`useEffect`&nbsp; 或 event handler 裡面。

### 常見的使用情境

-  直接存取 child 或 DOM 執行操作

```jsx
function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  const onButtonClick = () => {
    // `current` points to the mounted text input element
    inputEl.current.focus();
  };
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
```

-  計算 render 次數

```jsx
const App = () => {
  const renderCount = useRef(0); // { current: 0 }

  useEffect(() => {
    renderCount.current += 1;
  });

  return <p>{renderCount.current}</p>;
};
```

## useLayoutEffect

使用方式跟 useEffect 相同，差別在於 useLayoutEffect 的 effect function 是在瀏覽器 paint 渲染畫面**之前**同步(synchronously)執行，所以**畫面會被 block 住直到 effect function 執行完才會出現**，使用上必須小心可能影響效能，**官方建議盡量以使用 useEffect 為主**，避免畫面被 blocking。

詳細使用範例可以參考這篇寫得很好的文章：

[https://medium.com/hannah-lin/react-hook-筆記-uselayouteffect-30c93301a618](https://medium.com/hannah-lin/react-hook-%E7%AD%86%E8%A8%98-uselayouteffect-30c93301a618)

## useDeferredValue

```jsx
const deferredValue = useDeferredValue(value);
```

defer user input 的 search query，React 會先把 user input 當成緊急狀態先處理，完成之後才會更新 deferredQuery，但是依賴 deferred value 的 child component 要記得使用 useMemo，只有當 deferred value 改變時才 re-render child component，否則就會造成不必要的 re-render。

通常用來接收一個 state，回傳一個複製 state 的值，deferredValue，這個 deferredValue 會被認為是 non-urgent 的 state，會先保留原來的值，被延遲等到其他 urgent 的 state 更新完成，才會回來更新 deferredValue。

用途類似 debouncing 或 throttling，可以用在需要延遲一段時間再更新 state 的地方，差別在於不用指定固定的延遲時間，React 會在其他緊急的工作(例如 user input)完成之後自動回來更新 deferredValue。**跟 useTransition 一樣是 React 18 的新功能，他們的目的都是用來告訴 React 哪些是非緊急的 state 更新，可以被 urgent state 中斷或是延遲晚一點再做 re-render 沒關係。**

**依賴 deferred value 的 child component 要記得使用 useMemo**，不然容易造成不必要的 re-render。

Example:

defer user input 的 search query，React 會先把 user input 當成緊急狀態先處理，完成之後才會更新 deferredQuery，但是依賴 deferred value 的 child component 要記得使用 useMemo，只有當 deferred value 改變時才 re-render child component，否則就會造成不必要的 re-render。

```jsx
function Typeahead() {
  const query = useSearchQuery('');
  const deferredQuery = useDeferredValue(query);

  // Memoizing tells React to only re-render when deferredQuery changes,
  // not when query changes.
  const suggestions = useMemo(
    () => <SearchSuggestions query={deferredQuery} />,
    [deferredQuery]
  );

  return (
    <>
      <SearchInput query={query} />
      <Suspense fallback="Loading results...">{suggestions}</Suspense>
    </>
  );
}
```

## useTransition​

```jsx
const [isPending, startTransition] = useTransition();
```

回傳的第一個變數代表是否正在更新狀態(transition)的 isPending 布林值，以及一個開始更新狀態(transition)的 startTransition function。

startTransition function 可以讓你傳入一個 callback function 在其中執行**比較不緊急的狀態更新**，並獲取 isPending 代表是否正在更新狀態，可以用 isPending 來顯示 loading spinner。

Example:

```jsx
function App() {
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState(0);

  function handleClick() {
    startTransition(() => {
      setCount((c) => c + 1);
    });
  }

  return (
    <div>
      {isPending && <Spinner />}
      <button onClick={handleClick}>{count}</button>
    </div>
  );
}
```

這是 React 18 的新功能，你可以在 startTransition 內處理非緊急的 state 更新，如果有緊急的 state 更新例如 clicks or key presses，startTransition 內的 state 更新會被中斷，等到緊急的工作處理完會在自動回來執行。

-  **Urgent updates** reflect direct interaction, like typing, clicking, pressing, and so on. startTransition 之外的 state 更新**預設都是屬於緊急的**。
-  **Transition updates** transition the UI from one view to another. 一些使用者不容易察覺或是可預期的畫面轉換延遲

```jsx
import { startTransition } from 'react';

// Urgent: Show what was typed
setInputValue(input);

// Mark any state updates inside as transitions
startTransition(() => {
  // Transition: Show the results
  setSearchQuery(input);
});
```

> **useDeferredValue 跟 useTransition 都是 React 18 提供給我們標示出非緊急的 state updates 的方法，其他沒有標示的話 React 就會默認當作是緊急的 state updates。**

## useId​

```jsx
const id = useId();
```

產生唯一的 ID

example，直接用在需要 id 的元素上。

```jsx
function Checkbox() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Do you like React?</label>
      <input id={id} type="checkbox" name="react" />
    </>
  );
}
```
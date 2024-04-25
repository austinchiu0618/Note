## Use Comma as Thousand Separator
- 方法一
  ```js
  const n = 716298462;
  const formatted = n.toLocaleString('en-US');
  ```

- 方法二
  ```js
  const n = 716298462;
  const numberFormatter = Intl.NumberFormat ('en-US');
  const formatted = numberFormatter.format(n);
  ```

- 方法三
  ```js
  function commify(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  ```

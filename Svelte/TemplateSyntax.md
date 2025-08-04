## $state
`$state`

```svelte
<script>
	let count = $state(0);

  let todoList = $state([
    { done: false, text: "todo A" }
  ])

  todoList.push({ done: false, text: "todo B" });

  todoList[0].done = !todoList[0].done
</script>

<button onclick={() => count++}>
	點擊次數: {count}
</button>
```

`$state.raw`
在不希望對象和數組具有深度響應性的情況下，可以使用 $state.raw。
```svelte
<script>
let person = $state.raw({
	name: 'Heraclitus',
	age: 49
});

// not work
person.age += 1; 

// work
person = {
	name: 'Heraclitus',
	age: 50
};
</script>
```

## $derived
`$derived`
```svelte
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>
	{doubled}
</button>

<p>{count} 的兩倍是 {doubled}</p>
```

`$derived.by`
需要複雜演算時使用
```svelte
<script>
	let numbers = $state([1, 2, 3]);
	let total = $derived.by(() => {
		let total = 0;
		for (const n of numbers) {
			total += n;
		}
		return total;
	});
</script>

<button onclick={() => numbers.push(numbers.length + 1)}>
	{numbers.join(' + ')} = {total}
</button>
```

## $effect
`$effect`
```svelte
<script>
	let size = $state(50);
	let color = $state('#ff3e00');

	let canvas;

	$effect(() => {
		// 只要 `color` 或 `size` 發生變化，這段代碼就會重新執行
		const context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = color;
		context.fillRect(0, 0, size, size);
	});
</script>

<canvas bind:this={canvas} width="100" height="100"></canvas>
```
好的！我來為您重新教學這份 **SvelteKit 快照功能** 的內容，用更白話的方式說明。

# 📸 SvelteKit 快照功能完整教學

## 🎯 什麼是快照功能？

想像一下，你正在寫一篇很長的日記，寫到一半突然有人叫你去吃飯。等你回來時，發現日記本被風吹翻了，你辛苦寫的內容都不見了！這種感覺是不是很沮喪？

**快照功能**就是為了解決這個問題而生的。它就像是你日記本的「自動儲存」功能，會在適當的時候偷偷把你寫的內容備份起來，這樣即使發生意外，你也不會失去辛苦的成果。

### 網頁上的類似問題

在使用網站時，我們經常會遇到這些困擾：
- 正在填寫一個很長的表單，不小心按到「重新整理」
- 寫了一大段評論，點到其他頁面後回來發現內容消失了
- 在購物網站選了很多商品，瀏覽其他頁面後購物車變空了
- 調整了網站的設定選項，離開後回來發現要重新選擇

### 快照如何解決這些問題？

快照功能就像一個貼心的助手，它會：
1. **默默觀察**：監控你在頁面上的操作和輸入
2. **適時備份**：當你要離開頁面時，快速保存重要資訊
3. **智能還原**：當你回到頁面時，自動恢復之前的狀態

---

## 🧠 快照的運作原理

### 兩個關鍵時刻

**capture（捕捉）時刻**
- 發生時機：你即將離開目前頁面的瞬間
- 做什麼：把重要的資料「拍照」存起來
- 比喻：就像相機的快門，瞬間記錄當下的狀態

**restore（恢復）時刻**
- 發生時機：你回到這個頁面的時候
- 做什麼：把之前「拍照」的資料重新載入
- 比喻：就像翻開相簿，重新看到之前的畫面

### 資料儲存的地方

快照的資料會存在瀏覽器的 `sessionStorage` 中：
- **會話級別**：關閉瀏覽器分頁後就會清除
- **自動管理**：SvelteKit 會自動處理儲存和讀取
- **安全性**：資料只存在用戶的瀏覽器中，不會傳送到伺服器

---

## 📝 基本使用方式

### 最簡單的快照範例

```svelte
<script>
	let comment = $state('');

	// 設定快照機制
	export const snapshot = {
		capture: () => comment,
		restore: (value) => comment = value
	};
</script>

<form method="POST">
	<label for="comment">寫下你的評論</label>
	<textarea id="comment" bind:value={comment}></textarea>
	<button type="submit">發表評論</button>
</form>
```

### 這個範例做了什麼？

1. **capture 函數**：當用戶離開頁面時，把 `comment` 變數的內容保存起來
2. **restore 函數**：當用戶回到頁面時，把保存的內容重新設定給 `comment` 變數
3. **結果**：即使用戶不小心離開頁面，回來時評論內容還在！

---

## 🏗️ 更複雜的快照應用

### 多個欄位的表單

```svelte
<script>
	let userInfo = $state({
		name: '',
		email: '',
		bio: '',
		preferences: {
			theme: 'light',
			notifications: true,
			language: 'zh-tw'
		}
	});

	export const snapshot = {
		capture: () => userInfo,
		restore: (value) => userInfo = value
	};
</script>

<form method="POST">
	<div>
		<label>姓名</label>
		<input type="text" bind:value={userInfo.name} />
	</div>
	
	<div>
		<label>Email</label>
		<input type="email" bind:value={userInfo.email} />
	</div>
	
	<div>
		<label>個人簡介</label>
		<textarea bind:value={userInfo.bio}></textarea>
	</div>
	
	<div>
		<label>主題</label>
		<select bind:value={userInfo.preferences.theme}>
			<option value="light">淺色</option>
			<option value="dark">深色</option>
		</select>
	</div>
	
	<div>
		<label>
			<input 
				type="checkbox" 
				bind:checked={userInfo.preferences.notifications}
			/>
			接收通知
		</label>
	</div>
	
	<button type="submit">儲存設定</button>
</form>
```

### 購物車狀態保持

```svelte
<script>
	let cartItems = $state([]);
	let selectedFilters = $state({
		category: '',
		priceRange: [0, 1000],
		inStock: true
	});

	export const snapshot = {
		capture: () => ({
			items: cartItems,
			filters: selectedFilters
		}),
		restore: (value) => {
			cartItems = value.items || [];
			selectedFilters = value.filters || {
				category: '',
				priceRange: [0, 1000],
				inStock: true
			};
		}
	};

	function addToCart(product) {
		cartItems = [...cartItems, product];
	}
</script>

<div>
	<h2>購物</h2>
	
	<!-- 篩選器 -->
	<div>
		<select bind:value={selectedFilters.category}>
			<option value="">所有分類</option>
			<option value="electronics">電子產品</option>
			<option value="books">書籍</option>
		</select>
		
		<label>
			<input 
				type="checkbox" 
				bind:checked={selectedFilters.inStock}
			/>
			只顯示有庫存的商品
		</label>
	</div>
	
	<!-- 購物車 -->
	<div>
		<h3>購物車 ({cartItems.length} 個商品)</h3>
		{#each cartItems as item}
			<div>{item.name} - ${item.price}</div>
		{/each}
	</div>
</div>
```

---

## ⚠️ 快照的限制與注意事項

### 資料大小限制

**為什麼有大小限制？**
- 快照資料存在 `sessionStorage` 中，空間有限（通常約 5-10MB）
- 太大的資料會影響網頁效能
- 序列化和反序列化大型物件很耗時

**什麼算是「太大」？**
- 大型圖片或檔案
- 包含數千筆記錄的陣列
- 深層巢狀的複雜物件

**建議做法：**
```svelte
<script>
	let formData = $state({ name: '', email: '' });
	let heavyData = $state([]); // 大型資料
	
	// 只快照重要的表單資料，不包含大型資料
	export const snapshot = {
		capture: () => formData, // 不包含 heavyData
		restore: (value) => formData = value
	};
</script>
```

### JSON 序列化限制

**什麼資料可以快照？**
- 字串、數字、布林值
- 一般的陣列和物件
- `null` 和 `undefined`

**什麼資料無法快照？**
- 函數
- DOM 元素
- Date 物件（需要特殊處理）
- 正則表達式
- Map、Set 等特殊物件

**處理特殊資料類型：**
```svelte
<script>
	let selectedDate = $state(new Date());
	let settings = $state(new Map());
	
	export const snapshot = {
		capture: () => ({
			date: selectedDate.toISOString(), // 轉換成字串
			settings: Array.from(settings.entries()) // 轉換成陣列
		}),
		restore: (value) => {
			selectedDate = new Date(value.date); // 轉換回 Date
			settings = new Map(value.settings); // 轉換回 Map
		}
	};
</script>
```

---

## 🎯 實際應用場景

### 多步驟表單

```svelte
<script>
	let currentStep = $state(1);
	let surveyData = $state({
		personal: { name: '', age: '', city: '' },
		preferences: { hobbies: [], experience: '' },
		feedback: { rating: 5, comments: '' }
	});

	export const snapshot = {
		capture: () => ({ step: currentStep, data: surveyData }),
		restore: (value) => {
			currentStep = value.step || 1;
			surveyData = value.data || {
				personal: { name: '', age: '', city: '' },
				preferences: { hobbies: [], experience: '' },
				feedback: { rating: 5, comments: '' }
			};
		}
	};

	function nextStep() {
		if (currentStep < 3) currentStep++;
	}

	function prevStep() {
		if (currentStep > 1) currentStep--;
	}
</script>

<div>
	<h2>問卷調查 - 第 {currentStep} 步，共 3 步</h2>
	
	{#if currentStep === 1}
		<div>
			<h3>個人資料</h3>
			<input bind:value={surveyData.personal.name} placeholder="姓名" />
			<input bind:value={surveyData.personal.age} placeholder="年齡" />
			<input bind:value={surveyData.personal.city} placeholder="居住城市" />
		</div>
	{:else if currentStep === 2}
		<div>
			<h3>偏好設定</h3>
			<textarea bind:value={surveyData.preferences.experience} placeholder="相關經驗"></textarea>
		</div>
	{:else if currentStep === 3}
		<div>
			<h3>意見回饋</h3>
			<input type="range" bind:value={surveyData.feedback.rating} min="1" max="10" />
			<textarea bind:value={surveyData.feedback.comments} placeholder="其他意見"></textarea>
		</div>
	{/if}
	
	<div>
		{#if currentStep > 1}
			<button onclick={prevStep}>上一步</button>
		{/if}
		{#if currentStep < 3}
			<button onclick={nextStep}>下一步</button>
		{:else}
			<button type="submit">提交問卷</button>
		{/if}
	</div>
</div>
```

### 文章編輯器

```svelte
<script>
	let article = $state({
		title: '',
		content: '',
		tags: [],
		isDraft: true,
		lastSaved: null
	});

	export const snapshot = {
		capture: () => ({
			title: article.title,
			content: article.content,
			tags: article.tags,
			isDraft: article.isDraft
		}),
		restore: (value) => {
			article.title = value.title || '';
			article.content = value.content || '';
			article.tags = value.tags || [];
			article.isDraft = value.isDraft !== undefined ? value.isDraft : true;
		}
	};

	function addTag(tag) {
		if (tag && !article.tags.includes(tag)) {
			article.tags = [...article.tags, tag];
		}
	}
</script>

<div>
	<h2>撰寫文章</h2>
	
	<input 
		bind:value={article.title} 
		placeholder="文章標題"
	/>
	
	<textarea 
		bind:value={article.content} 
		placeholder="開始寫作..."
		rows="20"
	></textarea>
	
	<div>
		<input 
			type="text" 
			placeholder="新增標籤"
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					addTag(e.target.value);
					e.target.value = '';
				}
			}}
		/>
		
		<div>
			{#each article.tags as tag}
				<span>{tag}</span>
			{/each}
		</div>
	</div>
	
	<div>
		<label>
			<input type="checkbox" bind:checked={article.isDraft} />
			儲存為草稿
		</label>
	</div>
	
	<button>
		{article.isDraft ? '儲存草稿' : '發表文章'}
	</button>
</div>
```

---

## 💡 進階技巧

### 條件式快照

```svelte
<script>
	let formData = $state({ name: '', email: '' });
	let hasUnsavedChanges = $state(false);
	
	// 只有在有未儲存變更時才進行快照
	export const snapshot = {
		capture: () => hasUnsavedChanges ? formData : null,
		restore: (value) => {
			if (value) {
				formData = value;
				hasUnsavedChanges = true;
			}
		}
	};
	
	// 監控表單變更
	$effect(() => {
		// 當表單資料改變時，標記為有未儲存變更
		hasUnsavedChanges = formData.name !== '' || formData.email !== '';
	});
</script>
```

### 有過期時間的快照

```svelte
<script>
	let data = $state('');
	
	export const snapshot = {
		capture: () => ({
			data,
			timestamp: Date.now()
		}),
		restore: (value) => {
			const oneHour = 60 * 60 * 1000;
			const now = Date.now();
			
			// 如果快照超過一小時就不恢復
			if (value && (now - value.timestamp) < oneHour) {
				data = value.data;
			}
		}
	};
</script>
```

---

## 🎯 最佳實踐建議

### 1. 選擇性快照

**只快照重要的用戶輸入**：
- 表單欄位的內容
- 用戶的選擇和偏好
- 臨時的工作狀態

**不要快照**：
- 從伺服器載入的資料
- 計算結果
- 純展示用的資訊

### 2. 資料清理

```svelte
<script>
	let formData = $state({
		name: '',
		email: '',
		tempData: null, // 臨時資料，不需要快照
		_internal: {} // 內部狀態，不需要快照
	});
	
	export const snapshot = {
		capture: () => ({
			name: formData.name,
			email: formData.email
			// 不包含 tempData 和 _internal
		}),
		restore: (value) => {
			formData.name = value.name || '';
			formData.email = value.email || '';
		}
	};
</script>
```

### 3. 錯誤處理

```svelte
<script>
	let data = $state({});
	
	export const snapshot = {
		capture: () => data,
		restore: (value) => {
			try {
				// 驗證恢復的資料是否有效
				if (value && typeof value === 'object') {
					data = { ...data, ...value };
				}
			} catch (error) {
				console.warn('快照恢復失敗:', error);
				// 使用預設值
				data = {};
			}
		}
	};
</script>
```

---

## 🎯 總結重點

### 快照功能的核心價值

1. **提升用戶體驗**：避免重複填寫表單的挫折感
2. **減少資料丟失**：意外離開頁面不會失去工作成果
3. **增加完成率**：用戶更願意完成複雜的任務

### 使用時機

**適合使用快照的情況**：
- 複雜的表單填寫
- 多步驟的流程
- 創作型內容（文章、評論等）
- 個人化設定

**不需要快照的情況**：
- 簡單的搜尋頁面
- 純展示的內容頁面
- 已經有自動儲存功能的頁面

### 記住這些要點

1. **保持輕量**：只快照真正重要的資料
2. **考慮隱私**：敏感資訊要謹慎處理
3. **測試重要**：確保快照和恢復都正常運作
4. **用戶友善**：讓用戶知道他們的資料是安全的

快照功能就像是網站的「自動儲存」，它默默地保護著用戶的努力成果。雖然功能簡單，但對用戶體驗的提升卻是巨大的！
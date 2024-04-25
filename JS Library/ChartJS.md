# VUE (vue-chartjs)
### Install
```zsh
yarn add vue-chartjs chart.js
# or
npm i vue-chartjs chart.js
```

### example
```vue
<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const dataa = ref({
  labels: ['January', 'February', 'March'],
  datasets: [{ data: [40, 20, 12] }]
})

const options:ChartProps['options'] = {
  responsive: true,
  plugins: {
    tooltip: {
      enabled: false // 不顯示工具提示框
    },
    legend: {
      display: false // 不顯示label
    }
  }
}
</script>

<template>
  <Bar :data="data" :options="options" />
</template>
```

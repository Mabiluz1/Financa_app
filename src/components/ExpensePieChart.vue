<template>
  <div class="chart-wrapper">
    <div v-if="!hasData" class="empty-state">
      Nenhuma despesa encontrada para o período selecionado.
    </div>
    <apexchart
      v-else
      type="pie"
      height="320"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  data: { categoria: string; total: number }[];
}>();

const { isDarkMode } = useTheme();

const hasData = computed(() => props.data.length > 0 && props.data.some((d) => d.total > 0));
const labels = computed(() => props.data.map((d) => d.categoria));
const series = computed(() => props.data.map((d) => Number(d.total)));

const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

const chartOptions = computed(() => ({
  chart: {
    type: 'pie',
    toolbar: { show: false },
    foreColor: isDarkMode.value ? '#e5e7eb' : '#374151',
    background: 'transparent'
  },
  labels: labels.value,
  colors: palette,
  legend: {
    position: 'bottom'
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(1)}%`
  },
  tooltip: {
    theme: isDarkMode.value ? 'dark' : 'light',
    y: {
      formatter: (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }
  },
  stroke: {
    colors: [isDarkMode.value ? '#111827' : '#ffffff']
  },
  noData: {
    text: 'Sem dados'
  }
}));
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  min-height: 120px;
}
</style>

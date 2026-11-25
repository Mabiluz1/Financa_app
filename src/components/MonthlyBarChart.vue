<template>
  <div class="chart-wrapper">
    <div v-if="!hasData" class="empty-state">
      Nenhum lançamento encontrado para o período selecionado.
    </div>
    <apexchart
      v-else
      type="bar"
      height="340"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '@/composables/useTheme';

const props = defineProps<{
  data: { mes: string; receitas: number; despesas: number }[];
}>();

const { isDarkMode } = useTheme();

const hasData = computed(() => props.data.length > 0);

function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  const date = new Date(y, m - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(date);
}

const categories = computed(() => props.data.map((d) => formatMonthLabel(d.mes)));
const series = computed(() => [
  { name: 'Receitas', data: props.data.map((d) => Number(d.receitas)) },
  { name: 'Despesas', data: props.data.map((d) => Number(d.despesas)) }
]);

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    foreColor: isDarkMode.value ? '#e5e7eb' : '#374151',
    background: 'transparent'
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '55%'
    }
  },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: {
    categories: categories.value
  },
  yaxis: {
    labels: {
      formatter: (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(val)
    }
  },
  colors: ['#16a34a', '#dc2626'],
  legend: { position: 'top' },
  tooltip: {
    theme: isDarkMode.value ? 'dark' : 'light',
    y: {
      formatter: (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    }
  },
  noData: { text: 'Sem dados' }
}));
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  min-height: 120px;
}
</style>

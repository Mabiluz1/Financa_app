import { computed, ref } from 'vue';
import type { Despesa, DespesaInput, PeriodoFiltro, Receita, ReceitaInput } from '@/types/financeiro';
import * as receitasService from '@/services/receitasService';
import * as despesasService from '@/services/despesasService';
import { toISODate } from '@/utils/format';
import { useAuth } from './useAuth';

const receitas = ref<Receita[]>([]);
const despesas = ref<Despesa[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);
const periodoFiltro = ref<PeriodoFiltro>({ tipo: 'todos' });

function inRange(dateStr: string, start: string, end: string): boolean {
  return dateStr >= start && dateStr <= end;
}

function getPeriodoRange(filtro: PeriodoFiltro): { start?: string; end?: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based

  switch (filtro.tipo) {
    case 'todos':
      return {};
    case 'mes_atual': {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0);
      return { start: toISODate(start), end: toISODate(end) };
    }
    case 'mes_anterior': {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      return { start: toISODate(start), end: toISODate(end) };
    }
    case 'ano_atual': {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31);
      return { start: toISODate(start), end: toISODate(end) };
    }
    case 'personalizado': {
      if (filtro.inicio && filtro.fim) {
        return filtro.inicio <= filtro.fim
          ? { start: filtro.inicio, end: filtro.fim }
          : { start: filtro.fim, end: filtro.inicio };
      }
      return {};
    }
    default:
      return {};
  }
}

function filterByPeriodo<T extends { data: string }>(items: T[], filtro: PeriodoFiltro): T[] {
  const { start, end } = getPeriodoRange(filtro);
  if (!start || !end) return items;
  return items.filter((item) => inRange(item.data, start, end));
}

export function useFinance() {
  const { user } = useAuth();

  const receitasFiltradas = computed(() => filterByPeriodo(receitas.value, periodoFiltro.value));
  const despesasFiltradas = computed(() => filterByPeriodo(despesas.value, periodoFiltro.value));

  const totalReceitas = computed(() =>
    receitasFiltradas.value.reduce((acc, item) => acc + Number(item.valor || 0), 0)
  );
  const totalDespesas = computed(() =>
    despesasFiltradas.value.reduce((acc, item) => acc + Number(item.valor || 0), 0)
  );
  const saldoAtual = computed(() => totalReceitas.value - totalDespesas.value);
  const totalLancamentos = computed(() => receitasFiltradas.value.length + despesasFiltradas.value.length);

  const percentualDespesas = computed(() => {
    if (totalReceitas.value <= 0) return null;
    return (totalDespesas.value / totalReceitas.value) * 100;
  });

  const despesasPorCategoria = computed(() => {
    const map = new Map<string, number>();
    for (const d of despesasFiltradas.value) {
      map.set(d.categoria, (map.get(d.categoria) || 0) + Number(d.valor || 0));
    }
    return Array.from(map.entries())
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);
  });

  const maiorCategoriaGasto = computed(() => {
    if (despesasPorCategoria.value.length === 0) return null;
    return despesasPorCategoria.value[0];
  });

  const comparativoMensal = computed(() => {
    const months = new Map<string, { receitas: number; despesas: number }>();
    const ensure = (key: string) => {
      if (!months.has(key)) months.set(key, { receitas: 0, despesas: 0 });
      return months.get(key)!;
    };
    for (const r of receitasFiltradas.value) {
      const key = r.data?.slice(0, 7); // YYYY-MM
      if (key) ensure(key).receitas += Number(r.valor || 0);
    }
    for (const d of despesasFiltradas.value) {
      const key = d.data?.slice(0, 7);
      if (key) ensure(key).despesas += Number(d.valor || 0);
    }
    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, valores]) => ({ mes, ...valores }));
  });

  async function carregarDados(force = false) {
    if (!user.value) return;
    loading.value = true;
    errorMessage.value = null;
    try {
      const [recRes, despRes] = await Promise.all([
        receitasService.listReceitas(user.value.id),
        despesasService.listDespesas(user.value.id)
      ]);
      if (recRes.error) throw new Error(recRes.error);
      if (despRes.error) throw new Error(despRes.error);
      receitas.value = recRes.data ?? [];
      despesas.value = despRes.data ?? [];
    } catch (err) {
      errorMessage.value = err instanceof Error ? err.message : 'Erro ao carregar dados financeiros.';
    } finally {
      loading.value = false;
    }
  }

  function setPeriodoFiltro(filtro: PeriodoFiltro) {
    periodoFiltro.value = filtro;
  }

  async function adicionarReceita(input: ReceitaInput) {
    if (!user.value) return { error: 'Usuário não autenticado.' };
    const res = await receitasService.createReceita(user.value.id, input);
    if (!res.error) await carregarDados();
    return res;
  }

  async function atualizarReceita(id: string, input: ReceitaInput) {
    if (!user.value) return { error: 'Usuário não autenticado.' };
    const res = await receitasService.updateReceita(id, user.value.id, input);
    if (!res.error) await carregarDados();
    return res;
  }

  async function removerReceita(id: string) {
    if (!user.value) return { error: 'Usuário não autenticado.' };
    const res = await receitasService.deleteReceita(id, user.value.id);
    if (!res.error) await carregarDados();
    return res;
  }

  async function adicionarDespesa(input: DespesaInput) {
    if (!user.value) return { error: 'Usuário não autenticado.' };
    const res = await despesasService.createDespesa(user.value.id, input);
    if (!res.error) await carregarDados();
    return res;
  }

  async function atualizarDespesa(id: string, input: DespesaInput) {
    if (!user.value) return { error: 'Usuário não autenticado.' };
    const res = await despesasService.updateDespesa(id, user.value.id, input);
    if (!res.error) await carregarDados();
    return res;
  }

  async function removerDespesa(id: string) {
    if (!user.value) return { error: 'Usuário não autenticado.' };
    const res = await despesasService.deleteDespesa(id, user.value.id);
    if (!res.error) await carregarDados();
    return res;
  }

  function limparDados() {
    receitas.value = [];
    despesas.value = [];
    errorMessage.value = null;
  }

  return {
    receitas,
    despesas,
    receitasFiltradas,
    despesasFiltradas,
    loading,
    errorMessage,
    periodoFiltro,
    totalReceitas,
    totalDespesas,
    saldoAtual,
    totalLancamentos,
    percentualDespesas,
    despesasPorCategoria,
    maiorCategoriaGasto,
    comparativoMensal,
    carregarDados,
    setPeriodoFiltro,
    adicionarReceita,
    atualizarReceita,
    removerReceita,
    adicionarDespesa,
    atualizarDespesa,
    removerDespesa,
    limparDados
  };
}

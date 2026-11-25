<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Despesas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content pulling-text="Puxe para atualizar" refreshing-spinner="crescent" />
      </ion-refresher>

      <period-filter />

      <financial-card
        title="Total de despesas"
        :value="formatCurrencyBRL(totalDespesas)"
        subtitle="Soma das despesas no período selecionado"
        :icon="trendingDownOutline"
        variant="negative"
      />

      <div class="section-header">
        <h2 class="section-title">Despesas cadastradas</h2>
      </div>

      <ion-card v-if="pageError">
        <ion-card-content class="text-negative">{{ pageError }}</ion-card-content>
      </ion-card>

      <ion-spinner v-if="loading && despesasFiltradas.length === 0" name="crescent" class="center-spinner" />

      <transaction-list
        v-else
        :items="despesasFiltradas"
        tipo="despesa"
        empty-message="Nenhuma despesa cadastrada no período selecionado."
        @edit="abrirEdicao"
        @delete="confirmarExclusao"
      />

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="abrirNova" aria-label="Adicionar nova despesa">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>

      <ion-modal :is-open="modalAberto" @didDismiss="fecharModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editando ? 'Editar despesa' : 'Nova despesa' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="fecharModal">Fechar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <transaction-form
            :categorias="CATEGORIAS_DESPESA"
            :initial-value="formInicial"
            :loading="salvando"
            :submit-label="editando ? 'Salvar alterações' : 'Cadastrar despesa'"
            :show-cancel="true"
            @submit="salvar"
            @cancel="fecharModal"
          />
        </ion-content>
      </ion-modal>

      <ion-alert
        :is-open="alertExcluirAberto"
        header="Excluir despesa"
        message="Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita."
        :buttons="alertExcluirButtons"
        @didDismiss="alertExcluirAberto = false"
      />

      <ion-toast
        :is-open="toast.open"
        :message="toast.message"
        :color="toast.color"
        :duration="2500"
        position="bottom"
        @didDismiss="toast.open = false"
      />
      <ion-loading :is-open="loading && despesasFiltradas.length > 0" message="Atualizando..." />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonLoading,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar
} from '@ionic/vue';
import { addOutline, trendingDownOutline } from 'ionicons/icons';
import { computed, onMounted, reactive, ref } from 'vue';
import FinancialCard from '@/components/FinancialCard.vue';
import PeriodFilter from '@/components/PeriodFilter.vue';
import TransactionForm, { type TransactionFormValue } from '@/components/TransactionForm.vue';
import TransactionList from '@/components/TransactionList.vue';
import { CATEGORIAS_DESPESA, type Despesa, type DespesaInput } from '@/types/financeiro';
import { formatCurrencyBRL } from '@/utils/format';
import { useFinance } from '@/composables/useFinance';

const {
  despesasFiltradas,
  totalDespesas,
  loading,
  errorMessage,
  carregarDados,
  adicionarDespesa,
  atualizarDespesa,
  removerDespesa
} = useFinance();

const modalAberto = ref(false);
const editando = ref<Despesa | null>(null);
const salvando = ref(false);
const alertExcluirAberto = ref(false);
const despesaParaExcluir = ref<Despesa | null>(null);
const toast = reactive({ open: false, message: '', color: 'success' as 'success' | 'danger' });

const pageError = computed(() => errorMessage.value);

const formInicial = computed(() => {
  if (!editando.value) return undefined;
  return {
    descricao: editando.value.descricao,
    valor: Number(editando.value.valor),
    categoria: editando.value.categoria,
    data: editando.value.data
  };
});

onMounted(async () => {
  await carregarDados();
});

function abrirNova() {
  editando.value = null;
  modalAberto.value = true;
}

function abrirEdicao(item: { id: string }) {
  const despesa = despesasFiltradas.value.find((d) => d.id === item.id) ?? null;
  editando.value = despesa;
  modalAberto.value = true;
}

function fecharModal() {
  modalAberto.value = false;
  editando.value = null;
}

async function salvar(value: TransactionFormValue) {
  const input: DespesaInput = {
    descricao: value.descricao,
    valor: value.valor,
    categoria: value.categoria as DespesaInput['categoria'],
    data: value.data
  };
  salvando.value = true;
  try {
    const res = editando.value
      ? await atualizarDespesa(editando.value.id, input)
      : await adicionarDespesa(input);
    if (res.error) {
      toast.message = res.error;
      toast.color = 'danger';
      toast.open = true;
      return;
    }
    toast.message = editando.value ? 'Despesa atualizada com sucesso.' : 'Despesa cadastrada com sucesso.';
    toast.color = 'success';
    toast.open = true;
    fecharModal();
  } finally {
    salvando.value = false;
  }
}

function confirmarExclusao(item: { id: string }) {
  const despesa = despesasFiltradas.value.find((d) => d.id === item.id) ?? null;
  despesaParaExcluir.value = despesa;
  alertExcluirAberto.value = true;
}

const alertExcluirButtons = [
  { text: 'Cancelar', role: 'cancel' },
  {
    text: 'Excluir',
    role: 'destructive',
    handler: () => {
      void excluirConfirmado();
    }
  }
];

async function excluirConfirmado() {
  if (!despesaParaExcluir.value) return;
  const res = await removerDespesa(despesaParaExcluir.value.id);
  if (res.error) {
    toast.message = res.error;
    toast.color = 'danger';
  } else {
    toast.message = 'Despesa excluída com sucesso.';
    toast.color = 'success';
  }
  toast.open = true;
  despesaParaExcluir.value = null;
}

async function handleRefresh(ev: CustomEvent) {
  await carregarDados();
  (ev.target as HTMLIonRefresherElement).complete();
}
</script>

<style scoped>
.section-header {
  margin-top: 16px;
}
.center-spinner {
  display: block;
  margin: 24px auto;
}
</style>

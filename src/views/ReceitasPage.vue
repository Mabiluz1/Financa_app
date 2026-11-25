<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Receitas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content pulling-text="Puxe para atualizar" refreshing-spinner="crescent" />
      </ion-refresher>

      <period-filter />

      <financial-card
        title="Total de receitas"
        :value="formatCurrencyBRL(totalReceitas)"
        subtitle="Soma das receitas no período selecionado"
        :icon="trendingUpOutline"
        variant="positive"
      />

      <div class="section-header">
        <h2 class="section-title">Receitas cadastradas</h2>
      </div>

      <ion-card v-if="pageError">
        <ion-card-content class="text-negative">{{ pageError }}</ion-card-content>
      </ion-card>

      <ion-spinner v-if="loading && receitasFiltradas.length === 0" name="crescent" class="center-spinner" />

      <transaction-list
        v-else
        :items="receitasFiltradas"
        tipo="receita"
        empty-message="Nenhuma receita cadastrada no período selecionado."
        @edit="abrirEdicao"
        @delete="confirmarExclusao"
      />

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="abrirNova" aria-label="Adicionar nova receita">
          <ion-icon :icon="addOutline" />
        </ion-fab-button>
      </ion-fab>

      <ion-modal :is-open="modalAberto" @didDismiss="fecharModal">
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editando ? 'Editar receita' : 'Nova receita' }}</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="fecharModal">Fechar</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <transaction-form
            :categorias="CATEGORIAS_RECEITA"
            :initial-value="formInicial"
            :loading="salvando"
            :submit-label="editando ? 'Salvar alterações' : 'Cadastrar receita'"
            :show-cancel="true"
            @submit="salvar"
            @cancel="fecharModal"
          />
        </ion-content>
      </ion-modal>

      <ion-alert
        :is-open="alertExcluirAberto"
        header="Excluir receita"
        message="Tem certeza que deseja excluir esta receita? Esta ação não pode ser desfeita."
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
      <ion-loading :is-open="loading && receitasFiltradas.length > 0" message="Atualizando..." />
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
import { addOutline, trendingUpOutline } from 'ionicons/icons';
import { computed, onMounted, reactive, ref } from 'vue';
import FinancialCard from '@/components/FinancialCard.vue';
import PeriodFilter from '@/components/PeriodFilter.vue';
import TransactionForm, { type TransactionFormValue } from '@/components/TransactionForm.vue';
import TransactionList from '@/components/TransactionList.vue';
import { CATEGORIAS_RECEITA, type Receita, type ReceitaInput } from '@/types/financeiro';
import { formatCurrencyBRL } from '@/utils/format';
import { useFinance } from '@/composables/useFinance';

const {
  receitasFiltradas,
  totalReceitas,
  loading,
  errorMessage,
  carregarDados,
  adicionarReceita,
  atualizarReceita,
  removerReceita
} = useFinance();

const modalAberto = ref(false);
const editando = ref<Receita | null>(null);
const salvando = ref(false);
const alertExcluirAberto = ref(false);
const receitaParaExcluir = ref<Receita | null>(null);
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
  const receita = receitasFiltradas.value.find((r) => r.id === item.id) ?? null;
  editando.value = receita;
  modalAberto.value = true;
}

function fecharModal() {
  modalAberto.value = false;
  editando.value = null;
}

async function salvar(value: TransactionFormValue) {
  const input: ReceitaInput = {
    descricao: value.descricao,
    valor: value.valor,
    categoria: value.categoria as ReceitaInput['categoria'],
    data: value.data
  };
  salvando.value = true;
  try {
    const res = editando.value
      ? await atualizarReceita(editando.value.id, input)
      : await adicionarReceita(input);
    if (res.error) {
      toast.message = res.error;
      toast.color = 'danger';
      toast.open = true;
      return;
    }
    toast.message = editando.value ? 'Receita atualizada com sucesso.' : 'Receita cadastrada com sucesso.';
    toast.color = 'success';
    toast.open = true;
    fecharModal();
  } finally {
    salvando.value = false;
  }
}

function confirmarExclusao(item: { id: string }) {
  const receita = receitasFiltradas.value.find((r) => r.id === item.id) ?? null;
  receitaParaExcluir.value = receita;
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
  if (!receitaParaExcluir.value) return;
  const res = await removerReceita(receitaParaExcluir.value.id);
  if (res.error) {
    toast.message = res.error;
    toast.color = 'danger';
  } else {
    toast.message = 'Receita excluída com sucesso.';
    toast.color = 'success';
  }
  toast.open = true;
  receitaParaExcluir.value = null;
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

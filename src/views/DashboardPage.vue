<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content pulling-text="Puxe para atualizar" refreshing-spinner="crescent" />
      </ion-refresher>

      <period-filter />

      <ion-card v-if="pageError">
        <ion-card-content class="text-negative">{{ pageError }}</ion-card-content>
      </ion-card>

      <div class="cards-grid">
        <financial-card
          title="Total de receitas"
          :value="formatCurrencyBRL(totalReceitas)"
          :icon="trendingUpOutline"
          variant="positive"
        />
        <financial-card
          title="Total de despesas"
          :value="formatCurrencyBRL(totalDespesas)"
          :icon="trendingDownOutline"
          variant="negative"
        />
        <financial-card
          title="Saldo atual"
          :value="formatCurrencyBRL(saldoAtual)"
          :icon="walletOutline"
          :variant="saldoVariant"
          :subtitle="saldoSubtitle"
        />
      </div>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Distribuição das despesas por categoria</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <expense-pie-chart :data="despesasPorCategoria" />
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Receitas x Despesas por mês</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <monthly-bar-chart :data="comparativoMensal" />
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Indicadores financeiros</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list lines="full">
            <ion-item>
              <ion-label>
                <h2>Maior categoria de gasto</h2>
                <p v-if="maiorCategoriaGasto">
                  {{ maiorCategoriaGasto.categoria }} — {{ formatCurrencyBRL(maiorCategoriaGasto.total) }}
                </p>
                <p v-else class="text-muted">Nenhuma despesa no período selecionado.</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h2>Quantidade total de lançamentos</h2>
                <p>{{ totalLancamentos }} lançamento(s) (receitas + despesas)</p>
              </ion-label>
            </ion-item>

            <ion-item lines="none">
              <ion-label>
                <h2>Percentual de despesas em relação às receitas</h2>
                <p v-if="percentualDespesas !== null">{{ percentualDespesas.toFixed(1).replace('.', ',') }}%</p>
                <p v-else class="text-muted">Não disponível (total de receitas igual a zero).</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-spinner v-if="loading && !dadosCarregados" name="crescent" class="center-spinner" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { trendingDownOutline, trendingUpOutline, walletOutline } from 'ionicons/icons';
import { computed, onMounted, ref, watch } from 'vue';
import FinancialCard from '@/components/FinancialCard.vue';
import PeriodFilter from '@/components/PeriodFilter.vue';
import ExpensePieChart from '@/components/ExpensePieChart.vue';
import MonthlyBarChart from '@/components/MonthlyBarChart.vue';
import { formatCurrencyBRL } from '@/utils/format';
import { useFinance } from '@/composables/useFinance';
import { useAuth } from '@/composables/useAuth';

const {
  totalReceitas,
  totalDespesas,
  saldoAtual,
  totalLancamentos,
  percentualDespesas,
  despesasPorCategoria,
  maiorCategoriaGasto,
  comparativoMensal,
  loading,
  errorMessage,
  carregarDados
} = useFinance();
const { user } = useAuth();

const dadosCarregados = ref(false);
const pageError = computed(() => errorMessage.value);

const saldoVariant = computed(() => {
  if (saldoAtual.value > 0) return 'positive';
  if (saldoAtual.value < 0) return 'negative';
  return 'neutral';
});

const saldoSubtitle = computed(() => {
  if (saldoAtual.value > 0) return 'Saldo positivo no período';
  if (saldoAtual.value < 0) return 'Saldo negativo no período';
  return 'Saldo equilibrado no período';
});

async function ensureData() {
  await carregarDados();
  dadosCarregados.value = true;
}

onMounted(async () => {
  await ensureData();
});

watch(
  () => user.value?.id,
  async (id, prev) => {
    if (id && id !== prev) {
      await ensureData();
    }
  }
);

async function handleRefresh(ev: CustomEvent) {
  await carregarDados();
  (ev.target as HTMLIonRefresherElement).complete();
}
</script>

<style scoped>
.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
@media (min-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.center-spinner {
  display: block;
  margin: 24px auto;
}
</style>

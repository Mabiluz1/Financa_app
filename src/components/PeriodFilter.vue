<template>
  <ion-card class="period-filter">
    <ion-card-content>
      <ion-item lines="none">
        <ion-select
          label="Período"
          label-placement="stacked"
          interface="popover"
          :value="periodoFiltro.tipo"
          @ionChange="onTipoChange"
        >
          <ion-select-option value="todos">Todos os registros</ion-select-option>
          <ion-select-option value="mes_atual">Mês atual</ion-select-option>
          <ion-select-option value="mes_anterior">Mês anterior</ion-select-option>
          <ion-select-option value="ano_atual">Ano atual</ion-select-option>
          <ion-select-option value="personalizado">Período personalizado</ion-select-option>
        </ion-select>
      </ion-item>

      <div v-if="periodoFiltro.tipo === 'personalizado'" class="custom-range">
        <ion-item>
          <ion-input
            label="Data inicial"
            label-placement="stacked"
            type="date"
            :value="inicio"
            @ionInput="onInicioInput"
          />
        </ion-item>
        <ion-item>
          <ion-input
            label="Data final"
            label-placement="stacked"
            type="date"
            :value="fim"
            @ionInput="onFimInput"
          />
        </ion-item>
        <ion-note v-if="rangeError" color="danger" class="range-error">{{ rangeError }}</ion-note>
        <ion-button size="small" expand="block" fill="outline" class="ion-margin-top" @click="aplicarPersonalizado">
          Aplicar período
        </ion-button>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonButton, IonCard, IonCardContent, IonInput, IonItem, IonNote, IonSelect, IonSelectOption } from '@ionic/vue';
import { computed, ref, watch } from 'vue';
import { useFinance } from '@/composables/useFinance';
import type { PeriodoFiltroTipo } from '@/types/financeiro';

const { periodoFiltro, setPeriodoFiltro } = useFinance();

const inicio = ref(periodoFiltro.value.inicio || '');
const fim = ref(periodoFiltro.value.fim || '');
const rangeError = ref('');

watch(
  () => periodoFiltro.value,
  (val) => {
    if (val.tipo === 'personalizado') {
      inicio.value = val.inicio || inicio.value;
      fim.value = val.fim || fim.value;
    }
  },
  { deep: true }
);

function onTipoChange(ev: CustomEvent) {
  const tipo = ev.detail.value as PeriodoFiltroTipo;
  rangeError.value = '';
  if (tipo === 'personalizado') {
    setPeriodoFiltro({ tipo, inicio: inicio.value || undefined, fim: fim.value || undefined });
  } else {
    setPeriodoFiltro({ tipo });
  }
}

function onInicioInput(ev: CustomEvent) {
  inicio.value = String(ev.detail.value || '');
}

function onFimInput(ev: CustomEvent) {
  fim.value = String(ev.detail.value || '');
}

function aplicarPersonalizado() {
  rangeError.value = '';
  if (!inicio.value || !fim.value) {
    rangeError.value = 'Informe a data inicial e a data final.';
    return;
  }
  if (inicio.value > fim.value) {
    rangeError.value = 'A data inicial não pode ser maior que a data final.';
    return;
  }
  setPeriodoFiltro({ tipo: 'personalizado', inicio: inicio.value, fim: fim.value });
}
</script>

<style scoped>
.period-filter {
  margin: 0 0 12px;
}
.custom-range {
  margin-top: 8px;
}
.range-error {
  display: block;
  margin: 4px 16px 0;
}
</style>

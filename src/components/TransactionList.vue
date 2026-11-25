<template>
  <div>
    <ion-list v-if="items.length > 0">
      <ion-item v-for="item in items" :key="item.id" lines="full">
        <ion-label class="ion-text-wrap">
          <h2>{{ item.descricao }}</h2>
          <p>{{ item.categoria }} • {{ formatDateBR(item.data) }}</p>
          <p :class="tipo === 'receita' ? 'text-positive' : 'text-negative'" class="valor-inline">
            {{ formatCurrencyBRL(Number(item.valor)) }}
          </p>
        </ion-label>
        <div slot="end" class="item-actions">
          <ion-button fill="clear" size="small" @click="$emit('edit', item)" :aria-label="`Editar ${item.descricao}`">
            <ion-icon slot="icon-only" :icon="createOutline" />
          </ion-button>
          <ion-button fill="clear" color="danger" size="small" @click="$emit('delete', item)" :aria-label="`Excluir ${item.descricao}`">
            <ion-icon slot="icon-only" :icon="trashOutline" />
          </ion-button>
        </div>
      </ion-item>
    </ion-list>

    <div v-else class="empty-state">
      {{ emptyMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon, IonItem, IonLabel, IonList } from '@ionic/vue';
import { createOutline, trashOutline } from 'ionicons/icons';
import { formatCurrencyBRL, formatDateBR } from '@/utils/format';

interface Item {
  id: string;
  descricao: string;
  categoria: string;
  data: string;
  valor: number | string;
}

withDefaults(
  defineProps<{
    items: Item[];
    tipo: 'receita' | 'despesa';
    emptyMessage?: string;
  }>(),
  {
    emptyMessage: 'Nenhum registro encontrado.'
  }
);

defineEmits<{
  (e: 'edit', item: Item): void;
  (e: 'delete', item: Item): void;
}>();
</script>

<style scoped>
.valor-inline {
  margin-top: 4px;
  font-weight: 600;
  font-size: 0.95rem;
}
.item-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
</style>

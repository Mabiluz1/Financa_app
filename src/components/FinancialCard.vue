<template>
  <ion-card class="financial-card" :class="variantClass">
    <ion-card-content>
      <div class="card-row">
        <div class="card-icon" v-if="icon">
          <ion-icon :icon="icon" />
        </div>
        <div class="card-text">
          <p class="card-title">{{ title }}</p>
          <h2 class="card-value">{{ value }}</h2>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonIcon } from '@ionic/vue';
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  variant?: 'positive' | 'negative' | 'neutral' | 'primary';
}>();

const variantClass = computed(() => {
  switch (props.variant) {
    case 'positive':
      return 'variant-positive';
    case 'negative':
      return 'variant-negative';
    case 'primary':
      return 'variant-primary';
    default:
      return 'variant-neutral';
  }
});
</script>

<style scoped>
.financial-card {
  margin: 0;
}
.card-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: rgba(16, 185, 129, 0.12);
  color: var(--ion-color-primary);
}
.card-title {
  margin: 0;
  font-size: 0.9rem;
  color: var(--app-muted);
}
.card-value {
  margin: 4px 0 0;
  font-size: 1.4rem;
  font-weight: 700;
}
.card-subtitle {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: var(--app-muted);
}
.variant-positive .card-value { color: var(--app-positive); }
.variant-negative .card-value { color: var(--app-negative); }
.variant-primary .card-value { color: var(--ion-color-primary); }
.variant-neutral .card-value { color: var(--ion-text-color); }
</style>

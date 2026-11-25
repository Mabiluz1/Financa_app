<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/tabs/dashboard">
          <ion-icon :icon="speedometerOutline" />
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="receitas" href="/tabs/receitas">
          <ion-icon :icon="trendingUpOutline" />
          <ion-label>Receitas</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="despesas" href="/tabs/despesas">
          <ion-icon :icon="trendingDownOutline" />
          <ion-label>Despesas</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="configuracoes" href="/tabs/configuracoes">
          <ion-icon :icon="settingsOutline" />
          <ion-label>Configurações</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/vue';
import { settingsOutline, speedometerOutline, trendingDownOutline, trendingUpOutline } from 'ionicons/icons';
</script>

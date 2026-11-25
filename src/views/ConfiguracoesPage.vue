<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Configurações</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Conta</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item lines="none">
            <ion-icon :icon="personCircleOutline" slot="start" />
            <ion-label>
              <h2>Usuário autenticado</h2>
              <p>{{ userEmail || 'E-mail não disponível' }}</p>
            </ion-label>
          </ion-item>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Aparência</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-item lines="none">
            <ion-icon :icon="isDarkMode ? moonOutline : sunnyOutline" slot="start" />
            <ion-label>Modo escuro</ion-label>
            <ion-toggle :checked="isDarkMode" @ionChange="onToggleTheme" aria-label="Alternar modo escuro" />
          </ion-item>
          <p class="text-muted hint">A preferência é salva no dispositivo e mantida após fechar o aplicativo.</p>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Sessão</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-button expand="block" color="danger" fill="outline" @click="confirmLogout" :disabled="loggingOut">
            <ion-icon :icon="logOutOutline" slot="start" />
            {{ loggingOut ? 'Saindo...' : 'Sair da conta' }}
          </ion-button>
        </ion-card-content>
      </ion-card>

      <ion-alert
        :is-open="showLogoutAlert"
        header="Sair da conta"
        message="Deseja realmente encerrar sua sessão?"
        :buttons="logoutButtons"
        @didDismiss="showLogoutAlert = false"
      />

      <ion-toast
        :is-open="toast.open"
        :message="toast.message"
        :color="toast.color"
        :duration="2500"
        position="bottom"
        @didDismiss="toast.open = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonAlert,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToast,
  IonToggle,
  IonToolbar
} from '@ionic/vue';
import { logOutOutline, moonOutline, personCircleOutline, sunnyOutline } from 'ionicons/icons';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useTheme } from '@/composables/useTheme';
import { useFinance } from '@/composables/useFinance';

const router = useRouter();
const { user, logout } = useAuth();
const { isDarkMode, toggleTheme } = useTheme();
const { limparDados } = useFinance();

const userEmail = computed(() => user.value?.email ?? '');
const showLogoutAlert = ref(false);
const loggingOut = ref(false);
const toast = reactive({ open: false, message: '', color: 'success' as 'success' | 'danger' });

const logoutButtons = [
  { text: 'Cancelar', role: 'cancel' },
  {
    text: 'Sair',
    role: 'destructive',
    handler: () => {
      void handleLogout();
    }
  }
];

function confirmLogout() {
  showLogoutAlert.value = true;
}

async function onToggleTheme() {
  await toggleTheme();
}

async function handleLogout() {
  loggingOut.value = true;
  try {
    const result = await logout();
    if (result.error) {
      toast.message = result.error;
      toast.color = 'danger';
      toast.open = true;
      return;
    }
    limparDados();
    await router.replace('/login');
  } finally {
    loggingOut.value = false;
  }
}
</script>

<style scoped>
.hint {
  margin: 8px 4px 0;
  font-size: 0.9rem;
}
</style>

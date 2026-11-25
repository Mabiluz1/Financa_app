<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Entrar</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Controle Financeiro</ion-card-title>
            <ion-card-subtitle>Acesse sua conta para gerenciar suas finanças</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <form @submit.prevent="handleLogin">
              <ion-item>
                <ion-input
                  v-model="email"
                  label="E-mail"
                  label-placement="stacked"
                  type="email"
                  autocomplete="email"
                  inputmode="email"
                  placeholder="seu@email.com"
                  required
                />
              </ion-item>
              <ion-note v-if="errors.email" color="danger" class="field-error">{{ errors.email }}</ion-note>

              <ion-item>
                <ion-input
                  v-model="password"
                  label="Senha"
                  label-placement="stacked"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="Sua senha"
                  required
                />
                <ion-button fill="clear" slot="end" type="button" @click="showPassword = !showPassword" aria-label="Mostrar ou ocultar senha">
                  <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" slot="icon-only" />
                </ion-button>
              </ion-item>
              <ion-note v-if="errors.password" color="danger" class="field-error">{{ errors.password }}</ion-note>

              <ion-text v-if="formError" color="danger">
                <p class="form-error">{{ formError }}</p>
              </ion-text>

              <ion-button expand="block" type="submit" class="ion-margin-top" :disabled="loading">
                <ion-spinner v-if="loading" name="crescent" class="btn-spinner" />
                <span v-else>Entrar</span>
              </ion-button>

              <ion-button expand="block" fill="clear" router-link="/register" :disabled="loading">
                Criar conta
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </div>

      <ion-loading :is-open="loading" message="Entrando..." />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLoading,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/vue';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const route = useRoute();
const { login } = useAuth();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const formError = ref('');
const errors = reactive<{ email?: string; password?: string }>({});

function validate(): boolean {
  errors.email = undefined;
  errors.password = undefined;
  formError.value = '';

  const emailValue = email.value.trim();
  const passwordValue = password.value;

  if (!emailValue) {
    errors.email = 'Informe o e-mail.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!passwordValue) {
    errors.password = 'Informe a senha.';
  } else if (passwordValue.length < 6) {
    errors.password = 'A senha deve ter pelo menos 6 caracteres.';
  }

  return !errors.email && !errors.password;
}

async function handleLogin() {
  if (!validate()) return;
  loading.value = true;
  formError.value = '';
  try {
    const result = await login(email.value.trim(), password.value);
    if (result.error) {
      formError.value = result.error;
      return;
    }
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/tabs/dashboard';
    await router.replace(redirect);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 480px;
  margin: 0 auto;
  padding-top: 24px;
}
.field-error {
  display: block;
  margin: 4px 16px 8px;
  font-size: 0.85rem;
}
.form-error {
  margin: 12px 4px 0;
  text-align: center;
}
.btn-spinner {
  width: 20px;
  height: 20px;
}
</style>

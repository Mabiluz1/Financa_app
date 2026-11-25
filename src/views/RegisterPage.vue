<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/login" />
        </ion-buttons>
        <ion-title>Criar conta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-container">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Cadastro</ion-card-title>
            <ion-card-subtitle>Crie sua conta para começar a controlar suas finanças</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <form @submit.prevent="handleRegister">
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
                  autocomplete="new-password"
                  placeholder="Mínimo de 6 caracteres"
                  required
                />
                <ion-button fill="clear" slot="end" type="button" @click="showPassword = !showPassword" aria-label="Mostrar ou ocultar senha">
                  <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" slot="icon-only" />
                </ion-button>
              </ion-item>
              <ion-note v-if="errors.password" color="danger" class="field-error">{{ errors.password }}</ion-note>

              <ion-item>
                <ion-input
                  v-model="confirmPassword"
                  label="Confirmar senha"
                  label-placement="stacked"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Repita a senha"
                  required
                />
                <ion-button fill="clear" slot="end" type="button" @click="showConfirmPassword = !showConfirmPassword" aria-label="Mostrar ou ocultar confirmação de senha">
                  <ion-icon :icon="showConfirmPassword ? eyeOffOutline : eyeOutline" slot="icon-only" />
                </ion-button>
              </ion-item>
              <ion-note v-if="errors.confirmPassword" color="danger" class="field-error">{{ errors.confirmPassword }}</ion-note>

              <ion-text v-if="formError" color="danger">
                <p class="form-error">{{ formError }}</p>
              </ion-text>

              <ion-text v-if="successMessage" color="success">
                <p class="success-message">{{ successMessage }}</p>
              </ion-text>

              <ion-button expand="block" type="submit" class="ion-margin-top" :disabled="loading">
                <ion-spinner v-if="loading" name="crescent" class="btn-spinner" />
                <span v-else>Criar conta</span>
              </ion-button>

              <ion-button expand="block" fill="clear" router-link="/login" :disabled="loading">
                Já tenho conta
              </ion-button>
            </form>
          </ion-card-content>
        </ion-card>
      </div>

      <ion-loading :is-open="loading" message="Criando conta..." />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonBackButton,
  IonButton,
  IonButtons,
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
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { register } = useAuth();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const formError = ref('');
const successMessage = ref('');
const errors = reactive<{ email?: string; password?: string; confirmPassword?: string }>({});

function validate(): boolean {
  errors.email = undefined;
  errors.password = undefined;
  errors.confirmPassword = undefined;
  formError.value = '';
  successMessage.value = '';

  const emailValue = email.value.trim();
  if (!emailValue) {
    errors.email = 'Informe o e-mail.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    errors.email = 'Informe um e-mail válido.';
  }

  if (!password.value) {
    errors.password = 'Informe a senha.';
  } else if (password.value.length < 6) {
    errors.password = 'A senha deve ter pelo menos 6 caracteres.';
  }

  if (!confirmPassword.value) {
    errors.confirmPassword = 'Confirme a senha.';
  } else if (confirmPassword.value !== password.value) {
    errors.confirmPassword = 'As senhas não coincidem.';
  }

  return !errors.email && !errors.password && !errors.confirmPassword;
}

async function handleRegister() {
  if (!validate()) return;
  loading.value = true;
  formError.value = '';
  successMessage.value = '';
  try {
    const result = await register(email.value.trim(), password.value);
    if (result.error) {
      formError.value = result.error;
      return;
    }

    if (result.data?.needsEmailConfirmation) {
      successMessage.value =
        'Conta criada com sucesso! Enviamos um e-mail de confirmação. Confirme seu e-mail antes de entrar.';
      return;
    }

    if (result.data?.session) {
      await router.replace('/tabs/dashboard');
      return;
    }

    successMessage.value = 'Conta criada com sucesso. Você já pode fazer login.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 480px;
  margin: 0 auto;
  padding-top: 16px;
}
.field-error {
  display: block;
  margin: 4px 16px 8px;
  font-size: 0.85rem;
}
.form-error,
.success-message {
  margin: 12px 4px 0;
  text-align: center;
}
.btn-spinner {
  width: 20px;
  height: 20px;
}
</style>

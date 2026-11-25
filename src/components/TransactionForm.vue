<template>
  <form @submit.prevent="onSubmit" class="transaction-form">
    <ion-list lines="full">
      <ion-item>
        <ion-input
          v-model="form.descricao"
          label="Descrição"
          label-placement="stacked"
          placeholder="Ex.: Salário mensal"
          :maxlength="120"
          required
        />
      </ion-item>
      <ion-note v-if="errors.descricao" color="danger" class="field-error">{{ errors.descricao }}</ion-note>

      <ion-item>
        <ion-input
          v-model="valorTexto"
          label="Valor (R$)"
          label-placement="stacked"
          type="text"
          inputmode="decimal"
          placeholder="0,00"
          required
        />
      </ion-item>
      <ion-note v-if="errors.valor" color="danger" class="field-error">{{ errors.valor }}</ion-note>

      <ion-item>
        <ion-select
          v-model="form.categoria"
          label="Categoria"
          label-placement="stacked"
          interface="popover"
          placeholder="Selecione uma categoria"
        >
          <ion-select-option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-note v-if="errors.categoria" color="danger" class="field-error">{{ errors.categoria }}</ion-note>

      <ion-item>
        <ion-input
          v-model="form.data"
          label="Data"
          label-placement="stacked"
          type="date"
          required
        />
      </ion-item>
      <ion-note v-if="errors.data" color="danger" class="field-error">{{ errors.data }}</ion-note>
    </ion-list>

    <div class="form-actions">
      <ion-button expand="block" type="submit" :disabled="loading || savingDisabled">
        <ion-spinner v-if="loading" name="crescent" class="btn-spinner" />
        <span v-else>{{ submitLabel }}</span>
      </ion-button>
      <ion-button v-if="showCancel" expand="block" fill="clear" type="button" @click="$emit('cancel')" :disabled="loading">
        Cancelar
      </ion-button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { IonButton, IonInput, IonItem, IonList, IonNote, IonSelect, IonSelectOption, IonSpinner } from '@ionic/vue';
import { computed, reactive, ref, watch } from 'vue';
import { parseValorInput, toISODate } from '@/utils/format';

export interface TransactionFormValue {
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
}

const props = withDefaults(
  defineProps<{
    categorias: string[];
    initialValue?: Partial<TransactionFormValue>;
    loading?: boolean;
    submitLabel?: string;
    showCancel?: boolean;
  }>(),
  {
    loading: false,
    submitLabel: 'Salvar',
    showCancel: false
  }
);

const emit = defineEmits<{
  (e: 'submit', value: TransactionFormValue): void;
  (e: 'cancel'): void;
}>();

const form = reactive({
  descricao: '',
  categoria: '',
  data: toISODate(new Date())
});
const valorTexto = ref('');
const errors = reactive<{ descricao?: string; valor?: string; categoria?: string; data?: string }>({});
const lastSubmitTime = ref(0);

function resetFromInitial() {
  form.descricao = props.initialValue?.descricao ?? '';
  form.categoria = props.initialValue?.categoria ?? '';
  form.data = props.initialValue?.data ?? toISODate(new Date());
  if (props.initialValue?.valor != null) {
    valorTexto.value = String(props.initialValue.valor).replace('.', ',');
  } else {
    valorTexto.value = '';
  }
  errors.descricao = errors.valor = errors.categoria = errors.data = undefined;
}

watch(() => props.initialValue, resetFromInitial, { immediate: true, deep: true });

const savingDisabled = computed(() => Date.now() - lastSubmitTime.value < 800);

function validate(): TransactionFormValue | null {
  errors.descricao = errors.valor = errors.categoria = errors.data = undefined;
  const descricao = form.descricao.trim();
  if (!descricao) errors.descricao = 'Informe a descrição.';
  const valor = parseValorInput(valorTexto.value);
  if (!valorTexto.value.trim()) {
    errors.valor = 'Informe o valor.';
  } else if (!Number.isFinite(valor)) {
    errors.valor = 'Informe um valor numérico válido.';
  } else if (valor <= 0) {
    errors.valor = 'O valor deve ser maior que zero.';
  }
  if (!form.categoria) errors.categoria = 'Selecione uma categoria.';
  if (!form.data) {
    errors.data = 'Informe a data.';
  } else {
    const d = new Date(`${form.data}T00:00:00`);
    if (Number.isNaN(d.getTime())) errors.data = 'Informe uma data válida.';
  }

  if (errors.descricao || errors.valor || errors.categoria || errors.data) return null;
  return { descricao, valor, categoria: form.categoria, data: form.data };
}

function onSubmit() {
  if (props.loading) return;
  const now = Date.now();
  if (now - lastSubmitTime.value < 800) return;
  const value = validate();
  if (!value) return;
  lastSubmitTime.value = now;
  emit('submit', value);
}
</script>

<style scoped>
.field-error {
  display: block;
  margin: 4px 16px 8px;
  font-size: 0.85rem;
}
.form-actions {
  margin-top: 16px;
  padding: 0 8px 8px;
}
.btn-spinner {
  width: 20px;
  height: 20px;
}
</style>

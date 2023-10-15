<script setup lang="ts">
const modelValue = defineModel();

const input = ref();

function autoGrow() {
  input.value.style.height = "5px";
  input.value.style.height = `${input.value.scrollHeight}px`;
}

onMounted(() => autoGrow());
onUpdated(() => autoGrow());
</script>

<template>
  <textarea
    ref="input"
    v-model="modelValue"
    :class="
      cn(
        'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        $attrs.class ?? '',
      )
    "
  />
</template>

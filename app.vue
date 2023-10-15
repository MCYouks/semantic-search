<template>
  <div class="h-screen flex flex-col">
    <div class="grid grid-cols-2 flex-grow">
      <div class="p-6">
        <UiInput :model-value="text" />
        <button @click="uploadText()">UploadText</button>
      </div>
      <div class="bg-stone-100 p-6">
        <input v-model="question" placeholder="Ask a question" />
        <button @click="queryText()">Ask question</button>
        {{ answer }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const text = ref(`
An apple is a round, edible fruit produced by an apple tree (Malus domestica). Apple trees are cultivated worldwide and are the most widely grown species in the genus Malus. The tree originated in Central Asia, where its wild ancestor, Malus sieversii, is still found. Apples have been grown for thousands of years in Asia and Europe and were introduced to North America by European colonists. Apples have religious and mythological significance in many cultures, including Norse, Greek, and European Christian tradition.
Apples grown from seed tend to be very different from those of their parents, and the resultant fruit frequently lacks desired characteristics. Generally, apple cultivars are propagated by clonal grafting onto rootstocks. Apple trees grown without rootstocks tend to be larger and much slower to fruit after planting. Rootstocks are used to control the speed of growth and the size of the resulting tree, allowing for easier harvesting.
There are more than 7,500 cultivars of apples. Different cultivars are bred for various tastes and uses, including cooking, eating raw, and cider production. Trees and fruit are prone to fungal, bacterial, and pest problems, which can be controlled by a number of organic and non-organic means. In 2010, the fruit's genome was sequenced as part of research on disease control and selective breeding in apple production.
Worldwide production of apples in 2021 was 93 million tonnes, with China accounting for nearly half of the total.
`);
const documentName = "apple-wikipedia";

const uploadText = async function () {
  await useFetch("/api/upload-text", {
    method: "POST",
    body: { documentName, text: text.value },
  });
};

const question = ref("");
const answer = ref("");

const queryText = async function () {
  if (!question.value) {
    return;
  }

  const { data } = await useFetch("/api/query-text", {
    method: "POST",
    body: { question: question.value, documentName },
  });

  answer.value = data.value.result;
};
</script>

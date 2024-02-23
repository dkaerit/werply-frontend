<script setup lang="ts">
// @ts-ignore
import { useStore } from "vuex";
import { ref, onMounted, onBeforeMount } from "vue";

const store = useStore();
const isPhone = ref(true);
const isTablet = ref(false);
const isNetbook = ref(false);
const isLaptop = ref(false);
const isDesktop = ref(false);

// @ts-ignore
const state = ref(store.state);

const handleResize = () => {
  const width = window.innerWidth;
  isPhone.value = width >= 0;
  isTablet.value = width >= 768;
  isNetbook.value = width >= 992;
  isLaptop.value = width >= 1200;
  isDesktop.value = width >= 1820;
};

onBeforeMount(async () => {
  const token = localStorage.getItem("TokenSession");
  let user = {};

  if (token) {
    store.dispatch("AUTH/CHECK_TOKEN_EXPIRATION");
    user = await store.dispatch("AUTH/GET_USER_INFO");
    store.commit("USERS/setUser", user);
    store.dispatch("MUTUALS/FETCH_MUTUALS", store.state["USERS"].user._id);
  }
});

onMounted(() => {
  handleResize();
  document.documentElement.classList.add("dark");
});
</script>

<template>
  <div class="flex justify-center">
    <router-view />
  </div>
</template>

<style lang="scss">
.hugeicon {
  stroke: hsl(var(--foreground));
}

.gray-text {
  color: #3c403b;
}

.svgstroke-gray {
  stroke: #3c403b;
}

.svgfill-gray {
  fill: #3c403b;
}

::-webkit-scrollbar {
  width: 5px;
  border: 10px solid var(--background);
}
::-webkit-scrollbar-thumb {
  background-color: hsl(var(--border));
  border-radius: 2px;
  border: 1px solid hsl(var(--background));
}

.svgfill-foreground {
  fill: hsl(var(--foreground));
}

.svgfill-background {
  fill: hsl(var(--background));
}

.svgstroke-foreground {
  stroke: hsl(var(--foreground));
}

.svgstroke-background {
  stroke: hsl(var(--background));
}

.bg-lat {
  background: url("@/assets/bg/bg-a.png");
  background-size: cover;
  background-position: center;
}

.bg-traslucent-red {
  background-color: rgba(105, 22, 22, 0.5);
}

.bg-traslucent-gray {
  background-color: rgba(133, 133, 133, 0.25);
}
</style>

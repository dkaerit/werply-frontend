<script setup lang="ts">
// @ts-ignore
import { useStore } from "vuex";
import { ref, watchEffect, onBeforeMount } from "vue"; // onBeforeUnmount

// Importar componentes y estilos
import PostInput from "@/components/elements/PostInput.vue";
import PostBlock from "@/components/elements/PostBlock.vue";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DualColumnLayout from "@/components/layouts/DualColumnLayout.vue";

import { Character } from "@/store/characters/characters.interfaces";
import { UserState } from "@/store/users/users.interfaces";

import { socket } from "@/store/index";

interface Post {
  id: string;
  createdAt: Date; // Ajusta el tipo según el formato real de la fecha en tus posts
}

interface Author {
  authorName?: string;
  authorId?: string;
  authorType: string;
}

// se deben tomar solo los mutuals con status active, el id del user/pj seleccionado puede estar en id1 o id2, el opuesto se´ria su mutual.
interface Mutual {
  id1: string;
  id2: string;
  relationshipType: string; //  'pj' o 'user'
  status: string; // 'pending' o 'active'
}

const store = useStore();
const hasLoaded = ref(false); // Variable de control para evitar el bucle infinito
const activeTab = ref("all");

const pageSize = ref(5);
const newestDate = ref(null as null | Date);
const oldestDate = ref(null as null | Date);

const createAuthorsList = (
  selectedActor: Character | UserState,
  pairsOfMutuals: Mutual[]
): Author[] => {
  const authors: Author[] = [];

  // Agregar el actor seleccionado como autor
  const selfAuthorType = (selectedActor as Character) ? "pj" : "user";
  authors.push({ authorId: selectedActor._id, authorType: selfAuthorType });

  // filtrar
  const mutualAuthors = pairsOfMutuals
    .filter(
      (mutual) =>
        (selectedActor._id === mutual.id1 || selectedActor._id === mutual.id2) &&
        mutual.status === "active"
    )
    .map((mutual) => {
      const authorId = selectedActor._id === mutual.id1 ? mutual.id2 : mutual.id1;
      const authorType = (selectedActor as Character) ? "pj" : "user";
      return { authorId, authorType };
    });

  return [...authors, ...mutualAuthors];
};

const updateReferenceDates = (newPosts: Post[], side: string) => {
  if (newPosts.length > 0) {
    const dates = newPosts.map((post: Post) => new Date(post.createdAt).getTime());
    if (side == "top") newestDate.value = new Date(Math.max(...dates));
    if (side == "bottom") oldestDate.value = new Date(Math.min(...dates));
  }
};

const initialFetchNewerPosts = async () => {
  hasLoaded.value = false;
  // Armar lista de Authors
  const selected = store.getters["USERS/getSelected"];
  const authors = createAuthorsList(
    selected,
    await store.dispatch("MUTUALS/FETCH_MUTUALS", selected._id)
  );

  const newerPosts: Post[] = await store.dispatch("POSTS/FETCH_INITIAL_POSTS", {
    page: 1,
    pageSize: pageSize.value,
    filters: { authors },
  });

  updateReferenceDates(newerPosts, "top");
  hasLoaded.value = true;
};

const fetchNewerPosts = async () => {
  hasLoaded.value = false;

  const currentPosts = store.state["POSTS"].posts;
  const referenceDate = currentPosts.length > 0 ? currentPosts[0].createdAt : null; // createdAt del ultimo post o null

  // Armar lista de autores
  const selected = store.getters["USERS/getSelected"];
  const authors = createAuthorsList(
    selected,
    await store.dispatch("MUTUALS/FETCH_MUTUALS", selected._id)
  );

  const newerPosts: Post[] = await store.dispatch("POSTS/FETCH_ADDITIONAL_POSTS", {
    filters: { loadSide: "top", referenceDate, authors },
  });

  updateReferenceDates(newerPosts, "top");
  hasLoaded.value = true;
};

const fetchOlderPosts = async () => {
  hasLoaded.value = false;
  const currentPosts = store.state["POSTS"].posts;
  const referenceDate =
    currentPosts.length > 0 ? currentPosts[currentPosts.length - 1].createdAt : null; // createdAt del ultimo post o null

  // Armar lista de Authors
  const selected = store.getters["USERS/getSelected"];
  const authors = createAuthorsList(
    selected,
    await store.dispatch("MUTUALS/FETCH_MUTUALS", selected._id)
  );

  const olderPosts: Post[] = await store.dispatch("POSTS/FETCH_ADDITIONAL_POSTS", {
    page: 1,
    pageSize: pageSize.value,
    filters: { loadSide: "bottom", referenceDate, authors },
  });

  updateReferenceDates(olderPosts, "bottom");
  hasLoaded.value = true;
};

const loadOlderPosts = () => {
  fetchOlderPosts();
};

// cambiar de pestaña
const changeState = (tabValue: string) => {
  activeTab.value = tabValue; // 'all' or 'favorites'
  initialFetchNewerPosts(); // cargar posts
};

watchEffect(() => {});

const onScroll = (event: UIEvent) => {
  const { scrollTop, clientHeight, scrollHeight } = event.target as HTMLElement;
  if (scrollTop + clientHeight >= scrollHeight) loadOlderPosts();
};

onBeforeMount(() => {
  initialFetchNewerPosts();
  socket.on("newPost", (message: string) => {
    fetchNewerPosts();
    console.log("Se recibió una notificación:", message);
  });

  socket.on("deletePost", (message: string) => {
    initialFetchNewerPosts();
    console.log("Se recibió una notificación:", message);
  });

  store.watch(
    () => store.getters["USERS/getSelected"],
    () => {
      initialFetchNewerPosts();
    }
  );
});
</script>

<template>
  <DualColumnLayout>
    <template #firstColumn>
      <div class="flex-col">
        <!-- Franja superior -->
        <Tabs default-value="all" class="space-y-4">
          <div class="border-b">
            <div class="flex h-16 px-4 items-center justify-between">
              <h2 class="text-lg font-bold tracking-tight">Inicio</h2>

              <div class="flex items-center">
                <TabsList class="grid grid-flow-col justify-stretch">
                  <TabsTrigger @click="changeState('all')" value="all">
                    Todo
                  </TabsTrigger>
                  <TabsTrigger @click="changeState('favorites')" value="favorites">
                    Tus favoritos
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>

          <div
            id="timeline"
            class="flex-1 overflow-auto space-y-2 p-4 pt-3 h-[calc(99vh_-_4rem)]"
            @scroll="onScroll"
          >
            <!-- Post input -->
            <PostInput />

            <!-- Bloques grandes -->
            <template v-if="store.state['POSTS'].posts.length !== 0">
              <PostBlock
                v-for="(post, index) in store.state['POSTS'].posts"
                :key="index"
                :value="activeTab"
                :post="post"
                :index="index"
                :authorType="post.authorType"
                :authorId="post?.authorId"
              />
            </template>

            <!-- begin Loading -->
            <LoadingIndicator :allPostsLoaded="!hasLoaded" />
            <!-- end Loading -->
          </div>
        </Tabs>
      </div>
    </template>

    <template #secondColumn>
      <div id="copyright" class="w-[95%] text-[0.775rem] text-justify">
        Derechos reservados. Prohibida la reproducción, distribución o uso no autorizado
        sin consentimiento por escrito del titular de derechos de autor. © 2023 Werply.
      </div>
    </template>
  </DualColumnLayout>
</template>

<style scoped lang="scss">
#timeline {
  margin-top: 0px;
}

#copyright {
  color: hsl(var(--foreground));
  opacity: 0.35;
}

.graytext {
  color: hsl(var(--foreground));
  opacity: 0.35;
}
</style>

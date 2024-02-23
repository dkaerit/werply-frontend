<script setup lang="ts">
// @ts-ignore
import { useStore } from "vuex";
import { computed } from "vue";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, Trash, BookText } from "lucide-vue-next";

import MoreIcon from "@/assets/svg/more-horizontal.svg";

interface Post {
  _id: string;
  authorId: string;
  authorType: string;
  content: string;
  createdAt: Date;
}

const store = useStore();
const props = defineProps({
  post: Object as () => Post,
});

const editPost = () => {
  console.log("Edit post");
};

const deletePost = async () => {
  // Lógica para eliminar el post con el ID props.postId
  try {
    if (props.post) await store.dispatch("POSTS/DELETE_POST", props.post._id);
  } catch (error) {
    console.error("Error deleting post:", error);
  }
};

const startPlot = () => {
  // Lógica para iniciar un hilo relacionado con el post con el ID props.postId
  console.log("Start Plot");
};

const isPostOwnedByCurrentUser = computed(() => {
  const currentCharacterId = store.getters["CHARACTERS/getCurrentCharacterId"];
  const currentUserId = store.getters["USERS/getCurrentUserId"];
  const authorId =
    store.state["CHARACTERS"].currentCharacter != null
      ? currentCharacterId
      : currentUserId;

  // Verificar si el post pertenece al personaje actual o al usuario actual
  return authorId === props.post?.authorId;
});
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="h-fit p-[3px] rounded-[100%] border-0">
        <MoreIcon class="svgstroke-gray" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56">
      <!-- Start Thread -->
      <DropdownMenuItem @click="startPlot">
        <BookText class="mr-2 h-4 w-4" />
        <span>Iniciar trama</span>
      </DropdownMenuItem>

      <!-- Edit Post -->
      <DropdownMenuItem @click="editPost">
        <Edit class="mr-2 h-4 w-4" />
        <span>Editar</span>
      </DropdownMenuItem>

      <!-- Delete Post -->
      <DropdownMenuItem v-if="isPostOwnedByCurrentUser" @click="deletePost">
        <Trash class="mr-2 h-4 w-4" />
        <span>Borrar</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

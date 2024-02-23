<script setup lang="ts">
// @ts-ignore
import { useStore } from "vuex";
import SquircleAvatar from "@/components/elements/SquircleAvatar.vue";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PostActionDropdown from "@/components/elements/PostActionDropdown.vue";
import { ref, watchEffect, computed } from "vue";

interface Author {
  _id: string;
  type: string;
  avatar: string;
  authorName: string;
  authorPublicName?: string;
}

interface Post {
  _id: string;
  authorId: string;
  authorType: string;
  content: string;
  createdAt: Date;
}

const props = defineProps({
  post: {
    type: Object as () => Post,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  authorType: {
    // "user" o "character"
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
});

const store = useStore();
const isLoading = ref(true);
const getUser = computed(
  async () => await store.dispatch("USERS/GET_USER_BY_ID", props.post?.authorId)
);
const getPj = computed(
  async () => await store.dispatch("CHARACTERS/GET_CHARACTER_BY_ID", props.post?.authorId)
);

const author = ref({
  _id: props.post?.authorId as string,
  type: props.post?.authorType as string,
} as Author); // + lo que se obtenga por hacer get

const authorLink = computed(() => {
  if (props.authorType === "character") {
    return {
      path: `/profile/pj/${author.value.authorName}`,
    };
  } else {
    return {
      path: `/profile/user/${author.value.authorName}`,
    };
  }
});

// Methods
const formatRelativeTime = () => {
  const postCreatedAt = props.post?.createdAt;
  const parsedPostDate = postCreatedAt ? new Date(postCreatedAt) : new Date();
  const currentDate = new Date();
  const differenceInSeconds = Math.floor(
    (currentDate.getTime() - parsedPostDate.getTime()) / 1000
  );

  if (differenceInSeconds < 86400) {
    // Si ha pasado menos de un día, muestra la diferencia relativa en horas y minutos
    const hours = Math.floor(differenceInSeconds / 3600);
    const minutes = Math.floor((differenceInSeconds % 3600) / 60);
    const timeParts = [hours > 0 ? `${hours}h` : "", `${minutes}m`];
    return `Hace ${timeParts.filter((part) => part.trim() !== "").join(" ")}`;
  } else {
    // Si ha pasado más de un día, muestra la fecha en formato "día mes"
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return new Intl.DateTimeFormat("es-ES", options).format(parsedPostDate);
  }
};

watchEffect(() => {
  isLoading.value = true;

  (async () => {
    const authorData =
      props.authorType === "character" ? await getPj.value : await getUser.value;
    const publicName =
      props.authorType === "character" ? authorData.pjname : authorData.nickname;
    const name =
      props.authorType === "character" ? authorData.nickname : authorData.username;

    author.value = {
      _id: props.post.authorId,
      avatar: authorData.avatar,
      type: props.post.authorType,
      authorName: name,
      authorPublicName: publicName,
    };

    isLoading.value = false;
  })();
});
</script>

<template>
  <div :id="`${index}`" class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card class="col-span-7 rounded-md">
        <CardHeader>
          <div class="grid grid-cols-[auto_auto_1fr] justify-start">
            <!-- GRID POST -->
            <!-- Celda 1-1: Avatar -->
            <SquircleAvatar
              size="45px"
              :src="author.avatar"
              :name="(author.authorName as string)"
            />

            <!-- Celda 2-1: Título y UserID -->
            <div class="col-start-2 pl-4 flex">
              <div>
                <div>
                  <router-link :to="authorLink">
                    <CardTitle>{{ author.authorPublicName }}</CardTitle>
                  </router-link>
                </div>
                <div class="flex items-center gap-[0.275rem] text-[0.875rem]">
                  <div class="graytext">@{{ author.authorName }}</div>
                  <div class="graytext">·</div>
                  <div class="graytext">
                    {{ formatRelativeTime() }}
                  </div>
                </div>

                <Separator class="my-2" className="my-2" />
              </div>
            </div>

            <!-- Celda 2-2: Contenido -->
            <div class="row-start-2 pl-4 col-span-2 col-start-2">
              <CardDescription class="text-justify whitespace-pre-line pr-2">
                {{ post?.content }}
              </CardDescription>
            </div>

            <!-- Celda 3-1: Dropdown -->
            <div class="row-start-1 col-start-3 pl-4 flex justify-end">
              <PostActionDropdown :post="props.post" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <!-- Contenido adicional si es necesario -->
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.graytext {
  color: hsl(var(--foreground));
  opacity: 0.35;
}
</style>

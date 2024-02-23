import { createRouter, createWebHashHistory, NavigationGuard } from "vue-router";

const isAuthenticated = () => {
  const token = localStorage.getItem("TokenSession");
  return token !== null;
};

const redirectToIfCondition: (condition: boolean, path: string) => NavigationGuard = (condition, path) => {
  return (_, __, next: any) => {
    if (condition) {
      next(path);
    } else {
      next();
    }
  };
};

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
      beforeEnter: redirectToIfCondition(!isAuthenticated(), '/login'),
    },
    {
      path: '/register',
      component: () => import('../components/views/Register.vue'),
      beforeEnter: redirectToIfCondition(isAuthenticated(), '/home'),
    },
    {
      path: '/login',
      component: () => import('../components/views/Login.vue'),
      beforeEnter: redirectToIfCondition(isAuthenticated(), '/home'),
    },
    {
      path: '/',
      component: () => import('../components/layouts/NavWrapLayout.vue'),
      beforeEnter: redirectToIfCondition(!isAuthenticated(), '/login'),
      children: [
        {
          path: 'home',
          component: () => import('../components/views/Dashboard.vue'),
          beforeEnter: redirectToIfCondition(!isAuthenticated(), '/login'),
        },
        {
          path: 'profile',
          children: [
            {
              path: 'user/:username',
              component: () => import('../components/views/UserProfile.vue'),
              beforeEnter: redirectToIfCondition(!isAuthenticated(), '/login'),
            },
            {
              path: 'pj/:nickname',
              component: () => import('../components/views/CharacterProfile.vue'),
              beforeEnter: redirectToIfCondition(!isAuthenticated(), '/login'),
            },
          ],
        },
      ]
    }
  ]
});
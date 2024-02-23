// store/menu.module.js

export default {
    state: () => ({
      isVerticalMenuOpen: false
    }),
    mutations: {
      SET_VERTICAL_MENU_STATE(state:any, isOpen:any) {
        state.isVerticalMenuOpen = isOpen;
      }
    }
    // Puedes agregar acciones u otras configuraciones específicas del menú aquí si es necesario
  }
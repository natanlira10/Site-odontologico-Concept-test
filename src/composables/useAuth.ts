import { ref } from 'vue';
import type { AuthUser, UserCredentials, RegisterRequest } from '@/types';
import { api } from '@/services/api';

const isAuthModalOpen = ref(false);
const activeTab = ref<'login' | 'register'>('login');
const currentUser = ref<AuthUser | null>(null);
const isLoading = ref(false);
const statusMessage = ref<{ text: string; type: 'success' | 'error' } | null>(null);

export function useAuth() {
  const openLoginModal = () => {
    activeTab.value = 'login';
    statusMessage.value = null;
    isAuthModalOpen.value = true;
  };

  const openRegisterModal = () => {
    activeTab.value = 'register';
    statusMessage.value = null;
    isAuthModalOpen.value = true;
  };

  const closeAuthModal = () => {
    isAuthModalOpen.value = false;
    statusMessage.value = null;
  };

  const setTab = (tab: 'login' | 'register') => {
    activeTab.value = tab;
    statusMessage.value = null;
  };

  const login = async (credentials: UserCredentials) => {
    isLoading.value = true;
    statusMessage.value = null;

    try {
      const res = await api.auth.login(credentials);
      if (res.success && res.data) {
        currentUser.value = res.data;
        statusMessage.value = {
          text: `Bem-vindo(a), ${res.data.name}! Sessão iniciada.`,
          type: 'success',
        };
        setTimeout(() => {
          closeAuthModal();
        }, 1200);
        return true;
      } else {
        statusMessage.value = {
          text: res.message || 'Credenciais inválidas. Verifique seus dados.',
          type: 'error',
        };
        return false;
      }
    } catch (err) {
      statusMessage.value = {
        text: 'Erro de conexão com o portal do paciente.',
        type: 'error',
      };
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (data: RegisterRequest) => {
    isLoading.value = true;
    statusMessage.value = null;

    try {
      const res = await api.auth.register(data);
      if (res.success && res.data) {
        currentUser.value = res.data;
        statusMessage.value = {
          text: 'Cadastro criado com sucesso! Sessão iniciada.',
          type: 'success',
        };
        setTimeout(() => {
          closeAuthModal();
        }, 1200);
        return true;
      } else {
        statusMessage.value = {
          text: res.message || 'Falha ao registrar novo paciente.',
          type: 'error',
        };
        return false;
      }
    } catch (err) {
      statusMessage.value = {
        text: 'Erro ao processar cadastro no servidor.',
        type: 'error',
      };
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    await api.auth.logout();
    currentUser.value = null;
  };

  return {
    isAuthModalOpen,
    activeTab,
    currentUser,
    isLoading,
    statusMessage,
    openLoginModal,
    openRegisterModal,
    closeAuthModal,
    setTab,
    login,
    register,
    logout,
  };
}

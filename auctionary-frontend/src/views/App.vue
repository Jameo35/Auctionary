<template>
  <div>
    <nav>
      <router-link to="/">Home</router-link>
      <router-link v-if="!isLoggedIn" to="/signup">Sign Up</router-link>
      <router-link v-if="isLoggedIn" to="/profile">Profile</router-link>
      <router-link v-if="!isLoggedIn" to="/login">Login</router-link>
      <a v-if="isLoggedIn" href="#" @click.prevent="logout">Logout</a>
    </nav>
    <router-view />
  </div>
</template>

<script>
  import { userService } from '@/services/userService.js';
import { authState } from '../services/authentication.js';

export default {
  computed: {
    isLoggedIn() {
      return authState.isLoggedIn;
    }
  },
  methods: {
    logout() {
      userService.logout()
      .finally(() => {
        authState.isLoggedIn = false;
        this.$router.push('/');
      });
    }
  }
}
</script>

<style scoped>
</style>
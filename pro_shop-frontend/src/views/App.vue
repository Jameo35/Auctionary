<template>
  <div>
    <nav class="bg-bg border-b border-border px-8 py-6 shadow-md flex items-center gap-6">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link v-if="isLoggedIn" to="/browse" class="nav-link">Browse</router-link>
      <router-link v-if="!isLoggedIn" to="/signup" class="nav-link">Sign Up</router-link>
      <router-link v-if="isLoggedIn" to="/profile" class="nav-link">Profile</router-link>
      <router-link v-if="!isLoggedIn" to="/login" class="nav-link">Login</router-link>
      <router-link v-if="isLoggedIn" to="/new-listing" class="nav-link">New Listing</router-link>
      <a class="font-medium text-text no-underline
         router-link-active:text-primary" v-if="isLoggedIn" href="#" @click.prevent="logout">Logout</a>
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
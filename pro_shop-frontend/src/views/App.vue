<template>
  <div class="flex flex-col min-h-screen">
    <nav class="bg-primary border-b border-border px-8 py-6 shadow-md flex items-center justify-between gap-6">
      <div class="shrink-0 flex items-center gap-4">
        <img src="@/assets/logo.png" alt="Pro Shop Logo" class="h-25 w-25 rounded-full object-cover" />
      </div>
      <h1 class="absolute left-1/2 transform -translate-x-1/2 text-5xl font-bold text-accent">The Pro Shop</h1>
      <div class="flex items-center gap-4">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link v-if="isLoggedIn" to="/browse" class="nav-link">Browse</router-link>
      <router-link v-if="!isLoggedIn" to="/signup" class="nav-link">Sign Up</router-link>
      <router-link v-if="isLoggedIn" to="/profile" class="nav-link">Profile</router-link>
      <router-link v-if="!isLoggedIn" to="/login" class="nav-link">Login</router-link>
      <router-link v-if="isLoggedIn" to="/new-listing" class="nav-link">New Listing</router-link>
      <a class="font-medium text-accent no-underline
         router-link-active:text-primary text-2xl" v-if="isLoggedIn" href="#" @click.prevent="logout">Logout</a>
      </div>
    </nav>
    <router-view class="flex-1 flex" />
    <footer class="bg-primary border-t border-border text-white px-8 py-6">
      <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm">&copy; 2026 The Pro Shop. All rights reserved.</p>
        <div class="flex gap-4">
          <a href="#" class="hover:text-accent">Privacy Policy</a>
          <a href="#" class="hover:text-accent">Terms of Service</a>
          <a href="#" class="hover:text-accent">Contact</a>
        </div>
      </div>
    </footer>
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
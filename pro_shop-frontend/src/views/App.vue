<template>
  <div class="flex flex-col min-h-screen min-w-screen">
    <nav class="bg-primary border-b border-border px-6 py-2 shadow-md flex items-center justify-between gap-6">
      <div class="flex items-center gap-4 shrink-0">
        <img src="@/assets/logo.png" alt="Pro Shop Logo" class="h-20 w-20 rounded-full object-cover" />
      </div>
      <div class="flex-1 text-center md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
      <h1 class="text-4xl md:text-4xl font-bold text-accent">The Pro Shop</h1>
      </div>
      <div class="flex flex-wrap items-center gap-4 ml-auto">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link v-if="isLoggedIn" to="/browse" class="nav-link">Browse</router-link>
      <router-link v-if="!isLoggedIn" to="/signup" class="nav-link">Sign Up</router-link>
      <router-link v-if="isLoggedIn" to="/profile" class="nav-link">My Profile</router-link>
      <router-link v-if="!isLoggedIn" to="/login" class="nav-link">Login</router-link>
      <router-link v-if="isLoggedIn" to="/new-listing" class="nav-link">New Listing</router-link>
      <a class="nav-link" v-if="isLoggedIn" href="#" @click.prevent="logout">Logout</a>
      </div>
    </nav>
    <router-view class="flex-1 flex" />
    <section class="flex justify-center items-center pb-8">
      <p class="text-center italic text-lg transition-opacity duration-500":class="{'opacity-0': !showQuote, 'opacity-100': showQuote}">
        "{{ famousQuotes[currentQuoteIndex] }}"
      </p>
    </section>
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
  data(){
    return{
      famousQuotes: [
        "Success in this game depends less on strength of body than strength of mind and character. - Arnold Palmer",
        "Golf is a game of inches. The most important are the six inches between your ears. - Bobby Jones",
        "You swing your best when you have the fewest things to think about. - Bobby Jones",
        "You don't know what pressure is until you play for five bucks with only two in your pocket. - Lee Trevino",
        "Hit the shot you know you can hit, not the one you think you should. - Dr. Bob Rotella",
        "If you think it's hard to meet new people, try picking up the wrong golf ball. - Jack Lemmon",
        "They call it golf because all the other four-letter words were taken. - Raymond Floyd",
        "Every golfer can expect to have four bad shots in a round. - Walter Hagen",
        "Placing the ball in the right position for the next shot is eighty percent of winning golf. - Ben Hogan"
      ],
      currentQuoteIndex: 0,
      showQuote: true
    }
  },
  computed: {
    isLoggedIn() {
      return authState.isLoggedIn;
    }
  },
  mounted(){
    setInterval(() => {
    this.showQuote = false;
    setTimeout(() => {
    this.currentQuoteIndex = (this.currentQuoteIndex + 1) & this.famousQuotes.length;
    this.showQuote = true;
    },500);
    }, 5000);
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
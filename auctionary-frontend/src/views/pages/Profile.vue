<template>
  <div class="profile-page">
    <h1>{{ seller.first_name }} {{ seller.last_name }}'s Items</h1>
    <em v-if="loading">Loading...</em>
    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="items.length" class="card profile-card">
      <h2>Items for Sale</h2>
      <ul>
        <li v-for="item in items" :key="item.item_id">
          <router-link :to="'/item/' + item.item_id">
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </div>
    <div v-else class="card profile-card">
      <h2> Items for Sale </h2>
      <p>No Items found for this seller.</p>
    </div>

    <div v-if="bidding.length" class="card profile-card">
      <h2>Items {{ seller.first_name }} is Bidding On</h2>
      <ul>
        <li v-for="item in bidding" :key="item.item_id">
          <router-link :to="'/item/' + item.item_id">
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </div>
    <div v-else class="card profile-card">
      <h2>Items {{ seller.first_name }} is Bidding On</h2>
      <p>This seller is not bidding on anything.</p>
    </div>

    <div v-if="auctions_ended.length" class="card profile-card">
      <h2>Items {{ seller.first_name }}'s Auctions Have Ended</h2>
      <ul>
        <li v-for="item in auctions_ended" :key="item.item_id">
          <router-link :to="'/item/' + item.item_id">
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </div>
    <div v-else class="card profile-card">
      <h2>Items {{ seller.first_name }}'s Auctions Have Ended</h2>
      <p>This seller has no ended auctions.</p>
    </div>  </div>
</template>

<script>

import { userService } from '../../services/userService.js';   

export default {
  data() {
    return {
      seller: {},
      items: [],
      bidding: [],
      auctions_ended: [],
      loading: true,
      error: ''
    }
  },
  mounted() {
    this.loadUser();
},
  watch: {
    '$route.params.id'(newId, oldId) {
      this.loadUser();
    }
  },
methods: {
  loadUser(){
    this.loading=true;
    this.error="";

      let userId;

  if (this.$route.params.id) {
    userId = this.$route.params.id;
  } else {
    userId = localStorage.getItem('user_id');
  }
   userService.getUserProfile(userId)
    .then(user => {
      this.seller = {
        first_name: user.first_name,
        last_name: user.last_name,
        user_id: user.user_id
      };
      this.items = user.selling || [];
      this.bidding = user.bidding_on || [];
      this.auctions_ended = user.auctions_ended || [];
      this.loading = false;
    })
    .catch(err => {
      this.error = err.message || err;
      this.loading = false;
    });

  }
}
}
</script>

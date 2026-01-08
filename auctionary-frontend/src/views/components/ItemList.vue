<template>
  <div class="card profile-card">
    <h2>{{ title }}</h2>
    <ul v-if="items.length">
      <li v-for="item in items" :key="item.item_id">
        <router-link :to="'/item/' + item.item_id" class="item-link">
          {{ item.name }}
        </router-link>
        <span v-if="item.end_date">
        ends {{ new Date(item.end_date).toLocaleString() }}
        </span>
      </li>
    </ul>
    <p v-else>{{ noItemsMessage }}</p>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    noItemsMessage: {
      type: String,
      default: 'No items found.'
    }
  }
};
</script>
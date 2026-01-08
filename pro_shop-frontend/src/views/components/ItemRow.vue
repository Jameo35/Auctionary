<template>
  <tr>
    <td>
      <router-link :to="`/item/${item.item_id}`" class="item-link">
        {{ item.name }}
      </router-link>
    </td>

    <td>
      {{ item.first_name }} {{ item.last_name }}
    </td>
    <td>
      {{ item.current_bid !== null ? `£${item.current_bid}` : 'No bids yet'  }}
    </td> 

    <td>
      {{ formatDate(item.start_date) }}
    </td>

    <td>
      {{ formatDate(item.end_date) }}
    </td>
  </tr>
</template>

<script>
export default {
  name: "ItemRow",
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString();
    }
  }
}
</script>
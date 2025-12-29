import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../services/authentication.js";

import Home from "../views/pages/Home.vue";
import Signup from "../views/pages/Signup.vue";
import Login from "../views/pages/Login.vue";
import NotFound from "../views/pages/Notfound.vue";
import SingleItem from "../views/pages/SingleItem.vue";
import Profile from "../views/pages/Profile.vue";
import NewListing from "../views/pages/NewListing.vue";
import Browse from "../views/pages/Browse.vue";

const routes = [
    { path: "/", component: Home},
    { path: "/signup", component: Signup},
    { path: "/login", component: Login, props: { isStandalone: true}},
    { path: "/item/:id", component: SingleItem},
    { path: "/browse", component: Browse},
    { path: "/profile/:id", component: Profile},
    { path: "/new-listing", component: NewListing, beforeEnter: auth.ifAuthenticated},
    { path: "/profile", component: Profile, beforeEnter: auth.ifAuthenticated},  //new route for profile page
    { path: "/:pathMatch(.*)*", component: NotFound},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
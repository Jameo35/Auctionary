<template>
    <div class="signup-page">
        <div class ="signup-card card" v-if="!isLoggedIn">
            <h1>Create Account</h1>
            <form @submit.prevent="handleSubmit">
                <label for="firstName">First Name:</label>
                <input type="text" name="firstName" v-model="firstName" />
                <div v-if="submitted && !firstName">First name is required</div>
                <label for="lastName">Last Name:</label>
                <input type="text" name="lastName" v-model="lastName" />
                <div v-if="submitted && !lastName">Last name is required</div>
                <label for="email">Email: </label>
                <input type="email" name="email" v-model="email" />
                <div v-if="submitted && !email">Email is required</div>
                <label for="password">Password: </label>
                <input type="password" name="password" v-model="password"/>
                <div v-if="submitted && !password">Password is required</div>
                <label for="confirmPassword">Confirm Password: </label>
                <input type="password" name="confirmPassword" v-model="confirmPassword"/>
                <div v-if="submitted && confirmPassword !== password">Passwords do not match</div>
                <button>Create Account</button>
            </form>
            <div v-if="error" class="error">{{ error }} </div>
            <div v-if="success" class="success">{{ success }} </div>
        </div>
        <div v-else>
            <h2>You are already logged in.</h2>
        </div>
    </div>
</template>
<script>
import { userService } from '@/services/userService';
import * as EmailValidator from 'email-validator';
import { auth } from '@/services/authentication.js';
    export default {
        data(){
            return{
                email:"",
                password: "",
                confirmPassword: "",
                submitted: false,
                success: "",
                error: "",
                isLoggedIn: false
            }
        },
        methods: {
            handleSubmit(e){
                console.log("Signup submit triggered");
                this.submitted = true
                this.error = ""
                this.success = ""
                const{firstName, lastName, email, password, confirmPassword} = this
                if(!(firstName && lastName && email && password && confirmPassword)){
                    return;
                }
                if(!(EmailValidator.validate(email))){
                    this.error = "Email must be a valid email."
                    return;
                }
                const password_pattern = /(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,36}$/
                if(!(password_pattern.test(password))){
                    this.error = "Password not strong enough."
                    return;
                }
                if(password !== confirmPassword){
                    this.error = "Passwords do not match."
                    return;
                }
                userService.signup(firstName, lastName, email, password)
                    .then(() => {
                        console.log("Signup successful")
                        this.success = "Account created successfully. You can now log in."
                        this.firstName = ""
                        this.lastName = ""
                        this.submitted = false
                        this.email = ""
                        this.password = ""
                        this.confirmPassword = ""
                    })
                    .catch((err) => {
                        this.error = err
                        this.submitted = false
                    })
            }
        }
        ,
          computed:{
            isLoggedIn(){
            return auth.isAuthenticated();
            }
        }
    }
</script>
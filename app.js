const { ref, onMounted } = Vue;

const Login = {
    template: `
        <div class="card">
            <h1>{{ isLoggedIn ? 'Welcome Back!' : 'Login' }}</h1>
            <div v-if="!isLoggedIn">
                <input v-model="username" placeholder="Username" /><br>
                <button @click="simpleLogin">Standard Login</button>
                <hr>
                <button v-if="hasBiometrics" @click="biometricLogin">Login with Fingerprint</button>
            </div>
            <div v-else>
                <p>Hello, {{ username }}!</p>
                <button v-if="!isEnrolled" @click="registerBiometric">Enable Fingerprint Login</button>
                <button @click="logout">Logout</button>
            </div>
            <p v-if="error" style="color:red">{{ error }}</p>
        </div>
    `,
    setup() {
        const username = ref(localStorage.getItem('user') || '');
        const isLoggedIn = ref(!!localStorage.getItem('isLoggedIn'));
        const isEnrolled = ref(!!localStorage.getItem('biometric_id'));
        const error = ref('');
        const hasBiometrics = ref(window.PublicKeyCredential !== undefined);

        const simpleLogin = () => {
            if (!username.value) return error.value = "Enter username";
            localStorage.setItem('user', username.value);
            localStorage.setItem('isLoggedIn', 'true');
            isLoggedIn.value = true;
        };

        const registerBiometric = async () => {
            try {
                // Simulation: In a real app, 'challenge' comes from your server
                const options = {
                    publicKey: {
                        challenge: Uint8Array.from("random_server_challenge", c => c.charCodeAt(0)),
                        rp: { name: "Vue PWA Demo", id: window.location.hostname },
                        user: { id: Uint8Array.from("123", c => c.charCodeAt(0)), name: username.value, displayName: username.value },
                        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                        authenticatorSelection: { userVerification: "required" },
                        timeout: 60000
                    }
                };
                const credential = await navigator.credentials.create(options);
                localStorage.setItem('biometric_id', btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
                isEnrolled.value = true;
                alert("Fingerprint registered!");
            } catch (err) {
                error.value = "Registration failed: " + err.message;
            }
        };

        const biometricLogin = async () => {
            try {
                const options = {
                    publicKey: {
                        challenge: Uint8Array.from("random_login_challenge", c => c.charCodeAt(0)),
                        allowCredentials: [{ id: Uint8Array.from(atob(localStorage.getItem('biometric_id')), c => c.charCodeAt(0)), type: 'public-key' }],
                        userVerification: "required"
                    }
                };
                await navigator.credentials.get(options); // This triggers the phone's biometric prompt
                isLoggedIn.value = true;
                localStorage.setItem('isLoggedIn', 'true');
            } catch (err) {
                error.value = "Biometric login failed.";
            }
        };

        const logout = () => {
            localStorage.removeItem('isLoggedIn');
            isLoggedIn.value = false;
        };

        return { username, isLoggedIn, isEnrolled, error, hasBiometrics, simpleLogin, registerBiometric, biometricLogin, logout };
    }
};

const router = new VueRouter({ routes: [{ path: '/', component: Login }] });
new Vue({ el: '#app', router, mounted() {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
}});

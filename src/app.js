const Login = {
    template: `
        <div class="card">
            <h1>Login</h1>
            <input v-model="username" placeholder="Username" /><br>
            <input type="password" v-model="password" placeholder="Password" /><br>
            <label><input type="checkbox" v-model="rememberMe" /> Remember me</label><br>
            <button @click="simpleLogin">Login</button>
            <button @click="clearStorage">Clear Storage</button>
            <hr>
            <button v-if="hasBiometrics" @click="biometricLogin">Login with Fingerprint</button>
            <p v-if="error" style="color:red">{{ error }}</p>
        </div>
    `,
    setup() {
        const apiUrl = window.CONSTANTS?.API_URLS?.AUTH_LOGON;
        const username = ref(localStorage.getItem('user') || '');
        const password = ref('');
        const rememberMe = ref(localStorage.getItem('rememberMe') === 'true');
        const isLoggedIn = ref(!!localStorage.getItem('isLoggedIn'));
        const isEnrolled = ref(!!localStorage.getItem('biometric_id'));
        const error = ref('');
        const hasBiometrics = ref(window.PublicKeyCredential !== undefined);

        onMounted(() => {
            if (isLoggedIn.value) {
                router.push('/main');
            }
        });

        const submitCredentials = async () => {
            error.value = '';
            if (!username.value) {
                error.value = 'Enter username';
                return false;
            }
            if (!password.value) {
                error.value = 'Enter password';
                return false;
            }

            try {
                const resp = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    credentials: 'include',
                    body: new URLSearchParams({
                        user: username.value,
                        password: password.value
                    })
                });

                if (resp.status === 401) {
                    error.value = 'Unauthorized: wrong username or password (401).';
                    return false;
                }

                if (resp.status === 403) {
                    error.value = 'Forbidden: access denied (403).';
                    return false;
                }

                if (resp.status !== 200) {
                    error.value = 'Authentication endpoint returned HTTP ' + resp.status;
                    return false;
                }

                const text = (await resp.text()).trim();

                // Define your success condition depending on backend response. Common options:
                if (/^(true|ok|success)$/i.test(text) || text.toLowerCase().includes('autenticaci') || text.toLowerCase().includes('logon')) {
                    return true;
                }

                try {
                    const json = JSON.parse(text);
                    if (json.Result === true || json.success === true || json.authenticated === true || json.isLoggedIn === true) {
                        return true;
                    }
                } catch (e) {
                    // not JSON, keep fall-through
                }

                error.value = 'Authentication failed: ' + text;
                return false;
            } catch (err) {
                error.value = 'Unable to connect to authentication server.';
                return false;
            }
        };

        const simpleLogin = async () => {
            const ok = await submitCredentials();
            if (!ok) return;

            const now = Date.now();
            const sessionDurationMs = 60 * 60 * 1000; // 1h for non-remember

            localStorage.setItem('user', username.value);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('rememberMe', rememberMe.value ? 'true' : 'false');

            if (rememberMe.value) {
                localStorage.removeItem('authExpires');
            } else {
                localStorage.setItem('authExpires', String(now + sessionDurationMs));
            }

            isLoggedIn.value = true;
            router.push('/main');
        };

        const clearStorage = () => {
            localStorage.clear();
            username.value = '';
            password.value = '';
            rememberMe.value = false;
            isLoggedIn.value = false;
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
                router.push('/main');
            } catch (err) {
                error.value = "Biometric login failed.";
            }
        };

        return { username, password, rememberMe, isLoggedIn, error, hasBiometrics, simpleLogin, clearStorage, biometricLogin };
    }
};

const MainScreen = {
    template: `
        <div class="card">
            <h1>Welcome Back!</h1>
            <p>Hello, {{ username }}!</p>
            <router-link to="/criadores"><button>Consulta de criadores</button></router-link>
            <button v-if="!isEnrolled" @click="registerBiometric">Enable Fingerprint Login</button>
            <button @click="logout">Logout</button>
        </div>
    `,
    setup() {
        const username = ref(localStorage.getItem('user') || '');
        const isEnrolled = ref(!!localStorage.getItem('biometric_id'));
        const error = ref('');

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
        //...
        const logout = () => {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            router.push('/');
        };

        return { username, isEnrolled, error, registerBiometric, logout };
    }
};

const AnimalDetail = {
    template: `
        <div class="card">
            <button @click="$router.go(-1)">Back</button>
            <h1>Datos del Animal - {{ cRilAnimal }}</h1>

            <div style="margin: 12px 0; display: flex; gap: 8px;">
                <button :style="{ backgroundColor: activeTab === 'datos' ? '#ADD8E6' : 'inherit' }" @click="setTab('datos')">Datos</button>
                <button :style="{ backgroundColor: activeTab === 'pedigree' ? '#ADD8E6' : 'inherit' }" @click="setTab('pedigree')">Pedigree</button>
                <button :style="{ backgroundColor: activeTab === 'produccion' ? '#ADD8E6' : 'inherit' }" @click="setTab('produccion')">Producción</button>
            </div>

            <div v-if="loading" style="display: flex; justify-content: center; align-items: center; height: 180px;">
                <div class="loader"></div>
            </div>

            <div v-else>
                <p v-if="error" style="color: red;">{{ error }}</p>
                
                <div v-else-if="activeTab === 'datos'">
                    <h2>Datos Generales</h2>
                    <table v-if="datosData" style="width: 100%; border-collapse: collapse;">
                        <tbody>
                            <tr v-for="(value, key) in datosData" :key="key">
                                <td style="background:#d4edda; padding: 8px; text-align:left; vertical-align: top; width: 30%;">{{ key }}</td>
                                <td style="padding: 8px; text-align:left;">{{ value == null ? '-' : value.toString().toUpperCase() }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p v-else style="color: #666;">No hay datos disponibles.</p>
                </div>

                <div v-else-if="activeTab === 'pedigree'">
                    <h2>Pedigree</h2>
                    <div v-if="pedigreeData" style="padding: 12px; border: 1px solid #ccc; border-radius: 4px; background: #f9f9f9;">
                        <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px;">{{ JSON.stringify(pedigreeData, null, 2) }}</pre>
                    </div>
                </div>

                <div v-else-if="activeTab === 'produccion'">
                    <h2>Producción</h2>
                    <div v-if="produccionData" style="padding: 12px; border: 1px solid #ccc; border-radius: 4px; background: #f9f9f9;">
                        <pre style="white-space: pre-wrap; word-wrap: break-word; font-size: 12px;">{{ JSON.stringify(produccionData, null, 2) }}</pre>
                    </div>
                </div>
            </div>

            <button @click="$router.go(-1)">Back</button>
        </div>
    `,
    setup() {
        const cRilAnimal = ref(router.currentRoute.params.cRilAnimal || '');
        const activeTab = ref('datos');
        const datosData = ref(null);
        const pedigreeData = ref(null);
        const produccionData = ref(null);
        const loading = ref(false);
        const error = ref('');

        const fetchAnimalDetail = async () => {
            if (!cRilAnimal.value) {
                error.value = 'Animal code not provided';
                return;
            }

            loading.value = true;
            error.value = '';
            datosData.value = null;
            pedigreeData.value = null;
            produccionData.value = null;

            try {
                const params = new URLSearchParams();
                params.set('cRilAnimal', cRilAnimal.value.toString());

                const url = `${window.CONSTANTS?.API_URLS?.ANIMAL_DETALLE}?${params.toString()}`;
                const response = await fetch(url, { credentials: 'include' });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                datosData.value = data.Datos || null;
                pedigreeData.value = data.Pedigree || null;
                produccionData.value = data.Produccion || null;
            } catch (err) {
                console.error('Error fetching animal detail:', err);
                error.value = `No se pudo cargar el detalle del animal: ${err.message}`;
            } finally {
                loading.value = false;
            }
        };

        const setTab = (tab) => {
            activeTab.value = tab;
        };

        onMounted(() => {
            fetchAnimalDetail();
        });

        return { cRilAnimal, activeTab, datosData, pedigreeData, produccionData, loading, error, setTab };
    }
};

const router = new VueRouter({ routes: [
    { path: '/', component: Login },
    { path: '/main', component: MainScreen },
    { path: '/criadores', component: RandomList },
    { path: '/establecimientos/:cCriador', component: EstablecimientosDetail },
    { path: '/establecimientos/:cCriador/animales/:cEstablecimiento', component: AnimalesDetail },
    { path: '/animal/:cRilAnimal', component: AnimalDetail }
], mode: 'hash' });

router.beforeEach((to, from, next) => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const expiresAt = Number(localStorage.getItem('authExpires')) || 0;
    const hasExpired = !rememberMe && expiresAt > 0 && Date.now() > expiresAt;

    if (hasExpired) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('authExpires');
        return next('/');
    }

    if (to.path === '/') {
        return loggedIn ? next('/main') : next();
    }

    if (!loggedIn) {
        return next('/');
    }

    next();
});

new Vue({ el: '#app', router, mounted() {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('../sw.js');
}});


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
                                <td style="padding: 8px; text-align:left;">{{ value == null ? '-' : (typeof value === 'object' ? JSON.stringify(value) : value.toString()).toUpperCase() }}</td>
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

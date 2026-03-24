const EstablecimientosDetail = {
    template: `
        <div class="card">
            <button @click="$router.go(-1)">Back</button>
            <h1>Establecimientos - Criador {{ selectedCriadorCode }}</h1>
            <div v-if="loading" style="display: flex; justify-content: center; align-items: center; height: 300px;">
                <div class="loader"></div>
            </div>
            <div v-else>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Establecimiento</th>
                            <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Prefijo</th>
                            <th style="border: 1px solid #ccc; padding: 8px; text-align: center;">Contacto</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in establecimientos" :key="item.cEstablecimiento" style="border-bottom: 1px solid #ccc; cursor: pointer;" @click="viewAnimales(item.cEstablecimiento)">
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: left;">{{ item.dEstablecimiento }}</td>
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: left;">{{ item.dPrefijo }}</td>
                            <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">{{ item.dTelefono }}</td>
                        </tr>
                    </tbody>
                </table>
                <p v-if="establecimientos.length === 0" style="text-align: center; color: #999;">No hay establecimientos registrados para este criador</p>
            </div>
            <button @click="$router.go(-1)">Back</button>
        </div>
    `,
    setup() {
        const selectedCriadorCode = ref(router.currentRoute.params.cCriador);
        const establecimientos = ref([]);
        const loading = ref(true);

        onMounted(async () => {
            try {
                const response = await fetch(window.CONSTANTS.API_URLS.CRIADORES_PUBLICOS);
                const data = await response.json();
                const allEstablecimientos = Array.isArray(data.DB.Establecimientos) ? data.DB.Establecimientos : [];
                establecimientos.value = allEstablecimientos.filter(est => est.cCriador === selectedCriadorCode.value);
            } catch (error) {
                console.error('Error fetching data:', error);
                establecimientos.value = [];
            } finally {
                loading.value = false;
            }
        });

        const viewAnimales = (cEstablecimiento) => {
            router.push(`/establecimientos/${selectedCriadorCode.value}/animales/${cEstablecimiento}`);
        };

        return { selectedCriadorCode, establecimientos, loading, viewAnimales };
    }
};

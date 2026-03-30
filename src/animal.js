
const AnimalDetail = {
    template: `
        <div class="pwa-page">
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
                    <div v-if="animal" style="width: 100%; border-collapse: collapse;">
                        <div class="prop-animal">RP</div><div class="value-animal">{{ animal.RP }}</div>
                        <div class="prop-animal">bGenero </div><div class="value-animal">{{ animal.bGenero }}</div>
                        <div class="prop-animal">bGenero </div><div class="value-animal">{{ animal.bGenero }}</div>
                        <div class="prop-animal">bGenero </div><div class="value-animal">{{ animal.bGenero }}</div>
                        <div class="prop-animal">RPMadre </div><div class="value-animal"> {{ animal.RPMadre }}</div>
                        <div class="prop-animal">RPPadre </div><div class="value-animal"> {{ animal.RPPadre }}</div>
                        <div class="prop-animal">cRilMadre </div><div class="value-animal"> {{ animal.cRilMadre }}</div>
                        <div class="prop-animal">cRilPadre </div><div class="value-animal"> {{ animal.cRilPadre }}</div>
                        <div class="prop-animal">dAnimal </div><div class="value-animal"> {{ animal.dAnimal }}</div>
                        <div class="prop-animal">dAnimalMadre </div><div class="value-animal"> {{ animal.dAnimalMadre }}</div>
                        <div class="prop-animal">dAnimalPadre </div><div class="value-animal"> {{ animal.dAnimalPadre }}</div>
                        <div class="prop-animal">dCriador </div><div class="value-animal"> {{ animal.dCriador }}</div>
                        <div class="prop-animal">dEstablecimientoAct </div><div class="value-animal"> {{ animal.dEstablecimientoAct }}</div>
                        <div class="prop-animal">dEstablecimientoNac </div><div class="value-animal"> {{ animal.dEstablecimientoNac }}</div>
                        <div class="prop-animal">dPropietario </div><div class="value-animal"> {{ animal.dPropietario }}</div>
                        <div class="prop-animal">fAlta </div><div class="value-animal"> {{ animal.fAlta }}</div>
                        <div class="prop-animal">fModif </div><div class="value-animal"> {{ animal.fModif }}</div>
                        <div class="prop-animal">fNacimiento </div><div class="value-animal"> {{ animal.fNacimiento }}</div>
                        <div class="prop-animal">dMotivoBaja </div><div class="value-animal"> {{ animal.dMotivoBaja }}</div>
                        <div class="prop-animal">fBaja </div><div class="value-animal"> {{ animal.fBaja }}</div>
                        <div class="prop-animal">bPropCompartida </div><div class="value-animal"> {{ animal.bPropCompartida }}</div>
                        <div class="prop-animal">bRegistrarCC </div><div class="value-animal"> {{ animal.bRegistrarCC }}</div>
                        <div class="prop-animal">bVenta </div><div class="value-animal"> {{ animal.bVenta }}</div>
                        <div class="prop-animal">cCodEstablecimientoPDF </div><div class="value-animal"> {{ animal.cCodEstablecimientoPDF }}</div>
                        <div class="prop-animal">cCodEstablecimientoPDFActMadre </div><div class="value-animal"> {{ animal.cCodEstablecimientoPDFActMadre }}</div>
                        <div class="prop-animal">cCodEstablecimientoPDFActPadre </div><div class="value-animal"> {{ animal.cCodEstablecimientoPDFActPadre }}</div>
                        <div class="prop-animal">cCodEstablecimientoPDFNac </div><div class="value-animal"> {{ animal.cCodEstablecimientoPDFNac }}</div>
                        <div class="prop-animal">cCodEstablecimientoPDFNacMadre </div><div class="value-animal"> {{ animal.cCodEstablecimientoPDFNacMadre }}</div>
                        <div class="prop-animal">cCodEstablecimientoPDFNacPadre </div><div class="value-animal"> {{ animal.cCodEstablecimientoPDFNacPadre }}</div>
                        <div class="prop-animal">cCriador </div><div class="value-animal"> {{ animal.cCriador }}</div>
                        <div class="prop-animal">cEstablecimientoAct </div><div class="value-animal"> {{ animal.cEstablecimientoAct }}</div>
                        <div class="prop-animal">cEstablecimientoActMadre </div><div class="value-animal"> {{ animal.cEstablecimientoActMadre }}</div>
                        <div class="prop-animal">cEstablecimientoActPadre </div><div class="value-animal"> {{ animal.cEstablecimientoActPadre }}</div>
                        <div class="prop-animal">cEstablecimientoNac </div><div class="value-animal"> {{ animal.cEstablecimientoNac }}</div>
                        <div class="prop-animal">cEstablecimientoNacMadre </div><div class="value-animal"> {{ animal.cEstablecimientoNacMadre }}</div>
                        <div class="prop-animal">cEstablecimientoNacPadre </div><div class="value-animal"> {{ animal.cEstablecimientoNacPadre }}</div>
                        <div class="prop-animal">cLinea </div><div class="value-animal"> {{ animal.cLinea }}</div>
                        <div class="prop-animal">cLineaMadre </div><div class="value-animal"> {{ animal.cLineaMadre }}</div>
                        <div class="prop-animal">cLineaPadre </div><div class="value-animal"> {{ animal.cLineaPadre }}</div>
                        <div class="prop-animal">cParto </div><div class="value-animal"> {{ animal.cParto }}</div>
                        <div class="prop-animal">cRilAnimal </div><div class="value-animal"> {{ animal.cRilAnimal }}</div>
                        <div class="prop-animal">cRilAnimalMadreOriginal </div><div class="value-animal"> {{ animal.cRilAnimalMadreOriginal }}</div>
                        <div class="prop-animal">cRilAnimalOriginal </div><div class="value-animal"> {{ animal.cRilAnimalOriginal }}</div>
                        <div class="prop-animal">cRilAnimalPadreOriginal </div><div class="value-animal"> {{ animal.cRilAnimalPadreOriginal }}</div>
                        <div class="prop-animal">iAnimal </div><div class="value-animal"> {{ animal.iAnimal }}</div>
                        <div class="prop-animal">iAnimalMadre </div><div class="value-animal"> {{ animal.iAnimalMadre }}</div>
                        <div class="prop-animal">iAnimalPadre </div><div class="value-animal"> {{ animal.iAnimalPadre }}</div>
                        <div class="prop-animal">iEmbriones </div><div class="value-animal"> {{ animal.iEmbriones }}</div>
                        <div class="prop-animal">nUsuAlta </div><div class="value-animal"> {{ animal.nUsuAlta }}</div>
                        <div class="prop-animal">nUsuModif </div><div class="value-animal"> {{ animal.nUsuModif }}</div>
                    </div>
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
        const animal = ref(null);
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
            animal.value = null;

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
                animal.value = data.Datos.Animales[0] || null;
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

        return { animal, cRilAnimal, activeTab, datosData, pedigreeData, produccionData, loading, error, setTab };
    }
};

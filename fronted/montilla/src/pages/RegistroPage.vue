<template>
  <div class="q-ma-lg">
    <div class="text-h5">
      Registro de Seguidores
    </div>
    <q-card bordered class="my-card q-ma-md">
      <q-input v-model="cedula" :dense="dense" class="q-ma-md" label="Cédula" type="number" @blur="getSeguidor" />
      <q-input v-model="nombres" :dense="dense" class="q-ma-md" label="Nombres" type="text" />
      <q-input v-model="celular" :dense="dense" class="q-ma-md" label="Celular" type="phone" :hint="wh" @blur="getStateWH" />
      <q-select outlined v-model="vereda" :options="veredas" option-value="id" option-label="nombre" label="Seleccionar Vereda" class="q-ma-md" />
      <q-btn color="primary" label="Guardar Seguidor" class="q-ma-md" @click="saveSeguidor"/>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { api } from '../boot/axios'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'RegistroPage',
  setup () {
    const $q = useQuasar
    const veredas = ref([])
    const cedula = ref(null)
    const nombres = ref(null)
    const celular = ref(null)
    const vereda: any = ref(null)
    const wh = ref('')
    return {
      $q,
      veredas,
      cedula,
      nombres,
      celular,
      vereda,
      wh
    }
  },
  mounted () {
    this.getVeredas()
  },
  methods: {
    getStateWH () {
      const data = {
        celular: this.celular
      }
      api.post('getStateWH', data).then(res => {
        const response = res.data
        console.log(response)
        if (response.status === 'error') {
          this.wh = 'Este número no es una linea de Whatsapp'
        } else {
          this.wh = ''
        }
      }).catch(res => {
        console.log(res)
      })
    },
    getSeguidor () {
      const data = {
        cedula: this.cedula
      }
      api.post('getSeguidor', data).then(res => {
        const response = res.data
        if (!response.error) {
          this.nombres = response.data.results[0].nombres
          this.celular = response.data.results[0].celular
          this.vereda = {
            id: response.data.results[0].id,
            nombre: response.data.results[0].nombre
          }
        } else {
          this.nombres = null
          this.celular = null
          this.vereda = null
        }
      }).catch(res => {
        console.log(res)
      })
    },
    saveSeguidor () {
      if (this.cedula == null || this.cedula === '' || this.nombres == null || this.nombres === '' || this.celular == null || this.celular === '' || this.vereda.id == null || this.vereda.id === '') {
        this.$q.notify({
          message: 'Todos los datos son obligatorios',
          color: 'red'
        })
        return
      }
      const colaboradorx: any = localStorage.getItem('user')
      const colaboradory = JSON.parse(colaboradorx)
      const colaborador = colaboradory.cedula
      const data = {
        cedula: this.cedula,
        nombres: this.nombres,
        celular: this.celular,
        vereda: this.vereda,
        colaborador
      }
      api.post('saveSeguidor', data).then(res => {
        const response = res.data
        if (response.error) {
          this.$q.notify({
            message: response.message,
            color: 'red'
          })
        } else {
          this.$q.notify({
            message: response.message,
            color: 'green'
          })
          this.cedula = null
          this.nombres = null
          this.celular = null
          this.vereda = null
        }
      }).catch(res => {
        console.log(res)
      })
    },
    getVeredas () {
      api.post('getVeredas').then(res => {
        const response = res.data
        this.veredas = response.data.results
      }).catch(res => {
        console.log(res)
      })
    }
  }

})
</script>

<style>
  .inputStyle{
    width: 100%;
    margin-top: 5px;
    margin-bottom: 5px;
    border: solid 1px #9f9d9d;
    border-radius: 5px;
    padding: 5px;
  }

  .my-card{
    width: 100%;
    max-width: 800px
  }

</style>

<template>
  <div class="q-pa-lg">
    <div class="text-h5">
      Conexión a Whatsapp
    </div>
    <div v-show="!qr">
      <div v-show="dataUser" class="q-ma-md">
        <!-- <div class="q-ma-sm">
          <q-btn color="primary" @click="cerrarsesion">
            Cerrar Sesión
          </q-btn>
        </div> -->
        <q-table
          flat bordered
          title="Datos del dispositivo conectado"
          :rows="rows"
          :columns="columns"
          row-key="name"
        />
    </div>
    </div>
    <div v-show="qr">
      <div v-show="whqr">
        Aún estamos preparando Whatsaspp, espere unos momentos
      </div>
      <div v-show="!whqr">
        <img :src="qrText" alt="">
      </div>
    </div>
    <div v-show="!qr">
      <div>{{ mensajeError }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { api } from '../boot/axios'
import { useQuasar } from 'quasar'
import QRCode from 'qrcode'

const columns = [
  {
    name: 'celular',
    required: true,
    label: 'Celular Whatsapp',
    align: 'left',
    field: 'celular',
    sortable: true
  },
  { name: 'nombres', align: 'center', label: 'Nombres', field: 'nombres', sortable: true },
  { name: 'Plataforma', label: 'Plataforma', field: 'plataforma', sortable: true }
]

export default defineComponent({
  name: 'ColaboradoresPage',
  setup () {
    const $q = useQuasar
    const recargarwh = ref(true)
    const qr = ref(false)
    const whqr = ref(false)
    const qrText = ref('')
    const mensajeError = ref('')
    const dataUser = ref(false)
    const rows: any = ref([])
    return {
      $q,
      recargarwh,
      qr,
      whqr,
      qrText,
      mensajeError,
      dataUser,
      rows,
      columns
    }
  },
  mounted () {
    this.startWhatsapp()
  },
  methods: {
    cerrarsesion () {
      api.post('logout').then(res => {
        console.log(res)
        this.recargarwh = true
        this.qr = false
        this.whqr = false
        this.dataUser = false
      }).catch(res => {
        console.log(res)
      })
    },
    startWhatsapp () {
      api.post('initWhatsapp').then(res => {
        const response = res.data
        try {
          if (response.client.me.server === 'c.us') {
            console.log(response)
            const data: unknown = {
              nombres: response.client.pushname,
              plataforma: response.client.platform,
              celular: response.client.me.user
            }
            this.rows.push(data)
            this.recargarwh = false
            this.dataUser = true
          }
        } catch (error) {
          console.log(error)
        }
        if (this.recargarwh) {
          this.initWhatsapp()
          if (!response.status) {
            this.whqr = true
            this.mensajeError = 'Se ha producido un error: ' + response.message
          } else {
            this.whqr = false
            this.qr = true
            this.qrText = response.data
            QRCode.toDataURL(response.data, { errorCorrectionLevel: 'H' })
              .then(url => {
                this.qrText = url
              })
              .catch(err => {
                console.error(err)
              })
            console.log('okkk')
          }
        }
      }).catch(res => {
        console.log(res, 'catch')
        if (this.recargarwh) {
          this.initWhatsapp()
        }
      })
    },
    initWhatsapp () {
      setTimeout(() => {
        this.startWhatsapp()
      }, 5000)
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
</style>

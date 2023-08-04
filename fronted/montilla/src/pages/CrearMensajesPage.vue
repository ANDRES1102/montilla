<template>
  <div class="q-ma-lg">
    <div class="text-h5">
      Crear Mensaje
    </div>

      <div style="display:flex; margin-top: 20px;">
        <div style="width: 50%;">
          <q-card bordered class="q-pa-lg">
            <q-input v-model="titulo" filled :dense="dense" class="q-ma-md" label="Titulo (para identifica el mensaje)" type="text" />
            <q-select outlined v-model="vereda" :options="veredas" option-value="id" option-label="nombre" label="Seleccionar las vereda a quién se le va a enviar el mensaje (Selección multiple)" class="q-ma-md" use-input
            use-chips
            multiple
            input-debounce="0" />
            <q-toggle v-model="saludo" label="Agregar el saludo y el nombre del seguidor" />
            <q-toggle v-model="despedida" label="Agregar despedida y firma del alcalde" />
            <q-input v-model="mensaje" filled :dense="dense" class="q-ma-md" label="Mensaje" type="textarea" @blur="getSeguidor" />
            <q-uploader
              url="http://localhost:3000/upload"
              color="teal"
              flat
              bordered
              class="q-ma-md"
              style="width: 95%"
              accept="image/*"
              label="Seleccione la imágen a cargar (Maximo 2 megas)"
              max-file-size="2048000"
              auto-upload
              @uploaded="uploaded"
            />
            <q-btn color="primary" label="Crear Mensaje" class="q-ma-md" @click="crearmensaje"/>
          </q-card>
        </div>
        <div style="width: 50%; margin-left: 20px">
          <div style="width: 100%; height: 250px; overflow-y: true; background-color: #e5e5e5; padding: 8px; border-radius: 5px;" >
            <div style="color: #383737; font-weight: bold; margin-bottom: 10px;">Muestra del Mensaje</div>
            <span v-show="saludo == true">{{ saludoText }}</span>
            <span>{{ mensaje }}</span>
            <div v-show="despedida" style="margin-top: 10px; white-space: pre-line;"> {{ despedidaText }}</div>
          </div>
        </div>
      </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../boot/axios'
export default defineComponent({
  name: 'RegistroPage',
  setup () {
    const $q = useQuasar
    const vereda: any = ref(null)
    const veredas = ref([])
    const mensaje = ref(null)
    const saludo = ref(false)
    const saludoText = ref('Hola {{ nombre_seguidor }}, ')
    const despedida = ref(true)
    const titulo = ref(null)
    const despedidaText = ref('Cordialmente, \n\r\n\rJavier Montilla \n\rAlcalde de Villarrica \n\r2024-2027')
    const conimagen = ref(false)
    return {
      $q,
      veredas,
      vereda,
      mensaje,
      saludo,
      despedida,
      despedidaText,
      saludoText,
      files: [],
      conimagen,
      titulo
    }
  },
  mounted () {
    this.getVeredas()
    this.deletecacheimage()
  },
  methods: {
    nuevo () {
      window.location.href = '#/admin/nuevo'
    },
    deletecacheimage () {
      api.post('deletecacheimage').then(res => {
        console.log(res)
      }).catch(res => {
        console.log(res)
      })
    },
    uploaded (res: any) {
      if (res.files.length > 0) {
        this.conimagen = true
      } else {
        this.conimagen = false
      }
    },
    onFileAdded (file: { nombre: any; name: any }) {
      // Agregar el nombre del archivo al objeto del archivo
      file.nombre = file.name
    },
    crearmensaje () {
      const data = {
        titulo: this.titulo,
        saludo: this.saludo,
        veredas: this.vereda,
        mensaje: this.mensaje,
        despedida: this.despedida,
        conimagen: this.conimagen
      }
      if (this.titulo === null || this.titulo === '') {
        const message = 'Es obligatorio escribir un título'
        this.$q.notify({
          message,
          color: 'red'
        })
        return false
      } else if (this.vereda === null || this.vereda.length === 0) {
        const message = 'Es obligatorio seleccionar al menos una vereda'
        this.$q.notify({
          message,
          color: 'red'
        })
        return false
      } else if (this.mensaje === null && this.conimagen === false) {
        const message = 'Es necesario cargar un mensaje o una imágen, alguno de los dos'
        this.$q.notify({
          message,
          color: 'red'
        })
        return false
      }

      api.post('saveMensaje', data).then(res => {
        const response = res.data
        const message = response.message
        const total = response.data.total
        const mensa = (message + ', se puso en cola de espera ' + total + ' mensaje(s)').toString()
        console.log(mensa)
        if (!response.error) {
          this.$q.notify({
            message,
            color: 'green'
          })

          window.location.href = '#/admin/mensajes'
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

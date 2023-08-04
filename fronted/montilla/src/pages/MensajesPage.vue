<template>
  <div class="q-ma-lg">
    <div class="text-h5">
      Publicación Mensajes Masivos por Whatsapp
    </div>
    <div class="q-ma-lg">
      <q-btn label="Crear un mensaje nuevo" color="primary" @click="nuevo"/>
    </div>
    <div>
      <q-table
      flat bordered
      title="Listado de Mensajes Creados"
      :rows="rows"
      :columns="columns"
      row-key="name"
      :filter="filter"
    >
      <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props" @click="onRowClick(props.row)">
          <q-td key="nombre" :props="props">
            {{ props.row.nombre }}
          </q-td>
          <q-td key="fecha" :props="props">
            {{ props.row.fecha }}
          </q-td>
          <q-td key="eventos" :props="props">
            <q-select filled v-model="props.row.estado.estado" option-value="id" option-label="evento" :options="options" label="Seleccione Evento" :disable="props.row.estado.id===3 || props.row.estado.id === 4" @update:model-value="cambiarevento(props.row.id, props.row.estado.estado.id)" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../boot/axios'

const columns = [
  {
    name: 'nombre',
    field: 'nombre',
    required: true,
    label: 'Nombre Identificador',
    align: 'left',
    sortable: true
  },
  { name: 'fecha', align: 'center', label: 'Fecha Registro', field: 'fecha', sortable: true },
  { name: 'eventos', label: 'Estados', field: 'eventos', align: 'left' }
]

export default defineComponent({
  name: 'RegistroPage',
  setup () {
    const $q = useQuasar
    const rows = ref([])
    const options = ref([])
    const evento = ref(null)
    return {
      $q,
      columns,
      rows,
      options,
      evento
    }
  },
  mounted () {
    this.getListMensajes()
    this.setEventos()
  },
  methods: {
    cambiarevento (idP: any, idE: any) {
      this.$q.dialog({
        title: 'Cambiar Estado',
        message: '¿Seguro que quiere el estado de esta publicación?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        const data = {
          id: idP,
          estado: idE
        }
        api.post('cambiarevento', data).then(res => {
          const response = res.data
          if (!response.error) {
            this.$q.notify({
              message: response.message,
              color: 'green'
            })
          } else {
            this.$q.notify({
              message: response.message,
              color: 'red'
            })
          }
        }).catch(res => {
          this.$q.notify({
            message: 'Error al momento de hacer conexión',
            color: 'red-14'
          })
        })
      }).onOk(() => {
        // console.log('>>>> second OK catcher')
      }).onCancel(() => {
        window.location.reload()
      }).onDismiss(() => {
        // window.location.reload()
      })
    },
    setEventos () {
      const eventos: any = [
        {
          id: 1, evento: 'Corriendo'
        },
        {
          id: 2, evento: 'Pausado'
        },
        {
          id: 3, evento: 'Cancelado'
        }
      ]
      this.options = eventos
    },
    estado (estado: any) {
      let res = ''
      switch (estado) {
        case 0:
          res = 'Pendiente'
          break
        case 1:
          res = 'Corriendo'
          break
        case 2:
          res = 'Pausado'
          break
        case 3:
          res = 'Cancelado'
          break
        case 4:
          res = 'Finalizado'
          break
      }
      return res
    },
    getListMensajes () {
      api.post('getListMensajes').then(res => {
        const response = res.data
        this.rows = response.data.results
        const nombresEstados = [
          { numero: 0, nombre: 'Pendiente' },
          { numero: 1, nombre: 'Corriendo' },
          { numero: 2, nombre: 'Pausado' },
          { numero: 3, nombre: 'Cancelado' },
          { numero: 4, nombre: 'Finalizado' }
        ]
        const cambios: any = this.rows.map((item: any) => {
          const estadoObj = nombresEstados.find((estado) => item.estado === estado.numero)
          return {
            ...item,
            estado: {
              id: item.estado,
              estado: estadoObj ? estadoObj.nombre : 'Estado Desconocido'
            }
          }
        })
        this.rows = cambios
        console.log(this.rows)
      }).catch(() => {
        console.log('ok')
      })
    },
    nuevo () {
      window.location.href = '#/admin/nuevo'
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

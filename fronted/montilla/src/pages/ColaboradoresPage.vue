<template>
  <div class="container q-pa-md">
    <div class="col-2">
      <q-btn color="primary" @click="registrarColaborador">Registrar Colaborador</q-btn>
    </div>
  </div>
  <div class="q-pa-md">
    <q-table
      flat bordered
      title="Listado de Colaboradores"
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
          <q-td key="cedula" :props="props">
            {{ props.row.cedula }}
          </q-td>
          <q-td key="nombres" :props="props">
            {{ props.row.nombres }}
          </q-td>
          <q-td key="celular" :props="props">
            {{ props.row.celular }}
          </q-td>
          <q-td key="status" :props="props">
            {{ props.row.status }}
          </q-td>
          <q-td key="cambiarestado" :props="props">
            <q-toggle
              v-model="props.row.cambiarestado"
              @update:model-value="cambiarstatus(props.row.id, props.row.cambiarestado)"
            />
          </q-td>
          <q-td key="restablecer" :props="props">
            <q-btn color="primary" @click="restablecerpassword(props.row.cedula,props.row.id)">Restablecer Contraseña</q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
  <q-dialog v-model="inception">
    <q-card>
      <q-card-section>
        <div class="text-h6">Registro de Colaboradores</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input outlined v-model="cedula" type="number" label="Número de Cédula" class="q-ma-sm" stack-label :dense="dense" />
        <q-input outlined v-model="nombres" label="Nombres Completos" stack-label class="q-ma-sm" :dense="dense" />
        <q-input outlined v-model="celular" type="number" label="Celular" class="q-ma-sm" stack-label :dense="dense" />
      </q-card-section>
      <div v-show="mensajeError!=''" color="red">{{ mensajeError }}</div>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancelar" v-close-popup color="red" @click="closeRegistroColaboradores"/>
        <q-btn flat label="Guardar Colaborador" @click="saveRegistroColaboradores" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { api } from '../boot/axios'
import { useQuasar, Notify } from 'quasar'

const columns = [
  {
    name: 'cedula',
    field: 'cedula',
    required: true,
    label: 'Cédula',
    align: 'left',
    sortable: true
  },
  { name: 'nombres', align: 'center', label: 'Nombres', field: 'nombres', sortable: true },
  { name: 'celular', align: 'center', label: 'Celular', field: 'celular', sortable: true },
  { name: 'cambiarestado', label: 'Cambiar Estado', field: 'cambiarestado' },
  { name: 'restablecer', label: 'Restablecer Contraseña', field: 'restablecer' }
]

export default defineComponent({
  name: 'ColaboradoresPage',
  setup () {
    const rows = ref([])
    const $q = useQuasar()
    const val = ref(true)

    return {
      columns,
      rows,
      filter: ref(''),
      selected: ref([]),
      val,
      $q,
      inception: ref(false),
      cedula: ref(null),
      nombres: ref(null),
      celular: ref(null),
      mensajeError: ref('')
    }
  },
  methods: {
    saveRegistroColaboradores () {
      if (this.cedula == null || this.cedula === '' || this.nombres == null || this.nombres === '' || this.celular == null || this.celular === '') {
        this.$q.notify({
          message: 'Todos los datos son obligatorios',
          color: 'red'
        })
        return
      }
      const data = {
        cedula: this.cedula,
        nombres: this.nombres,
        celular: this.celular
      }
      api.post('saveRegistroColaboradores', data).then(res => {
        const response = res.data
        if (!response.error) {
          this.$q.notify({
            message: response.message,
            color: 'green'
          })
          this.getListColaborador()
          this.inception = false
          this.closeRegistroColaboradores()
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
    },
    closeRegistroColaboradores () {
      this.cedula = null
      this.nombres = null
      this.celular = null
    },
    registrarColaborador () {
      this.inception = true
    },
    restablecerpassword (cedula: unknown, id: number) {
      const data = {
        id,
        cedula
      }
      this.$q.dialog({
        title: 'Restablecer Contraseña',
        message: '¿Seguro que quiere restablecer la contraseña?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        api.post('restablecerpassword', data).then(res => {
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
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    },
    cambiarstatus (id: unknown, status: unknown) {
      const data = {
        id,
        status: status ? 'activo' : 'inactivo'
      }
      console.log(status)
      console.log(data)
      api.post('changeStatus', data).then(res => {
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
      }).catch(() => {
        this.$q.notify({
          message: 'Error al momento de hacer conexión',
          color: 'red-14'
        })
      })
    },
    getListColaborador () {
      api.post('listColaboradores').then(res => {
        const response = res.data
        const colaboradores = response.data.colaboradores.results
        this.rows = colaboradores
        const cambios: any = this.rows.map((item: any) => {
          console.log(item.cambiarestado, item.cambiarestado === 1)
          return {
            ...item,
            cambiarestado: item.cambiarestado === 1
          }
        })
        this.rows = cambios
        console.log(this.rows, 'colaboradores')
      }).catch(() => {
        this.$q.notify({
          message: 'Error al momento de hacer conexión',
          color: 'red-14'
        })
      })
    }
  },
  mounted () {
    this.getListColaborador()
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

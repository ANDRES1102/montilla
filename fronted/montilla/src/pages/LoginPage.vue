<template>
  <q-page class="bg-light-green window-height window-width row justify-center items-center">
    <div class="column">
      <div class="row">
        <h5 class="text-h3 text-white q-my-md">Montilla Alcalde</h5>
      </div>
      <div class="row">
        <q-card square bordered class="q-pa-lg shadow-1">
          <q-card-section>
            <q-form class="q-gutter-md">
              <q-input square filled clearable v-model="cedula" type="number" label="Cédula"  />
              <q-input square filled clearable v-model="password" type="password" label="Contraseña" />
            </q-form>
          </q-card-section>
          <q-card-actions class="q-px-md">
            <q-btn unelevated color="light-green-7" size="lg" class="full-width" label="Entrar" @click="entrar" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { api } from '../boot/axios'
import { useQuasar, Notify } from 'quasar'

export default {
  name: 'LoginVue',
  setup () {
    const $q = useQuasar()
  },
  data () {
    return {
      cedula: '',
      password: ''
    }
  },
  methods: {
    entrar () {
      const data = {
        cedula: this.cedula,
        password: this.password
      }

      api.post('login', data).then(res => {
        const response = res.data
        console.log(response)
        const error = response.error
        const message = response.message
        if (error) {
          this.$q.notify({
            message,
            color: 'red'
          })
        } else {
          const role = response.data.role.results[0].role
          localStorage.setItem('user', JSON.stringify({
            cedula: this.cedula,
            role
          }))
          this.$q.notify({
            message,
            color: 'secondary'
          })
          window.location.href = '#' + role
        }
      }).catch(() => {
        this.$q.notify({
          message: 'Error al momento de hacer conexión',
          color: 'red-14'
        })
      })
    }
  }
}
</script>

<style>
.q-card {
  width: 360px;
}
</style>

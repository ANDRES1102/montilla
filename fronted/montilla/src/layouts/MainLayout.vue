<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          Montilla Alcalde
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-scroll-area class="fit">
          <q-list>

            <template v-for="(menuItem, index) in menuList" :key="index">
              <q-item clickable :active="menuItem.label === 'Outbox'" v-ripple :to="menuItem.to" @click="click(menuItem.click)">
                <q-item-section avatar>
                  <q-icon :name="menuItem.icon" />
                </q-item-section>
                <q-item-section>
                  {{ menuItem.label }}
                </q-item-section>
              </q-item>
              <q-separator :key="'sep' + index"  v-if="menuItem.separator" />
            </template>

          </q-list>
        </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
    <q-dialog v-model="inception">
      <q-card>
        <q-card-section>
          <div class="text-h6">
            Cambiar Contraseña
          </div>
          <div>
            Cambia la contraseña por una diferente a la actual
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input outlined v-model="password" type="password" label="Contraseña Actual" class="q-ma-sm" stack-label :dense="dense" />
          <q-input outlined v-model="nueva" type="password" label="Contraseña Nueva" stack-label class="q-ma-sm" :dense="dense" />
          <q-input outlined v-model="repetir" type="password" label="Repetir Contraseña Nueva" class="q-ma-sm" stack-label :dense="dense" />
        </q-card-section>
        <div v-show="mensajeError!=''" color="red">{{ mensajeError }}</div>
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancelar" v-close-popup color="red" @click="closeRegistroColaboradores"/>
          <q-btn flat label="Cambiar Contraseña" @click="cambiarpassword" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
import { ref } from 'vue'
import { api } from '../boot/axios'
import { useQuasar, Notify } from 'quasar'

const menuList = [
  {
    icon: 'sms',
    label: 'Whatsapp',
    separator: false,
    to: '/admin/whatsapp',
    click: 'whatsapp'
  },
  {
    icon: 'add',
    label: 'Colaboradores',
    separator: false,
    to: '/admin/colaboradores',
    click: 'colaboradores'
  },
  {
    icon: 'group_add',
    label: 'Registrar Seguidores',
    separator: false,
    to: '/admin/registro',
    click: 'seguidores'
  },
  {
    icon: 'send',
    label: 'Mensajes',
    separator: true,
    to: '/admin/mensajes',
    click: 'mensajes'
  },
  {
    icon: 'logout',
    label: 'Cerrar Sesion',
    separator: false,
    to: '/',
    click: 'logout'
  }
]

export default {
  setup () {
    const leftDrawerOpen = ref(false)
    const inception = ref(false)
    const $q = useQuasar()
    const password = ref(null)
    const nueva = ref(null)
    const repetir = ref(null)

    return {
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      menuList,
      inception,
      $q,
      password,
      nueva,
      repetir
    }
  },
  mounted () {
    this.getInit()
    this.updatePassword()
  },
  methods: {
    cambiarpassword () {
      if (this.password == null || this.password === '' || this.nueva == null || this.nueva === '' || this.repetir == null || this.repetir === '') {
        this.$q.notify({
          message: 'Todos los datos son obligatorios',
          color: 'red'
        })
        return false
      } else if (this.nueva !== this.repetir) {
        this.$q.notify({
          message: 'La contraseña nueva no coincide con la contraseña a repetir',
          color: 'red'
        })
        return false
      }

      const user = localStorage.getItem('user')
      const users = JSON.parse(user)

      const data = {
        cedula: users.cedula,
        password: this.password,
        nueva: this.nueva,
        repetir: this.repetir
      }

      api.post('changepassword', data).then(res => {
        console.log(res)
        const response = res.data
        const message = response.message
        if (!response.error) {
          this.$q.notify({
            message,
            color: 'green'
          })
          this.password = null
          this.nueva = null
          this.repetir = null
          this.inception = false
        } else {
          this.$q.notify({
            message,
            color: 'red'
          })
        }
      }).catch(res => {
        console.log(res)
      })
    },
    updatePassword () {
      const user = localStorage.getItem('user')
      const users = JSON.parse(user)
      const data = {
        cedula: users.cedula
      }

      api.post('validatepassword', data).then(res => {
        const response = res.data
        if (!response.error) {
          console.log('cambiar contraseña')
          this.inception = true
        }
      }).catch(res => {
        console.log(res)
      })
    },
    click (click) {
      switch (click) {
        case 'logout':
          localStorage.removeItem('user')
          break
      }
    },
    getInit () {
      const params = this.$route.path
      const data = JSON.parse(localStorage.getItem('user'))
      const role = data.role
      if (role !== 'admin' && params.includes('admin')) {
        window.location.href = '#/colaborador/registro'
      }
    }
  }
}
</script>

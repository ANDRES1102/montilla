"use strict";(globalThis["webpackChunkmontilla"]=globalThis["webpackChunkmontilla"]||[]).push([[702],{5702:(e,l,a)=>{a.r(l),a.d(l,{default:()=>Z});var s=a(9835);const t={class:"column"},o=(0,s._)("div",{class:"row"},[(0,s._)("h5",{class:"text-h3 text-white q-my-md"},"Montilla Alcalde")],-1),r={class:"row"};function n(e,l,a,n,d,c){const u=(0,s.up)("q-input"),i=(0,s.up)("q-form"),m=(0,s.up)("q-card-section"),p=(0,s.up)("q-btn"),w=(0,s.up)("q-card-actions"),h=(0,s.up)("q-card"),g=(0,s.up)("q-page");return(0,s.wg)(),(0,s.j4)(g,{class:"bg-light-green window-height window-width row justify-center items-center"},{default:(0,s.w5)((()=>[(0,s._)("div",t,[o,(0,s._)("div",r,[(0,s.Wm)(h,{square:"",bordered:"",class:"q-pa-lg shadow-1"},{default:(0,s.w5)((()=>[(0,s.Wm)(m,null,{default:(0,s.w5)((()=>[(0,s.Wm)(i,{class:"q-gutter-md"},{default:(0,s.w5)((()=>[(0,s.Wm)(u,{square:"",filled:"",clearable:"",modelValue:d.cedula,"onUpdate:modelValue":l[0]||(l[0]=e=>d.cedula=e),type:"number",label:"Cédula"},null,8,["modelValue"]),(0,s.Wm)(u,{square:"",filled:"",clearable:"",modelValue:d.password,"onUpdate:modelValue":l[1]||(l[1]=e=>d.password=e),type:"password",label:"Contraseña"},null,8,["modelValue"])])),_:1})])),_:1}),(0,s.Wm)(w,{class:"q-px-md"},{default:(0,s.w5)((()=>[(0,s.Wm)(p,{unelevated:"",color:"light-green-7",size:"lg",class:"full-width",label:"Entrar",onClick:c.entrar},null,8,["onClick"])])),_:1})])),_:1})])])])),_:1})}var d=a(4136),c=a(9302);a(6827);const u={name:"LoginVue",setup(){(0,c.Z)()},data(){return{cedula:"",password:""}},methods:{entrar(){const e={cedula:this.cedula,password:this.password};d.api.post("login",e).then((e=>{const l=e.data;console.log(l);const a=l.error,s=l.message;if(a)this.$q.notify({message:s,color:"red"});else{const e=l.data.role.results[0].role;localStorage.setItem("user",JSON.stringify({cedula:this.cedula,role:e})),this.$q.notify({message:s,color:"secondary"}),window.location.href="#"+e}})).catch((()=>{this.$q.notify({message:"Error al momento de hacer conexión",color:"red-14"})}))}}};var i=a(1639),m=a(9885),p=a(4458),w=a(3190),h=a(8326),g=a(6611),f=a(1821),q=a(4455),b=a(9984),y=a.n(b);const C=(0,i.Z)(u,[["render",n]]),Z=C;y()(u,"components",{QPage:m.Z,QCard:p.Z,QCardSection:w.Z,QForm:h.Z,QInput:g.Z,QCardActions:f.Z,QBtn:q.Z})}}]);
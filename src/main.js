import {createApp} from 'vue';
import OCRPage from './ocrpage.vue';
import PrimeVue from 'primevue/config';
import FileUpload from 'primevue/fileupload';
import titleMixin from './mixins/titleMixin'

import 'primevue/resources/themes/saga-blue/theme.css'       //theme
import 'primevue/resources/primevue.min.css'                 //core css
import 'primeicons/primeicons.css'                        //icons


const app = createApp(OCRPage);

app.use(PrimeVue);
app.component('FileUpload', FileUpload);
app.mixin(titleMixin);

app.mount('#app');
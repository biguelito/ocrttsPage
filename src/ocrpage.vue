<template>
  <div>
    <div class="feature-intro" id="title">
      <h1>OCR-TTS</h1>
    </div>

    <FileUpload 
      ref="file"
      accept=".jpeg,.jpg" 
      :maxFileSize="50000000"
      :multiple="true"
      :customUpload="true"
      @uploader="doOCTTTS"
    >
      <template #empty>
        <p>Insert images here.</p>
      </template>
    </FileUpload>
    <br><br>
  
    <audio 
        ref="audio"
        controls
    ></audio>    
    <br><br>
    
    <span 
      class="textImage"
      v-if="image_name != null && reading_image == false"
    >
      <strong>{{ image_name }}</strong> 
    </span>
    <br>
    <span 
      class="textImage"
      style="white-space: pre;"
    >
      {{ text_image }} 
      <i 
        class="pi pi-spin pi-spinner" 
        style="font-size: 1rem"
        v-if="reading_image"
      ></i>
    </span>
    

  </div>
</template>

<script>

export default {
  data() {
    return {
      text_image: "Waiting an upload",
      audio_decoded: null,
      reading_image: false,
      image_name: null
    }
  },

  methods:{
    async doOCTTTS(event) {      
      let image = event.files[0]
      this.image_name = image.name
      this.text_image = `Reading ${this.image_name}`
      this.$refs.audio.src = null
      this.reading_image = true

      const reader = new FileReader();
      let blob = await fetch(image.objectURL).then(r => r.blob());

      reader.onload = () => {
        const data = new Uint8Array(reader.result);
        const url = process.env.VUE_APP_OCRURL;
        const options = {
          method: 'POST',
          body: data,
          headers: {
              'Content-Type': 'application/octet-stream'
          }
        };
        fetch(url, options)
          .then(response => {
            if (response.status == 200) 
            {
              response.json().then((data) => {
                this.reading_image = false
                this.text_image = data.text

                var audioDecode = window.atob(data.audio_bytes)
                var audioArray = new Uint8Array(new ArrayBuffer(audioDecode.length));
                for(var i = 0; i < audioDecode.length; i++) {
                  audioArray[i] = audioDecode.charCodeAt(i);
                }

                try{
                  const audio = this.$refs.audio
                  const blob = new Blob([audioArray], { type: 'audio/mp3' })
                  audio.src = URL.createObjectURL(blob);
                  // audio.play();  
                  this.$refs.file.files.shift() 
                }catch{
                  console.log('Error decoding audio content')  
                }
              })
            } 
            else if (response.status == 413)
            {
              response.json().then((data) => {
                this.reading_image = false
                this.text_image = data.errorMessage
              })
            }
            else {
              this.reading_image = false
              this.text_image = 'Erro reading message, try again'
            }
          }
        )
      };

      reader.readAsArrayBuffer(blob); 
    },
  },
}

</script>

<style>
#app {
  -moz-osx-font-smoothing: grayscale;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #2c3e50;
}

#title {
  text-align: center;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 60px;
  color:black;
  font-size: 20px;
}

audio {
    display: block;
    margin-top: 50px;
    margin-bottom: 50px;
    margin: auto
}

.textImage {
  display: flex;
  justify-content: center;
}
</style>
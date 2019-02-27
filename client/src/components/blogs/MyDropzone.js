import React, { Component } from 'react'
import FineUploaderTraditional from 'fine-uploader-wrappers'
import Dropzone from 'react-fine-uploader/dropzone'

// ...or load this specific CSS file using a <link> tag in your document
import 'react-fine-uploader/gallery/gallery.css'

const uploader = new FineUploaderTraditional({
    options: {
        chunking: {
            enabled: true,
            partSize:2000000
        },
        deleteFile: {
            enabled: true,
            endpoint: '/uploads'
        },
        request: {
            endpoint: '/api/upload'
        },
        retry: {
            enableAuto: true
        }
    }
})

const UploadComponent = (
    <Dropzone style={ { border: '1px dotted', height: 200, width: 200 } }
              uploader={ uploader }
    >
        <span>Drop Files Here</span>
    </Dropzone>
)


export default UploadComponent

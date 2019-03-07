// BlogFormReview shows users their form inputs for review
import _ from 'lodash';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import formFields from './formFields';
import {withRouter} from 'react-router-dom';
import * as actions from '../../actions';
import Gallery from 'react-fine-uploader';
import FineUploaderS3, { qq } from 'fine-uploader-wrappers/s3'
import PauseResumeButton from 'react-fine-uploader/pause-resume-button'
import Thumbnail from 'react-fine-uploader/thumbnail'
import 'react-fine-uploader/gallery/gallery.css'
import axios from "axios";

const uploader =new FineUploaderS3({
    options: {
        debug: true,
        multiple: true,
        // validation: {
        //     allowedExtensions: ['jpeg', 'jpg', 'png', 'gif', 'svg'],
        //     sizeLimit: 5120000 // 50 kB = 50 * 1024 bytes
        // },
        // cors: {
        //     expected: true,
        //     sendCredentials: true
        // },
        objectProperties: {
            region:'eu-west-2',
            acl: 'private',
// key:'AKIAJLLTRF7OZTQ72NVA'
            // acl: 'public-read',
            // 'x-amz-credential'
            // :'AKIAJLLTRF7OZTQ72NVA/20190306/eu-west-2/s3/aws4_request'
        },
        request: {
            // endpoint: "https://s3.eu-west-2.amazonaws.com/ziggy-upload-test",

            endpoint: "https://ziggy-upload-test.s3.eu-west-2.amazonaws.com",
            // endpoint: "https://ziggy-upload-test.amazonaws.com",
            accessKey: "AKIAJLLTRF7OZTQ72NVA"
        },
        signature: {
            region:'eu-west-2',
            version: 4,
            endpoint: "/api/s3handler",
        },
        maxConnections: 6,
        chunking: {
            enabled: true,
            mandatory: true,
            concurrent: { enabled: true }
        },
        resume: {
            enabled: true
        },
       autoUpload:true,
        uploadSuccess: {
            endpoint: "/fineUploader/s3/endpoint-cors.php?success",
        },
        iframeSupport: {
            localBlankPagePath: "/fineUploader/s3/success.html"
        },
        retry: {
            enabledAuto: true,
            showButton: true
        },
        cors: {
            expected: true
        },

        deleteFile: {
            enabled: true,
            method: "POST",
            endpoint: "/fineUploader/s3/endpoint-cors.php"
        },
        callbacks: {
            onComplete: function(id, name, response) {
                console.log('Completed for ID: %s, with name: %s', id, name);
            }
        }
    }
});
const fileInputChildren = <span>Choose files</span>
class BlogFormReview extends Component {

    componentDidMount() {
        uploader.on('statusChange', (id, oldStatus, newStatus) => {
            if (newStatus === 'submitted') {
                const submittedFiles = this.state.submittedFiles

                submittedFiles.push(id)
                this.setState({ submittedFiles })
            }
        })
        // uploader.uploadStoredFiles();
    }

    state = {
        submittedFiles: [],
        files: [],
        file:null
    }

    renderFields() {
        const {formValues} = this.props;

        return _.map(formFields, ({name, label}) => {
            return (
                <div key={name}>
                    <label>{label}</label>
                    <div>{formValues[name]}</div>
                </div>
            );
        });
    }

    renderButtons() {
        const {onCancel} = this.props;

        return (
            <div>
                <button
                    className="yellow darken-3 white-text btn-flat"
                    onClick={onCancel}
                >
                    Back
                </button>
                <button className="green btn-flat right white-text">
                    Save Blog
                    <i className="material-icons right">email</i>
                </button>
            </div>
        );
    }

    onSubmit(event) {
        event.preventDefault();
        const {submitBlog, history, formValues} = this.props;
        console.log(uploader.methods.getFile(this.state.submittedFiles[0]));
        submitBlog(formValues, uploader.methods.getFile(this.state.submittedFiles[0]), history);

     //    uploader.on('upload', () => {
     //        const uploadConfig = axios.get('/api/upload');
     //        console.log(uploadConfig)
     //        submitBlog(formValues, uploader.methods.getFile(this.state.submittedFiles[0]), history);
     //        uploader.methods.setEndpoint('hohoho');
     //        uploader.methods.setParams({
     //            ajax: true
     //        });
     //        console.log('upload')
     //
     //    })
     //    uploader.on('submit', () => {
     // console.log('submiitasdfasdfasf')
     //    })
    }

    render() {
        const {files} = this.state;
        return (

            <form onSubmit={this.onSubmit.bind(this)}>
                <h5>Please confirm your entries...</h5>
                {this.renderFields()}
                <section>

                    <Gallery
                        fileInput-children={ fileInputChildren }
                        dropzone-disabled={ false } uploader={ uploader } />

                    <div>
                        {
                            this.state.submittedFiles.map(id => {
                                <div key={id}>
                                    <Thumbnail id={id} uploader={uploader}/>
                                    <PauseResumeButton id={id} uploader={uploader}/>
                                </div>
                            } )
                        }

                            </div>
                </section>
                {this.renderButtons()}
            </form>
        );
    }
}

function mapStateToProps(state) {
    return {formValues: state.form.blogForm.values};
}

export default connect(mapStateToProps, actions)(withRouter(BlogFormReview));

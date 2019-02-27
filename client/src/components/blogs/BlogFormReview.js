// BlogFormReview shows users their form inputs for review
import _ from 'lodash';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import formFields from './formFields';
import {withRouter} from 'react-router-dom';
import * as actions from '../../actions';
import request from "superagent";
import Gallery from 'react-fine-uploader';
import FineUploaderTraditional from 'fine-uploader-wrappers';
import FileInput from 'react-fine-uploader/file-input'
import PauseResumeButton from 'react-fine-uploader/pause-resume-button'
import Thumbnail from 'react-fine-uploader/thumbnail'
import 'react-fine-uploader/gallery/gallery.css'
const thumbsContainer = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16
};

const thumb = {
    display: 'inline-flex',
    borderRadius: 2,
    border: '1px solid #eaeaea',
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: 'border-box'
};

const thumbInner = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden'
}

const img = {
    display: 'block',
    width: 'auto',
    height: '100%'
};
const uploader =new FineUploaderTraditional({
    options: {
        request: {
            endpoint: 'api/upload/endpoint'
        },
        chunking: {
            enabled: true
        },
        retry: {
            enableAuto: true
        },
       autoUpload:false
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
    }

    onDrop(files) {
        console.log(files)
        this.setState({
            files: files.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            }))
        });

        // POST to a test endpoint for demo purposes
        const req = request.post('https://httpbin.org/post');

        files.forEach(file => {
            req.attach(file.name, file);
        });

        req.end();
    }

    render() {
        const {files} = this.state;
        const thumbs = files.map(file => (
            <div style={thumb} key={file.name}>
                <h4>{file.name}</h4>
                <div style={thumbInner}>
                    <img
                        src={file.preview}
                        style={img}
                    />
                </div>
            </div>
        ));

        return (

            <form onSubmit={this.onSubmit.bind(this)}>
                <h5>Please confirm your entries...</h5>
                {this.renderFields()}
                <section>
                    <FileInput multiple accept='image/*' uploader={ uploader }>
                        <span class="icon ion-upload">Choose Files</span>
                    </FileInput>

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

import React, { useState } from 'react';
import axios from 'axios';
import ModelViewer from './Components/ModelViewer';
import './App.css';

const App = () => {
    const [file, setFile] = useState(null);
    const [filename, setFilename] = useState(null);

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post('http://127.0.0.1:5000/upload', formData);
        setFilename(response.data.filename);
    };

    return (
        <div>
            <h1>3D Model Viewer</h1>
            <form onSubmit={handleFileUpload}>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <button type="submit">Upload</button>
            </form>
            {filename && <ModelViewer filename={filename} />}
        </div>
    );
};

export default App;
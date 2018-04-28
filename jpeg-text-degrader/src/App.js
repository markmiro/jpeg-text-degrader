import React, { Component } from "react";

class App extends Component {
  render() {
    return (
      <div>
        <div style={{ border: "3px solid green" }}>
          <textarea value="lorem" />
          <select>
            <option>Marbled Rainbow</option>
          </select>
          <a href="#" className="button">
            Save Creation
          </a>
          <button style={{ position: "relative" }}>
            Open Creation
            <input id="image-uploader" type="file" accept="image/*" />
          </button>
          <label>
            <input type="checkbox" checked />
            Is Running
          </label>
          <canvas
            width={600}
            height={400}
            style={{ border: "3px solid red", display: "block" }}
          />
          <button>Download JPEG</button>
          <select>
            <option>GIF</option>
            <option>WEBM</option>
          </select>
          <select>
            <option>Record</option>
            <option>Restart + Record</option>
          </select>
          <button>Start Recording</button>
          <button>Finish Recording</button>
          <div style={{ border: "3px solid yellow" }}>
            <h1>Recorded</h1>
            <button>Stop Processing</button>
            <img src="" />
            <a href="#" className="button">
              Download GIF
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default App;

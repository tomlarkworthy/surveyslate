//# Draggable _LocalFile_ _fileInput_ 
// https://observablehq.com/@tomlarkworthy/fileinput

//import { LocalFile } from '@mbostock/localfile'
//import { LocalFile } from '/components/localfile.js';

import * as htl from "/components/htl@0.3.1.js";

import * as Inputs from "/components/inputs_observable.js";
import {FileAttachment} from "observablehq:stdlib";

//import { view } from '@tomlarkworthy/view'
import { viewUI } from '/components/view.js';


export function fileInput({ prompt = 'Drag a file here', accept = null } = {}) {
  const output = Inputs.input();
  const input = htl.html`<input type="file">`;
  input.oninput = () => {
    output.value = new LocalFile(input.files[0]);
    output.dispatchEvent(new Event("input", { bubbles: true }));
  };

  input.ondragenter = evt => {
    input.classList.add("hover");
  };

  input.ondragleave = evt => {
    input.classList.remove("hover");
  };

  input.ondrop = evt => {
    input.classList.remove("hover");
  };

/// NOTE: Color definitions changed from original to accommodate dark mode.

  return viewUI`<div class="dropfileContainer">
    <style>
      .dropfileContainer {
        position: relative;
        color-scheme: light dark;
      }

      .dropfileContainer > input[type=file] {
        width: 100%;
        height: 80px;
        border-radius: 10px;
        border: 2px solid;
        padding-top: 10px;
        cursor: pointer;
        background: var(--drop-bg, #fefef2);
        color: var(--drop-fg, inherit);
      }

      .dropfileContainer > input[type=file].hover {
        background: var(--drop-bg-hover, #deded2);
      }

      .dropfileContainer > p {
        position: absolute;
        margin-top: 30px;
        margin-left: auto;
        margin-right: auto;
        left: 0;
        right: 0;
        text-align: center;
        pointer-events: none;
        color: var(--drop-text, inherit);
      }

      /* Light mode defaults */
      @media (prefers-color-scheme: light) {
        .dropfileContainer {
          --drop-bg: #fefef2;
          --drop-bg-hover: #deded2;
          --drop-fg: #000000;
          --drop-text: #333333;
        }
      }

      /* Dark mode overrides */
      @media (prefers-color-scheme: dark) {
        .dropfileContainer {
          --drop-bg: #1f2933;       /* dark slate */
          --drop-bg-hover: #323f4b; /* slightly lighter on hover */
          --drop-fg: #f9fafb;
          --drop-text: #e5e7eb;
        }
      }
    </style>

    <p>
      ${prompt}
    </p>
    ${input}
    <!-- ${['...', output]} -->
  </div>`;
}

// --- Use the real attachment as the "AbstractFile" base and as a fallback value ---
export const emptyAttachment = FileAttachment("empty@1"); // <-- must be a real SQLite DB

// Derive AbstractFile from a real attachment (same as in notebooks)
export const AbstractFile = emptyAttachment.constructor.__proto__;


export class LocalFile extends AbstractFile {
  constructor(file) {
    super(file.name);
    Object.defineProperty(this, "_", {value: file});
    Object.defineProperty(this, "_url", {writable: true});
  }
  async url() {
    return this._url || (this._url = URL.createObjectURL(this._));
  }
  async blob() {
    return this._;
  }
  async stream() {
    return this._.stream();
  }
};

